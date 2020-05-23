import { Fun, Symb, Term } from "../../Parser/Types";
import { isFun, isVar, Maybe } from "../Utils";
import { AnyPat, IndexedOccurence, OccTerm, _ } from "./DecisionTreeCompiler";

export type Leaf = { type: 'leaf', action: OccTerm };
export type Fail = { type: 'fail' };

export type Switch = {
    type: 'switch',
    occurence: IndexedOccurence,
    tests: Array<[(Symb | AnyPat), DecisionTree]>
};

export type DecisionTree = Leaf | Fail | Switch;

export const makeLeaf = (action: OccTerm): Leaf => ({ type: 'leaf', action });
export const makeFail = (): Fail => ({ type: 'fail' });
export const makeSwitch = (occurence: IndexedOccurence, tests: Switch['tests']): Switch => {
    return {
        type: 'switch',
        occurence,
        tests
    };
};

export const getOccurence = (terms: Term[], occurence: IndexedOccurence): Term => {
    let t = terms[occurence.index];

    for (const idx of occurence.pos) {
        t = (t as Fun).args[idx];
    }

    return isVar(t) ? t : t;
};

export const termOf = (terms: Term[], occ: OccTerm): Term => {
    if (isOccurence(occ)) return getOccurence(terms, occ);

    return {
        name: occ.name,
        args: occ.args.map(arg => termOf(terms, arg))
    };
};

export const isOccurence = (t: OccTerm): t is IndexedOccurence => {
    return t['pos'] !== undefined && t['index'] !== undefined;
};

export const evaluate = (args: Term[], dt: DecisionTree): Maybe<Term> => {
    if (dt.type === 'leaf') return termOf(args, dt.action);
    if (dt.type === 'switch') {
        for (const [ctor, subtree] of dt.tests) {
            const term = getOccurence(args, dt.occurence);
            if (ctor === _ || isFun(term, ctor)) {
                return evaluate(args, subtree);
            }
        }
    }
};