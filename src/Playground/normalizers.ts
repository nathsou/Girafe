import { DecisionTreeNormalizer } from "../Normalizer/DecisionTreeNormalizer";
import { NormalizerFactory, buildNormalizer, normalizeQuery, makeNormalizerAsync } from "../Normalizer/Normalizer";
import { webWorkerNormalizer } from "../Normalizer/JSNormalizer/WebWorkerNormalizer";
import { unificationNormalizer } from "../Normalizer/Unification";
import { headMatcher } from "../Normalizer/Matchers/HeadMatcher";
import { ClosureMatcher } from "../Normalizer/Matchers/ClosureMatcher/ClosureMatcher";
import { Term, TRS } from "../Parser/Types";
import { defaultPasses } from "../Compiler/Utils";
import { CompilerPass } from "../Compiler/Passes/CompilerPass";
import { NativeExternals, Externals, ExternalsFactory } from "../Externals/Externals";

export type ExternalsMap<Exts extends string = string> = {
    'decision-trees': NativeExternals<Exts>,
    'head-matcher': NativeExternals<Exts>,
    'closure-matcher': NativeExternals<Exts>,
    'web-worker': Externals<'js', Exts>
};

export type Normalizers = keyof ExternalsMap;
export const normalizersList: Normalizers[] = [
    'decision-trees',
    'web-worker',
    'head-matcher',
    'closure-matcher'
];

export const normalizeQueryWith = <N extends Normalizers>(normalizer: N): (
    query: Term,
    source: string,
    externals: ExternalsFactory<string>,
    passes?: CompilerPass[]
) => ReturnType<typeof normalizeQuery> => {
    const factory: NormalizerFactory<string> = {
        'decision-trees': (trs: TRS, externals: ExternalsFactory<string>) => makeNormalizerAsync(
            new DecisionTreeNormalizer(trs).asNormalizer(externals('native'))
        ),
        'head-matcher': (trs: TRS, externals: ExternalsFactory<string>) => makeNormalizerAsync(
            buildNormalizer(unificationNormalizer(headMatcher(trs)), externals('native'))
        ),
        'closure-matcher': (trs: TRS, externals: ExternalsFactory<string>) => makeNormalizerAsync(
            new ClosureMatcher(trs).asNormalizer(externals('native'))
        ),
        'web-worker': (trs: TRS, externals: ExternalsFactory<string>) =>
            webWorkerNormalizer(trs, externals('js'))
    }[normalizer];

    return (
        query: Term,
        source: string,
        externals: ExternalsFactory<string>,
        passes = defaultPasses(externals('native'))
    ) => normalizeQuery(query, source, externals, factory, passes);
};
