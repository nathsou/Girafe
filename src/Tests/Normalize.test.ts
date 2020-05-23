import { defined, mapify } from "../Compiler/Utils";
import { arithmeticExternals } from "../Externals/Arithmetic";
import { DecisionTreeNormalizer } from "../Normalizer/DecisionTreeNormalizer";
import { headMatcher } from "../Normalizer/Matchers/HeadMatcher";
import { TermMatcher } from "../Normalizer/Matchers/TermMatcher/TermMatcher";
import { buildNormalizer } from "../Normalizer/Normalizer";
import { unificationNormalizer } from "../Normalizer/Unification";
import { parseRule, parseTerm } from "../Parser/Parser";
import { Term, TRS } from "../Parser/Types";

const trs: TRS = mapify([
    "-(a, b) -> @sub(a, b)",
    "Range(n) -> Range'(n, Nil)",
    "Range'(0, rng) -> :(0, rng)",
    "Range'(n, rng) -> Range'(-(n, 1), :(n, rng))",
    "Reverse(lst) -> Reverse'(lst, Nil)",
    "Reverse'(Nil, rev) -> rev",
    "Reverse'(:(h, tl), rev) -> Reverse'(tl, :(h, rev))"
].map(rule => defined(parseRule(rule))));

const reducers = [
    new TermMatcher(trs).asMatcher(),
    headMatcher(trs)
].map(matcher => buildNormalizer(unificationNormalizer(matcher), arithmeticExternals));

reducers.push(new DecisionTreeNormalizer(trs).asNormalizer(arithmeticExternals));

const tests: Array<[Term, Term]> = [
    ['Range(2)', ':(0, :(1, :(2, Nil)))'],
    ['Range(10)', ':(0, :(1, :(2, :(3, :(4, :(5, :(6, :(7, :(8, :(9, :(10, Nil)))))))))))'],
    ['Reverse(Range(3))', ':(3, :(2, :(1, :(0, Nil))))']
].map(([input, output]) => [defined(parseTerm(input)), defined(parseTerm(output))]);

test('reduce', () => {
    for (const [input, output] of tests) {
        for (const reduce of reducers) {
            expect(reduce(input)).toStrictEqual(output);
        }
    }
});