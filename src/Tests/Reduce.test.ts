import { isSomething, mapify } from "../Compiler/Utils";
import { reduce } from "../Evaluator/Unification";
import { arithmeticExternals } from "../Externals/Arithmetic";
import { parseRule, parseTerm } from "../Parser/Parser";
import { Term, TRS } from "../Parser/Types";
import { TermMatcher } from "../Evaluator/Matchers/TermMatcher/TermMatcher";
import { headMatcher } from "../Evaluator/Matchers/HeadMatcher";
import { Matcher } from "../Evaluator/Matchers/Matcher";

const trs: TRS = mapify([
    "-(a, b) -> @sub(a, b)",
    "Range(n) -> Range'(n, Nil)",
    "Range'(0, rng) -> :(0, rng)",
    "Range'(n, rng) -> Range'(-(n, 1), :(n, rng))",
    "Reverse(lst) -> Reverse'(lst, Nil)",
    "Reverse'(Nil, rev) -> rev",
    "Reverse'(:(h, tl), rev) -> Reverse'(tl, :(h, rev))"
].map(parseRule).filter(isSomething));

const matchers: Matcher[] = [
    new TermMatcher(trs).asMatcher(),
    headMatcher(trs)
];

const tests = [
    ['Range(10)', ':(0, :(1, :(2, :(3, :(4, :(5, :(6, :(7, :(8, :(9, :(10, Nil)))))))))))'],
    ['Reverse(Range(3))', ':(3, :(2, :(1, :(0, Nil))))']
].map(([input, output]) => [parseTerm(input), parseTerm(output)])
    .filter(([input, output]) => isSomething(input) && isSomething(output)) as Array<[Term, Term]>;

test('reduce', () => {
    for (const [input, output] of tests) {
        for (const matcher of matchers) {
            expect(reduce(
                input,
                arithmeticExternals,
                matcher
            )).toStrictEqual(output);
        }
    }
});