import { showTerm } from "../Compiler/Utils";
import { arithmeticExternals } from "../Externals/Arithmetic";
import { mergeExternals } from "../Externals/Externals";
import { metaExternals } from "../Externals/Meta";
import { DecisionTreeNormalizer } from "../Normalizer/DecisionTreeNormalizer";
import { nodeWorkerNormalizer } from "../Normalizer/JSNormalizer/NodeWorkerNormalizer";
import { headMatcher } from "../Normalizer/Matchers/HeadMatcher";
import { AsyncNormalizer, buildFueledNormalizer, makeNormalizerAsync } from "../Normalizer/Normalizer";
import { unificationNormalizer } from "../Normalizer/Unification";
import { Term, TRS } from "../Parser/Types";
import { ghcNormalizer, ocamlNormalizer, parseTermPairs, parseTRS, parseTRSFromFile } from "./TestUtils";

type NormalizationTestSuite = {
    trs: TRS,
    tests: Array<[Term, Term]>
};

const suite1: NormalizationTestSuite = {
    trs: parseTRS([
        "=(a, b) -> @equ(a, b)",
        "+(a, b) -> @add(a, b)",
        "-(a, b) -> @sub(a, b)",
        "Range(n) -> Range'(n, Nil)",
        "Range'(0, rng) -> :(0, rng)",
        "Range'(n, rng) -> Range'(-(n, 1), :(n, rng))",
        "Reverse(lst) -> Reverse'(lst, Nil)",
        "Reverse'(Nil, rev) -> rev",
        "Reverse'(:(h, tl), rev) -> Reverse'(tl, :(h, rev))",
        "Len(Nil) -> 0",
        "Len(:(h, tl)) -> +(Len(tl), 1)",
        "Peano+(a, 0) -> a",
        "Peano+(0, b) -> b",
        "Peano+(a, S(b)) -> S(Peano+(a, b))",
        "Peano+(S(a), b) -> S(Peano+(a, b))",
    ]),
    tests: parseTermPairs([
        ['Peano+(S(S(0)), S(S(S(0))))', 'S(S(S(S(S(0)))))'],
        ['Range(2)', ':(0, :(1, :(2, Nil)))'],
        ['Range(10)', ':(0, :(1, :(2, :(3, :(4, :(5, :(6, :(7, :(8, :(9, :(10, Nil)))))))))))'],
        ['Reverse(Range(3))', ':(3, :(2, :(1, :(0, Nil))))'],
        ['Len(Range(11))', '12'],
        ['=(Len(Range(11)), 12)', 'True'],
        ['=(Len(Range(11)), 11)', 'False'],
        ['=(Len(Reverse(Range(11))), Len(Range(11)))', 'True']
    ])
};

const suite2: NormalizationTestSuite = {
    trs: parseTRSFromFile('./src/Tests/TRSs/primes.grf'),
    tests: parseTermPairs([
        ['IsPrime(|(1, 7))', 'True'],
        ['IsPrime(|(2, 1))', 'False'],
        ['N(Len(Primes(*(10, 3))))', ":(1', :(0', Nil))"],
    ])
};


const suite3: NormalizationTestSuite = {
    trs: parseTRSFromFile('./src/Tests/TRSs/curried.grf'),
    tests: parseTermPairs([
        ['App(CollatzLen, 7)', '17'],
        ['App(CollatzLen, 6171)', '262'],
        ['App(Max, App(App(Map, CollatzLen), App(App(Range, 1), 99)))', '119'],
    ])
};

const maxSteps = 500_000;

const genNormalizers = (trs: TRS): AsyncNormalizer[] => {
    const externals = mergeExternals<string>(arithmeticExternals, metaExternals());

    const normalizers = [
        buildFueledNormalizer(unificationNormalizer(headMatcher(trs)), maxSteps, externals('native')),
        // new ClosureMatcher(trs).asNormalizer(externals('native')),
        new DecisionTreeNormalizer(trs).asFueledNormalizer(maxSteps, externals('native'))
    ].map(makeNormalizerAsync);

    normalizers.push(nodeWorkerNormalizer(trs, externals('js')));
    normalizers.push(ocamlNormalizer(trs, externals('ocaml')));
    normalizers.push(ghcNormalizer(trs, externals('haskell')));

    return normalizers;
};

const testSuites: NormalizationTestSuite[] = [
    suite1,
    suite2,
    suite3
];

test('Each normalizer should give the same output', async () => {
    jest.setTimeout(2 * 60000);

    for (const { trs, tests } of testSuites) {
        for (const normalize of genNormalizers(trs)) {
            for (const [input, output] of tests) {
                try {
                    const res = await normalize(input);
                    expect(showTerm(res)).toStrictEqual(showTerm(output));
                } catch (e) {
                    throw e;
                }
            }
        }
    }
});