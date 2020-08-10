import { isVar, Maybe, replaceTermAt } from "../Compiler/Utils";
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
export const oneStepReduceWithExternals = (
    query: Fun,
    normalizer: StepNormalizer,
    externals: JSExternals<string> = {}
): Maybe<Term> => {
    if (query.name.charAt(0) === '@') {
        const f = query.name.substr(1);
        if (dictHas(externals, f)) {
            const newTerm = externals[f](query, normalizer, externals);
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

export const normalize = <Externals extends string = string>(
    query: Term,
    normalizer: StepNormalizer,
    externals: JSExternals<Externals>
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

export const traceNormalize = <Externals extends string = string>(
    query: Term,
    normalizer: StepNormalizer,
    externals: JSExternals<Externals>,
    trace: (t: Term) => void
): Term => {
    let reduced = query;

    if (isVar(query)) {
        trace(query);
        return query;
    }

    while (true) {
        if (isVar(reduced)) return reduced;
        mapMut(reduced.args, (s, i) => traceNormalize(
            s,
            normalizer,
            externals,
            (t: Term) => trace(replaceTermAt(reduced, t, [i]))
        ));

        const newTerm = oneStepReduceWithExternals(reduced, normalizer, externals);
        if (newTerm === undefined) return reduced;
        reduced = newTerm as Term;
        trace(reduced);
    }
};

export const buildNormalizer = (
    evaluator: StepNormalizer,
    externals: JSExternals<string> = {}
): Normalizer => (query: Term): Term => {
    return normalize(query, evaluator, externals);
};
