import { isSomething, isVar, Maybe } from "../Compiler/Utils";
import { dictHas, JSExternals, Term } from "../Parser/Types";
import { mapMut } from "../Parser/Utils";

export interface StepNormalizer {
    oneStepReduce: (term: Term) => Maybe<Term>
}

export type Normalizer = (term: Term) => Term;

// handles externals
const oneStepReduceWithExternals = (
    term: Term,
    normalizer: StepNormalizer,
    externals: JSExternals<string> = {}
): Maybe<Term> => {
    if (isVar(term)) return;
    if (term.name.charAt(0) === '@') {
        const f = term.name.substr(1);
        if (dictHas(externals, f)) {
            const newTerm = externals[f](term);
            if (newTerm != term) {
                return newTerm;
            }
        } else {
            throw new Error(`Unknown external function: "${f}"`);
        }
    }

    return normalizer.oneStepReduce(term);
};

const reduce = (
    term: Term,
    evaluator: StepNormalizer,
    externals: JSExternals<string> = {}
): Term => {
    if (isVar(term)) return term;
    let reduced: Maybe<Term> = term;

    while (isSomething(reduced)) {
        if (isVar(reduced)) return reduced;
        mapMut(reduced.args, s => reduce(s, evaluator, externals));

        const newTerm = oneStepReduceWithExternals(reduced, evaluator, externals);
        if (newTerm === undefined) return reduced;
        reduced = newTerm;
    }
};

export const buildNormalizer = (
    evaluator: StepNormalizer,
    externals: JSExternals<string> = {}
): Normalizer => (term: Term): Term => {
    return reduce(term, evaluator, externals);
};
