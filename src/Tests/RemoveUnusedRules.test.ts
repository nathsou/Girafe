import { compile } from "../Compiler/Passes/CompilerPass";
import { removeSimSuffixes } from "../Compiler/Passes/LeftLinearize";
import { removeUnusedRules } from "../Compiler/Passes/RemoveUnusedRules";
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

const removeUnused = (trs: TRS, start = 'Main') => {
    const res = compile(trs, simulateIfs, removeUnusedRules(start));

    if (isError(res)) {
        throw new Error('Could not simulate ifs:\n' + unwrap(res).join('\n'));
    }

    return unwrap(res);
};

const suites: TestSuite[] = [{
    trs: removeUnused(parseTRSFromFile('./src/Tests/TRSs/primes2.grf')),
    tests: parseTermPairs([
        ['IsPrime(1789)', 'True'],
        ['IsPrime(21)', 'False'],
        ['Main', 'True'],
        ['Not(True)', 'Not(True)'],
        ['And(True, False)', 'And(True, False)'],
    ])
}];

test('check that used rules are not removed', () => {
    for (const { trs, tests } of suites) {
        const normalize = new DecisionTreeNormalizer(trs).asNormalizer(externals);
        for (const [query, output] of tests) {
            expect(removeSimSuffixes(showTerm(normalize(query)))).toBe(showTerm(output));
        }
    }
});