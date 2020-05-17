import { TRS, Rule, Term, Fun } from "../Parser/Types";
export declare const eqSymb = "@equ";
export declare const ifSymb = "if";
export declare const andSymb = "and";
export declare const trueSymb = "True";
export declare const falseSymb = "False";
export declare const True: () => Fun;
export declare const False: () => Fun;
export declare const If: (cond: Term, thenExp: Term, elseExp: Term) => Fun;
export declare const And: (a: Term, b: Term) => Fun;
export declare const Eq: (a: Term, b: Term) => Fun;
export declare const use: (trs: TRS, rules: Rule[]) => void;
export declare const useIf: (trs: TRS) => void;
export declare const useAnd: (trs: TRS) => void;
