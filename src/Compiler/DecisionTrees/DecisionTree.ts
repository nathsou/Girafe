import { Fun, dictGet, Substitution, Symb, Term } from "../../Parser/Types";
import { isFun, isVar, Maybe, substitute } from "../Utils";
import { AnyPat, Occcurence } from "./DecisionTreeCompiler";

export type Leaf = { type: 'leaf', action: Term };
export type Fail = { type: 'fail' };

export type Switch = {
    type: 'switch',
    occurence: Occcurence,
    tests: Array<[(Symb | AnyPat), DecisionTree]>
};

export type DecisionTree = Leaf | Fail | Switch;

export const makeLeaf = (action: Term): Leaf => ({ type: 'leaf', action });
export const makeFail = (): Fail => ({ type: 'fail' });
export const makeSwitch = (occurence: Occcurence, tests: Switch['tests']): Switch => {
    return {
        type: 'switch',
        occurence,
        tests
    };
};

export function isPureOccurence(occ: Occcurence): occ is { value: Occcurence, index: number } {
    return occ['value'] !== undefined;
}

export function isTermOccurence(occ: Occcurence): occ is Term {
    return !isPureOccurence(occ);
}

export const getOccurence = (subst: Substitution, occ: Occcurence): Term => {
    if (isTermOccurence(occ)) return isVar(occ) ? dictGet(subst, occ) ?? occ : occ;
    const val = getOccurence(subst, occ.value);
    return (val as Fun).args[occ.index];
};

export const evaluate = (subst: Substitution, dt: DecisionTree): Maybe<Term> => {
    if (dt.type === 'leaf') return substitute(dt.action, subst);
    if (dt.type === 'switch') {
        for (const [ctor, subtree] of dt.tests) {
            const term = getOccurence(subst, dt.occurence);
            if (isFun(term, ctor)) {
                return evaluate(subst, subtree);
            }
        }
    }
};