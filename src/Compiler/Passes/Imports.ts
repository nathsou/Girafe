import { TRS, Rule, Term, Fun } from "../../Parser/Types";
import { addRules, fun } from "../Utils";

export const eqSymb = '@equ';
export const ifSymb = 'if';
export const andSymb = 'and';
export const trueSymb = 'True';
export const falseSymb = 'False';

export const True = () => fun(trueSymb);
export const False = () => fun(falseSymb);

export const If = (cond: Term, thenExp: Term, elseExp: Term): Fun => {
    return fun(ifSymb, cond, thenExp, elseExp);
};

export const And = (a: Term, b: Term): Fun => {
    return fun(andSymb, a, b);
};

export const Eq = (a: Term, b: Term): Fun => {
    return fun(eqSymb, a, b);
};

export const use = (trs: TRS, rules: Rule[]): void => {
    addRules(trs, ...rules);
};

export const useIf = (trs: TRS): void => {
    const ifRules: Rule[] = [
        [If(True(), 'a', 'b'), 'a'],
        [If(False(), 'a', 'b'), 'b']
    ];

    use(trs, ifRules);
};

export const useAnd = (trs: TRS): void => {
    const andRules: Rule[] = [
        [And(False(), False()), False()],
        [And(False(), True()), False()],
        [And(True(), False()), False()],
        [And(True(), True()), True()]
    ];

    use(trs, andRules);
};