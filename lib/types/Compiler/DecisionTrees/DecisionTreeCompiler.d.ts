import { Rule, Symb, Term } from "../../Parser/Types";
import { Either } from "../../Types";
import { DecisionTree } from "./DecisionTree";
export declare type AnyPat = '_';
export declare const _: AnyPat;
export declare type FunPattern = {
    name: Symb;
    args: Pattern[];
};
export declare type Pattern = FunPattern | AnyPat;
declare type ClauseMatrixRow = Pattern[];
export declare type ClauseMatrix = {
    dims: [number, number];
    patterns: ClauseMatrixRow[];
    actions: Term[];
};
export declare const patternOf: (term: Term) => Pattern;
export declare const clauseMatrixOf: (rules: Rule[]) => ClauseMatrix;
export declare const specializeClauseMatrix: (matrix: ClauseMatrix, c: Symb, arity: number) => ClauseMatrix;
export declare const defaultClauseMatrix: (matrix: ClauseMatrix) => ClauseMatrix;
export declare type Occcurence = {
    value: Either<Occcurence, Term>;
    index?: number;
};
export declare const occurencesOf: (...terms: Term[]) => Occcurence[];
export declare const compileClauseMatrix: (occurences: Occcurence[], matrix: ClauseMatrix, signature: Set<Symb>) => DecisionTree;
export {};
