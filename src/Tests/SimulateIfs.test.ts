import { compile } from "../Compiler/Passes/CompilerPass";
import { removeSimSuffixes } from "../Compiler/Passes/LeftLinearize";
import { simulateIfs } from "../Compiler/Passes/SimulateIfs";
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
    const res = compile(trs, simulateIfs);

    if (isError(res)) {
        throw new Error('Could not simulate ifs:\n' + unwrap(res).join('\n'));
    }

    return unwrap(res);
};

const suites: TestSuite[] = [{
    trs: normLhs(parseTRSFromFile('./src/Tests/TRSs/collatz.grf')),
    tests: parseTermPairs([
        ['Len(Collatz(7))', '17'],
    ])
}, {
    trs: normLhs(parseTRSFromFile('./src/Tests/TRSs/primes2.grf')),
    tests: parseTermPairs([
        ['IsPrime(1789)', 'True'],
        ['IsPrime(21)', 'False'],
    ])
}];

test('check if then else expressions simulation correctness', () => {
    for (const { trs, tests } of suites) {
        const normalize = new DecisionTreeNormalizer(trs).asNormalizer(externals);
        for (const [query, output] of tests) {
            expect(removeSimSuffixes(showTerm(normalize(query)))).toBe(showTerm(output));
        }
    }
});