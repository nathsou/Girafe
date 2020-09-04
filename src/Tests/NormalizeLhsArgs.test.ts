import { compile } from "../Compiler/Passes/CompilerPass";
import { removeSimSuffixes } from "../Compiler/Passes/LeftLinearize";
import { normalizeLhsArgs } from "../Compiler/Passes/NormalizeLhsArgs";
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

const externals = mergeExternals(arithmeticExternals, metaExternals())('native');

const normLhs = (trs: TRS) => {
    const res = compile(trs, normalizeLhsArgs(externals));

    if (isError(res)) {
        throw new Error('Could not normalize LHSs:\n' + unwrap(res).join('\n'));
    }

    return unwrap(res);
};

const suites: TestSuite[] = [{
    trs: normLhs(parseTRSFromFile('./src/Tests/TRSs/factorize.grf')),
    tests: parseTermPairs([
        ['Factorize(1998)', ':(2, :(3, :(3, :(3, :(37, Nil)))))'],
        ['Prod(Factorize(2020))', '2020'],
        ['IsFactorizationOf1998(Factorize(1998))', 'True'],
        ['IsFactorizationOf1998(Factorize(1997))', 'False'],
        ['IsFactorizationOf1998(:(2, :(3, :(3, :(3, :(37, Nil))))))', 'True'],
    ])
}];

test('check lhs normalization correctness', () => {
    for (const { trs, tests } of suites) {
        const normalize = new DecisionTreeNormalizer(trs).asNormalizer(externals);
        for (const [query, output] of tests) {
            expect(removeSimSuffixes(showTerm(normalize(query)))).toBe(showTerm(output));
        }
    }
});