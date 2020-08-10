import { Dict, dictGet, dictHas, dictSet, Rule, Symb, Term, unreachable } from "../../Parser/Types";
import { gen, indexed, repeat, every, range, map, intersectionMut } from "../../Parser/Utils";
import { arity, decons, head, isSomething, isVar, lhs, Maybe, setEq, swapMut, tail, zip } from "../Utils";
import { DecisionTree, makeFail, makeLeaf, makeSwitch, Switch } from "./DecisionTree";

// Based on "Compiling Pattern Matching to Good Decision Trees" by Luc Maranget

export type AnyPat = '_';
export const _: AnyPat = '_';

export type FunPattern = { name: Symb, args: Pattern[] };
export type Pattern = FunPattern | AnyPat;

type ClauseMatrixRow = Pattern[];
type ClauseMatrixColumn = Pattern[];

export type ClauseMatrix = {
    dims: [number, number], // rows * cols
    patterns: ClauseMatrixRow[],
    actions: OccTerm[]
};

export const patternOf = (term: Term): Pattern => {
    if (isVar(term)) return _;
    return { name: term.name, args: term.args.map(patternOf) };
};

export const occurencesOf = (
    term: Term,
    sigma: Dict<IndexedOccurence> = {},
    subTermIndex = 0
): Dict<IndexedOccurence> => {
    if (isVar(term)) return dictSet(sigma, term, { index: subTermIndex, pos: [] });
    const collectOccurences = (
        t: Term,
        sigma: Dict<IndexedOccurence>,
        localOffset = 0,
        parent: IndexedOccurence
    ): void => {
        const occ: IndexedOccurence = {
            index: parent.index,
            pos: [...parent.pos, localOffset]
        };

        if (isVar(t)) {
            sigma[t] = occ;
            return;
        }

        t.args.forEach((s, idx) => {
            collectOccurences(s, sigma, idx, occ);
        });
    };

    for (const [t, i] of indexed(term.args)) {
        collectOccurences(t, sigma, i, { index: subTermIndex, pos: [] });
    }

    return sigma;
};

export type OccTerm = IndexedOccurence | { name: Symb, args: OccTerm[] };

export const substituteOccurences = (term: Term, occs: Dict<IndexedOccurence>): OccTerm => {
    if (isVar(term)) {
        if (dictHas(occs, term)) {
            return dictGet(occs, term);
        } else {
            throw new Error(`unbound variable: ${term} in ${JSON.stringify(occs)}`);
        }
    }
    return {
        name: term.name,
        args: term.args.map(arg => substituteOccurences(arg, occs))
    };
};

export const occTermOfRule = ([lhs, rhs]: Rule): OccTerm => {
    const sigma: Dict<IndexedOccurence> = {};

    for (const [arg, i] of indexed(lhs.args)) {
        occurencesOf(arg, sigma, i);
    }

    return substituteOccurences(rhs, sigma);
};

// all the rules must share the same head symbol and arity
export const clauseMatrixOf = (rules: Rule[]): ClauseMatrix => {
    return {
        patterns: rules.map(rule => lhs(rule).args.map(patternOf)),
        dims: [rules.length, arity(rules)], // rows * cols
        actions: rules.map(occTermOfRule)
    };
};

const specializeRow = (
    row: ClauseMatrixRow,
    ctor: Symb,
    arity: number
): Maybe<ClauseMatrixRow> => {
    const [p, ps] = decons(row);
    if (p === _) return [...repeat(_, arity), ...ps];
    if (p.name === ctor) return [...p.args, ...ps];
};

export const specializeClauseMatrix = (
    matrix: ClauseMatrix,
    c: Symb,
    arity: number
): ClauseMatrix => {
    const patterns = matrix.patterns
        .map(row => specializeRow(row, c, arity));

    const actions = [...zip(patterns, matrix.actions)]
        .filter(([p, _a]) => p)
        .map(([_p, a]) => a);

    return {
        patterns: patterns.filter(isSomething),
        dims: [actions.length, arity + matrix.dims[1] - 1],
        actions
    };
};

