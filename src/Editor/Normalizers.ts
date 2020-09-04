import { DecisionTreeNormalizer } from "../Normalizer/DecisionTreeNormalizer";
import { NormalizerFactory, buildNormalizer, normalizeQuery, makeNormalizerAsync } from "../Normalizer/Normalizer";
import { webWorkerNormalizer } from "../Normalizer/JSNormalizer/WebWorkerNormalizer";
import { unificationNormalizer } from "../Normalizer/Unification";
import { headMatcher } from "../Normalizer/Matchers/HeadMatcher";
import { ClosureMatcher } from "../Normalizer/Matchers/ClosureMatcher/ClosureMatcher";
import { Term, TRS } from "../Parser/Types";
import { defaultPasses } from "../Compiler/Utils";
import { FileReader } from "../Parser/Preprocessor/Import";
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
    fileReader: FileReader,
    passes?: CompilerPass[]
) => ReturnType<typeof normalizeQuery> => {
    const factory: NormalizerFactory<string> = {
        'decision-trees': (trs: TRS, externals) => makeNormalizerAsync(
            new DecisionTreeNormalizer(trs).asNormalizer(externals)
        ),
        'head-matcher': (trs: TRS, externals) => makeNormalizerAsync(
            buildNormalizer(unificationNormalizer(headMatcher(trs)), externals)
        ),
        'closure-matcher': (trs: TRS, externals) => makeNormalizerAsync(
            new ClosureMatcher(trs).asNormalizer(externals)
        ),
        'web-worker': (trs: TRS, externals) => webWorkerNormalizer(trs, externals)
    }[normalizer];

    return (
        query: Term,
        source: string,
        externals: ExternalsFactory<string>,
        fileReader: FileReader,
        passes = defaultPasses(externals('native'))
    ) => normalizeQuery(query, source, externals, factory, fileReader, passes);
};