import { defined, mapify, fun } from "../Compiler/Utils";
import { arithmeticExternals, jsArithmeticExternals } from "../Externals/Arithmetic";
import { DecisionTreeNormalizer } from "../Normalizer/DecisionTreeNormalizer";
import { headMatcher } from "../Normalizer/Matchers/HeadMatcher";
import { ClosureMatcher } from "../Normalizer/Matchers/ClosureMatcher/ClosureMatcher";
import { buildNormalizer } from "../Normalizer/Normalizer";
import { unificationNormalizer } from "../Normalizer/Unification";
import { parseRule, parseTerm } from "../Parser/Parser";
import { Term, TRS } from "../Parser/Types";
import { JSTranslator } from "../Translator/JSTranslator";

const trs: TRS = mapify([
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
].map(rule => defined(parseRule(rule))));

const normalizers = [
    headMatcher(trs),
    new ClosureMatcher(trs).asMatcher()
].map(matcher => buildNormalizer(unificationNormalizer(matcher), arithmeticExternals));

const jsTranslatorNormalizer = (query: Term): Term => {
    trs.set('JSTranslatorQuery', [[fun('JSTranslatorQuery'), query]]);
    let asJS = new JSTranslator(trs, jsArithmeticExternals).translate();
    asJS += '\nshowTerm(grf_JSTranslatorQuery());';
    return defined(parseTerm(eval(asJS)));
};

normalizers.push(new DecisionTreeNormalizer(trs).asNormalizer(arithmeticExternals));
normalizers.push(jsTranslatorNormalizer);

const tests: Array<[Term, Term]> = [
    ['Peano+(S(S(0)), S(S(S(0))))', 'S(S(S(S(S(0)))))'],
    ['Range(2)', ':(0, :(1, :(2, Nil)))'],
    ['Range(10)', ':(0, :(1, :(2, :(3, :(4, :(5, :(6, :(7, :(8, :(9, :(10, Nil)))))))))))'],
    ['Reverse(Range(3))', ':(3, :(2, :(1, :(0, Nil))))'],
    ['Len(Range(11))', '12'],
    ['=(Len(Range(11)), 12)', 'True'],
    ['=(Len(Range(11)), 11)', 'False'],
    ['=(Len(Reverse(Range(11))), Len(Range(11)))', 'True']
].map(([input, output]) => [defined(parseTerm(input)), defined(parseTerm(output))]);

test('Each normalizer should give the same output', () => {
    for (const [input, output] of tests) {
        for (const normalize of normalizers) {
            expect(normalize(input)).toStrictEqual(output);
        }
    }
});