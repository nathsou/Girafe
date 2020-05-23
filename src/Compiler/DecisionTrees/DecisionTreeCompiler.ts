import { Dict, dictGet, Rule, Symb, Term, unreachable, dictHas, dictSet } from "../../Parser/Types";
import { gen, indexed, repeat } from "../../Parser/Utils";
import { arity, decons, head, isSomething, isVar, lhs, Maybe, setEq, swapMut, tail, zip, showTerm } from "../Utils";
import { DecisionTree, makeFail, makeLeaf, makeSwitch, Switch, termOf } from "./DecisionTree";
import { Err } from "../../Types";

// Based on "Compiling Pattern Matching to Good Decision Trees" by Luc Maranget

export type AnyPat = '_';
export const _: AnyPat = '_';

export type FunPattern = { name: Symb, args: Pattern[] };
export type Pattern = FunPattern | AnyPat;

type ClauseMatrixRow = Pattern[];
type ClauseMatrixColumn = Pattern[];

export type ClauseMatrix = {
    dims: [number, number],
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
        collectOccurences(t, sigma, i, { index: 0, pos: [] });
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

// all the rules must share the same head symbol and arity
export const clauseMatrixOf = (rules: Rule[]): ClauseMatrix => {
    return {
        patterns: rules.map(rule => lhs(rule).args.map(patternOf)),
        dims: [rules.length, arity(rules)], // rows * cols
        actions: rules.map(([lhs, rhs]) => {
            const sigma = {};
            for (const [arg, i] of indexed(lhs.args)) {
                occurencesOf(arg, sigma, i);
            }
            return substituteOccurences(rhs, sigma);
        })
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
        .filter(([p, a]) => p)
        .map(([p, a]) => a);

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
        .filter(([p, a]) => p)
        .map(([p, a]) => a);

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

const selectColumn = (matrix: ClauseMatrix): number => {
    for (let i = 0; i < matrix.dims[1]; i++) {
        if (getColumn(matrix, i).some(p => p !== _)) {
            return i;
        }
    }

    unreachable('No valid column found');
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
    signature: Set<Symb>
): DecisionTree => {
    const occurences = [...gen(argsCount, i => ({ index: i, pos: [] }))];
    return compileClauseMatrixAux(occurences, matrix, signature);
}

const compileClauseMatrixAux = (
    occurences: IndexedOccurence[],
    matrix: ClauseMatrix,
    signature: Set<Symb>
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
            signature
        );

        tests.push([ctor, A_k]);
    }

    if (!setEq(hds, signature)) {
        const A_D = compileClauseMatrixAux(
            tail(occurences),
            defaultClauseMatrix(matrix),
            signature
        );

        tests.push([_, A_D]);
    }

    return makeSwitch(head(occurences), tests);
};