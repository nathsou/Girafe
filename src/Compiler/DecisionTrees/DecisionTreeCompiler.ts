import { Rule, Symb, Term, unreachable } from "../../Parser/Types";
import { gen, repeat } from "../../Parser/Utils";
import { Either, Left, Right } from "../../Types";
import { arity, decons, head, isSomething, isVar, lhs, Maybe, rhs, setEq, swapMut, tail, zip } from "../Utils";
import { DecisionTree, makeFail, makeLeaf, makeSwitch, Switch } from "./DecisionTree";

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
    actions: Term[]
};

export const patternOf = (term: Term): Pattern => {
    if (isVar(term)) return _;
    return { name: term.name, args: term.args.map(patternOf) };
};

// all the rules must share the same head symbol and arity
export const clauseMatrixOf = (rules: Rule[]): ClauseMatrix => {
    return {
        patterns: rules.map(rule => lhs(rule).args.map(patternOf)),
        dims: [rules.length, arity(rules)], // rows * cols
        actions: rules.map(rule => rhs(rule))
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

export type Occcurence = {
    value: Either<Occcurence, Term>,
    index?: number
};

export const occurencesOf = (...terms: Term[]): Occcurence[] => {
    return terms.map(t => ({ value: Right(t) }));
};

export const compileClauseMatrix = (
    occurences: Occcurence[],
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
        const o1 = [...gen(arity, i => ({
            value: Left(occurences[0]),
            index: i
        }))];

        const A_k = compileClauseMatrix(
            [...o1, ...tail(occurences)],
            specializeClauseMatrix(matrix, ctor, arity),
            signature
        );

        tests.push([ctor, A_k]);
    }

    if (!setEq(hds, signature)) {
        const A_D = compileClauseMatrix(
            tail(occurences),
            defaultClauseMatrix(matrix),
            signature
        );

        tests.push([_, A_D]);
    }

    return makeSwitch(head(occurences), tests);
};