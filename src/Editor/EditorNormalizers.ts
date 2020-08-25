import { DecisionTreeNormalizer } from "../Normalizer/DecisionTreeNormalizer";
import { NormalizerFactory, buildNormalizer, normalizeQuery, makeNormalizerAsync } from "../Normalizer/Normalizer";
import { WebWorkerNormalizer } from "../Normalizer/WebWorkerNormalizer";
import { unificationNormalizer } from "../Normalizer/Unification";
import { headMatcher } from "../Normalizer/Matchers/HeadMatcher";
import { ClosureMatcher } from "../Normalizer/Matchers/ClosureMatcher/ClosureMatcher";
import { Term, JSExternals, Externals } from "../Parser/Types";
import { defaultPasses } from "../Compiler/Utils";
import { FileReader } from "../Parser/Preprocessor/Import";
import { CompilerPass } from "../Compiler/Passes/CompilerPass";


export type ExternalsMap<Exts extends string = string> = {
    'decision-trees': JSExternals<Exts>,
    'head-matcher': JSExternals<Exts>,
    'closure-matcher': JSExternals<Exts>,
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
    externals: ExternalsMap[N],
    fileReader: FileReader,
    passes?: CompilerPass[]
) => ReturnType<typeof normalizeQuery> => {
    let factory: NormalizerFactory<ExternalsMap[N]>;

    switch (normalizer) {
        case 'decision-trees':
            factory = (trs, externals) => makeNormalizerAsync(
                new DecisionTreeNormalizer(trs).asNormalizer(externals as JSExternals)
            );
            break;
        case 'head-matcher':
            factory = (trs, externals) => makeNormalizerAsync(
                buildNormalizer(unificationNormalizer(headMatcher(trs)), externals as JSExternals)
            );
            break;
        case 'closure-matcher':
            factory = (trs, externals) => makeNormalizerAsync(
                new ClosureMatcher(trs).asNormalizer(externals as JSExternals)
            );
            break;
        case 'web-worker':
            factory = (trs, externals) => (query: Term) =>
                new WebWorkerNormalizer(trs, externals as Externals<'js'>).normalize(query);
            break;
    }

    return (
        query: Term,
        source: string,
        externals: ExternalsMap[N],
        fileReader: FileReader,
        passes = defaultPasses
    ) => normalizeQuery(query, source, externals, factory, fileReader, passes);
};