const defaultRow = (row: ClauseMatrixRow): Maybe<ClauseMatrixRow> => {
    const [p, ps] = decons(row);
    if (p === _) return ps;
};

export const defaultClauseMatrix = (matrix: ClauseMatrix): ClauseMatrix => {
    const patterns = matrix.patterns.map(defaultRow);

    const actions = [...zip(patterns, matrix.actions)]
        .filter(([p, _a]) => p)
        .map(([_p, a]) => a);

    return {
        patterns: patterns.filter(isSomething),
        dims: [actions.length, matrix.dims[1] - 1],
        actions
    };
};

const getColumn = (matrix: ClauseMatrix, i: number): ClauseMatrixColumn => {
    const col: Pattern[] = [];
    for (const row of matrix.patterns) {
        col.push(row[i]);
    }
    return col;
};

// returns the selected columns indices
type ColumnSelectionHeuristic = (matrix: ClauseMatrix) => number[];

export const selectColumn = (matrix: ClauseMatrix): number => {
    for (let i = 0; i < matrix.dims[1]; i++) {
        if (getColumn(matrix, i).some(p => p !== _)) {
            return i;
        }
    }

    unreachable('No valid column found');
};

const bestCandidates = (...scores: number[]): number[] => {
    const maxScore = Math.max(...scores);

    const indices = [];

    for (const [score, idx] of indexed(scores)) {
        if (score === maxScore) {
            indices.push(idx);
        }
    }

    return indices;
};

// p
export const heuristicNeededPrefix: ColumnSelectionHeuristic = (matrix: ClauseMatrix): number[] => {
    const score = (col: number) => {
        const allNeeded = (upToRow: number): boolean => {
            for (let row = 0; row <= upToRow; row++) {
                if (!isNeeded(row, col, matrix)) return false;
            }

            return true;
        };

        for (let row = matrix.dims[0] - 1; row >= 0; row--) {
            if (allNeeded(row)) return row;
        }

        return 0;
    };

    return bestCandidates(...map(range(0, matrix.dims[1] - 1), col => score(col)));
};

// b
export const heuristicSmallBranchingFactor: ColumnSelectionHeuristic = (matrix: ClauseMatrix): number[] => {
    const score = (col: number) => {
        return -heads(getColumn(matrix, col)).size - 1;
    };

    return bestCandidates(...map(range(0, matrix.dims[1] - 1), col => score(col)));
};

// a
export const heuristicArity: ColumnSelectionHeuristic = (matrix: ClauseMatrix): number[] => {
    const score = (col: number) => {
        const headSymbols = new Set<Symb>();
        let sum = 0;

        for (const pat of getColumn(matrix, col)) {
            if (pat !== _ && !headSymbols.has(pat.name)) {
                sum += pat.args.length;
                headSymbols.add(pat.name);
            }
        }

        return -sum;
    };

    return bestCandidates(...map(range(0, matrix.dims[1] - 1), col => score(col)));
};

export const heuristicConstructorPrefix: ColumnSelectionHeuristic = (matrix: ClauseMatrix): number[] => {
    const score = (col: number) => {
        const allNeeded = (upToRow: number): boolean => {
            for (let row = 0; row <= upToRow; row++) {
                if (matrix.patterns[row][col] === _) return false;
            }

            return true;
        };

        for (let row = matrix.dims[0] - 1; row >= 0; row--) {
            if (allNeeded(row)) return row;
        }

        return 0;
    };

    return bestCandidates(...map(range(0, matrix.dims[1] - 1), col => score(col)));
};

const combineHeuristics = (
    heuristics: ColumnSelectionHeuristic[]
): (matrix: ClauseMatrix) => number => {
    return (matrix: ClauseMatrix): number => {
        const selected = new Set<number>(range(0, matrix.dims[1] - 1));
        for (const heuristic of heuristics) {
            if (selected.size === 1) break;
            intersectionMut(selected, new Set(heuristic(matrix)));
        }

        // return the first suitable column
        return selected.values().next().value;
    };
};

