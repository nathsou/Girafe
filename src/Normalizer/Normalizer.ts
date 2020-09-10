import { defaultPasses, fun, isNothing, isVar, Maybe, replaceTermAt, showRule, uniq, vars } from "../Compiler/Utils";
import { ExternalsFactory, NativeExternals } from "../Externals/Externals";
import { dictHas, Fun, Term, TRS } from "../Parser/Types";
import { mapMut } from "../Parser/Utils";
import { compileRules } from "./Unification";

export interface StepNormalizer {
    /**
     * Performs one step of reduction when a rule applies
     */
    oneStepReduce: (query: Term) => Maybe<Term>
}

export interface OneShotNormalizer {
    /**
     * Normalizes query
     */
    normalize: (query: Term) => Promise<Term>
}

export type Normalizer = (query: Term) => Term;
export type AsyncNormalizer = (query: Term) => Promise<Term>;

// handles externals
export const oneStepReduceWithExternals = (
    query: Fun,
    normalizer: StepNormalizer,
    externals: NativeExternals<string> = {}
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
    externals: NativeExternals<Externals>
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
    externals: NativeExternals<Externals>,
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
    externals: NativeExternals<string> = {}
): Normalizer => (query: Term): Term => {
    return normalize(query, evaluator, externals);
};

export type NormalizerFactory<Exts extends string> = (
    trs: TRS,
    externals: ExternalsFactory<Exts>
) => AsyncNormalizer;

export const makeNormalizerAsync = (normalizer: Normalizer): AsyncNormalizer => {
    return (query: Term) => Promise.resolve(normalizer(query));
};

export const normalizeQuery = async <Exts extends string>(
    query: Term,
    source: string,
    externals: ExternalsFactory<Exts>,
    normalizerFactory: NormalizerFactory<Exts>,
    passes = defaultPasses(externals('native'))
): Promise<Maybe<{ duration: number, normalForm: Term }>> => {
    const querySymb = "___query";
    const queryVars = uniq(vars(query));
    const queryLhs = fun(querySymb, ...queryVars);
    const queryRule = showRule([queryLhs, query]);
    const sourceWithQuery = `${source}\n${queryRule}`;

    const trs = await compileRules(sourceWithQuery, passes);
    if (isNothing(trs)) return;
    const normalize = normalizerFactory(trs, externals);
    const start = Date.now();
    const nf = await normalize(queryLhs);
    const delta = Date.now() - start;

    return { duration: delta, normalForm: nf };
};