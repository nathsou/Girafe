import { isSomething, mapify } from "../Compiler/Utils";
import { reduce } from "../Evaluator/Unification";
import { arithmeticExternals } from "../Externals/Arithmetic";
import { parseRule, parseTerm } from "../Parser/Parser";
import { Term, TRS } from "../Parser/Types";
import { TermMatcher } from "../Evaluator/Matchers/TermMatcher/TermMatcher";

const trs: TRS = mapify([
    '-(a, b) -> @sub(a, b)',
    'Range(n) -> RangeAux(n, Nil)',
    'RangeAux(0, rng) -> Reverse(rng)',
    'RangeAux(n, rng) -> RangeAux(-(n, 1), :(n, rng))'
].map(parseRule).filter(isSomething));

const matcher = new TermMatcher(trs);

const tests: [string, string][] = [
    ['Range(10)', 'Reverse(:(1, :(2, :(3, :(4, :(5, :(6, :(7, :(8, :(9, :(10, Nil)))))))))))']
];

test('reduce', () => {
    for (const [query, output] of tests) {
        expect(reduce(
            parseTerm(query) as Term,
            arithmeticExternals,
            matcher
        )).toStrictEqual(parseTerm(output));
    }
});