export const isPatternMoreGeneral = (p1: Pattern, p2: Pattern): boolean => {
    if (p1 === _) return true;
    if (p2 === _) return false;
    if (p1.name !== p2.name) return false;
    return every(zip(p1.args, p2.args), ([a, b]) => isPatternMoreGeneral(a, b));
};

// see "The Definition of Standard ML", Milner et al. 1990
export const isPatternRedundant = (patternIndex: number, patterns: Pattern[]): boolean => {
    const p = patterns[patternIndex];

    for (let i = 0; i < patternIndex; i++) {
        if (isPatternMoreGeneral(patterns[i], p)) {
            return true;
        }
    }

    return false;
};

export const isRowUseless = (matrix: ClauseMatrix, rowIndex: number): boolean => {
    for (let col = 0; col < matrix.dims[1]; col++) {
        if (!isPatternRedundant(rowIndex, getColumn(matrix, col))) {
            return false;
        }
    }

    return true;
};

// P/ω
const filterColumn = (matrix: ClauseMatrix, colIndex: number): ClauseMatrix => {
    const [rows, cols] = matrix.dims;

    const filtered = matrix.patterns.map(row => row.filter((_, i) => i !== colIndex));

    return {
        dims: [rows, cols - 1],
        actions: matrix.actions,
        patterns: filtered
    };
};

export const isNeeded = (row: number, col: number, matrix: ClauseMatrix): boolean => {
    if (matrix.patterns[row][col] !== _) return true;
    return isRowUseless(filterColumn(matrix, col), row);
};

const swapColumn = (matrix: ClauseMatrix, i: number): void => {
    for (const row of matrix.patterns) {
        swapMut(row, 0, i);
    }
};

const heads = (patterns: Pattern[]): Map<Symb, number> => {
    const hds = new Map<Symb, number>();

    for (const p of patterns) {
        if (p !== _) {
            hds.set(p.name, p.args.length);
        }
    }

    return hds;
};

// pos of h in A(B(c, d, E(f, G(h)))) is [0, 2, 1, 0]
export type Occcurence = {
    term: Term,
    pos: number[]
};

export type IndexedOccurence = {
    index: number,
    pos: number[]
};

export const compileClauseMatrix = (
    argsCount: number,
    matrix: ClauseMatrix,
    signature: Set<Symb>,
    heuristics: ColumnSelectionHeuristic[] = [
        heuristicNeededPrefix, // p
        heuristicSmallBranchingFactor, // b
        heuristicArity // a
    ]
): DecisionTree => {
    const occurences: IndexedOccurence[] = [...gen(argsCount, i => ({ index: i, pos: [] }))];
    const selectColumn = combineHeuristics(heuristics);
    return compileClauseMatrixAux(occurences, matrix, signature, selectColumn);
};

const compileClauseMatrixAux = (
    occurences: IndexedOccurence[],
    matrix: ClauseMatrix,
    signature: Set<Symb>,
    selectColumn: (matrix: ClauseMatrix) => number
): DecisionTree => {
    const [m, n] = matrix.dims;
    if (m === 0) return makeFail();
    if (m > 0 && (n === 0 || matrix.patterns[0].every(p => p === _))) {
        return makeLeaf(matrix.actions[0]);
    }

    const colIdx = selectColumn(matrix);

    if (colIdx !== 0) {
        swapMut(occurences, 0, colIdx);
        swapColumn(matrix, colIdx);
    }

    const col = getColumn(matrix, 0);
    const hds = heads(col);
    const tests: Switch['tests'] = [];

    for (const [ctor, arity] of hds) {
        const o1: IndexedOccurence[] = [...gen(arity, i => ({
            index: occurences[0].index,
            pos: [...occurences[0].pos, i]
        }))];

        const A_k = compileClauseMatrixAux(
            [...o1, ...tail(occurences)],
            specializeClauseMatrix(matrix, ctor, arity),
            signature,
            selectColumn
        );

        tests.push([ctor, A_k]);
    }

    if (!setEq(hds, signature)) {
        const A_D = compileClauseMatrixAux(
            tail(occurences),
            defaultClauseMatrix(matrix),
            signature,
            selectColumn
        );

        tests.push([_, A_D]);
    }

    return makeSwitch(head(occurences), tests);
};