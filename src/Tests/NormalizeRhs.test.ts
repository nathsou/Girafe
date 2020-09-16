import { compile } from "../Compiler/Passes/CompilerPass";
import { removeSimSuffixes } from "../Compiler/Passes/LeftLinearize";
import { normalizeRhs } from "../Compiler/Passes/NormalizeRhs";
import { ensureUniqueVarNames } from "../Compiler/Passes/UniqueVarNames";
import { showTerm } from "../Compiler/Utils";
import { arithmeticExternals } from "../Externals/Arithmetic";
import { mergeExternals } from "../Externals/Externals";
import { metaExternals } from "../Externals/Meta";
import { DecisionTreeNormalizer } from "../Normalizer/DecisionTreeNormalizer";
import { Term, TRS } from "../Parser/Types";
import { isError, unwrap } from "../Types";
import { parseTermPairs, parseTRSFromFile } from "./TestUtils";

type TestSuite = {
    trs: TRS,
    tests: Array<[Term, Term]>
};

const externals = mergeExternals<string>(arithmeticExternals, metaExternals())('native');

const normRhs = (trs: TRS) => {
    const res = compile(trs, ensureUniqueVarNames, normalizeRhs(100, true));

    if (isError(res)) {
        throw new Error('Could not normalize LHSs:\n' + unwrap(res).join('\n'));
    }

    // console.log(showTRS(unwrap(res)));

    return unwrap(res);
};

const suites: TestSuite[] = [{
    trs: normRhs(parseTRSFromFile('./src/Tests/TRSs/rhs.grf')),
    tests: parseTermPairs([
        ['App(Palindrome, 171)', 'True'],
        ['App(Palindrome, 17)', 'False'],
        ['App(Palindrome, 11)', 'True'],
        ['App(Palindrome, 1991)', 'True'],
        ['App(Palindrome, 199891)', 'False'],
        ['App(Palindrome, 700666007)', 'True'],
        ['Main', 'True'],
    ])
},
{
    trs: normRhs(parseTRSFromFile('./src/Tests/TRSs/curried.grf')),
    tests: parseTermPairs([
        ['Main', '525']
    ])
}
];

test('check rhs normalization correctness', () => {
    for (const { trs, tests } of suites) {
        const normalize = new DecisionTreeNormalizer(trs).asFueledNormalizer(5_000_000, externals);
        for (const [query, output] of tests) {
            expect(removeSimSuffixes(showTerm(normalize(query)))).toBe(showTerm(output));
        }
    }
});