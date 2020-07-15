import { isVar, Maybe } from "../Compiler/Utils";
import { dictHas, Fun, JSExternals, Term } from "../Parser/Types";
import { mapMut } from "../Parser/Utils";

export interface StepNormalizer {
    /**
     * Performs one step of reduction when a rule applies
     */
    oneStepReduce: (query: Term) => Maybe<Term>
}

export type Normalizer = (query: Term) => Term;

// handles externals
const oneStepReduceWithExternals = (
    query: Fun,
    normalizer: StepNormalizer,
    externals: JSExternals<string> = {}
): Maybe<Term> => {
    if (query.name.charAt(0) === '@') {
        const f = query.name.substr(1);
        if (dictHas(externals, f)) {
            const newTerm = externals[f](query);
            // prevent infinite loops
            if (newTerm !== query) {
                return newTerm;
            }
        } else {
            throw new Error(`Unknown external function: "${f}"`);
        }
    }

    return normalizer.oneStepReduce(query);
};

const normalize = (
    query: Term,
    normalizer: StepNormalizer,
    externals: JSExternals<string> = {}
): Term => {
    let reduced = query;

    while (true) {
        if (isVar(reduced)) return reduced;
        mapMut(reduced.args, s => normalize(s, normalizer, externals));
        const newTerm = oneStepReduceWithExternals(reduced, normalizer, externals);
        if (newTerm === undefined) return reduced;
        reduced = newTerm as Term;
    }
};

export const buildNormalizer = (
    evaluator: StepNormalizer,
    externals: JSExternals<string> = {}
): Normalizer => (query: Term): Term => {
    return normalize(query, evaluator, externals);
};
