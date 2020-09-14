import { isLeftLinear } from "../Compiler/Passes/Checks";
import { compile } from "../Compiler/Passes/CompilerPass";
import { leftLinearize, removeSimSuffixes } from "../Compiler/Passes/LeftLinearize";
import { normalizeLhsArgs } from "../Compiler/Passes/NormalizeLhsArgs";
import { rules, showTerm } from "../Compiler/Utils";
import { arithmeticExternals } from "../Externals/Arithmetic";
import { mergeExternals } from "../Externals/Externals";
import { metaExternals } from "../Externals/Meta";
import { DecisionTreeNormalizer } from "../Normalizer/DecisionTreeNormalizer";
import { Term, TRS } from "../Parser/Types";
import { every } from "../Parser/Utils";
import { isError, unwrap } from "../Types";
import { parseTermPairs, parseTRSFromFile } from "./TestUtils";

type LeftLinearizationTestSuite = {
    trs: TRS,
    tests: Array<[Term, Term]>
};

const externals = mergeExternals<string>(arithmeticExternals, metaExternals())('native');

const linearize = (trs: TRS) => {
    const res = compile(trs, leftLinearize, normalizeLhsArgs(externals));

    if (isError(res)) {
        throw new Error('Could not left linearize:\n' + unwrap(res).join('\n'));
    }

    return unwrap(res);
};

const suites: LeftLinearizationTestSuite[] = [{
    trs: linearize(parseTRSFromFile('./src/Tests/TRSs/notLeftLinear.grf')),
    tests: parseTermPairs([
        ['+(7, 7)', '*(7, 2)'],
        ['+(0, 3)', '3'],
        ['+(1, +(1, 0))', '*(1, 2)'],
        ['Range(1, 3)', ':(1, :(2, :(3, Nil)))'],
        ['+(*(3, 7), *(3, 2))', '*(3, +(7, 2))'],
    ])
}];

const isTRSLeftLinear = (trs: TRS) => every(rules(trs), isLeftLinear);

test('left linearization should produce a left linear TRS', () => {
    for (const { trs } of suites) {
        expect(isTRSLeftLinear(trs)).toBeTruthy();
    }
});

test('check left linearization correctness', () => {
    for (const { trs, tests } of suites) {
        const normalize = new DecisionTreeNormalizer(trs).asNormalizer(externals);
        for (const [query, output] of tests) {
            expect(removeSimSuffixes(showTerm(normalize(query)))).toBe(showTerm(output));
        }
    }
});