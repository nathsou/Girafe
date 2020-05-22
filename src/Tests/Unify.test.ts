import { isSomething, fun } from "../Compiler/Utils";
import { parseTerm } from "../Parser/Parser";
import { Term, Substitution } from "../Parser/Types";
import { ruleBasedUnify as unify } from '../Evaluator/RuleBasedUnify'
import { gen } from "../Parser/Utils";
import { randomTerm, mutateTerm, substIn, substsEq } from "./TestUtils";

test('substIn', () => {
    expect(substIn({ 'a': 'b', 'c': 'd' }, { 'c': 'd', 'a': 'b' })).toBe(true);
    expect(substIn({ 'a': 'b' }, { 'c': 'd', 'a': 'b' })).toBe(true);
    expect(substIn({ 'c': 'd', 'a': 'b' }, { 'a': 'b' })).toBe(false);
});

test('substEq', () => {
    expect(substsEq({ 'a': 'b', 'c': 'd' }, { 'c': 'd', 'a': 'b' })).toBe(true);
    expect(substsEq({ 'a': 'b', 'c': 'd', 'e': 'e' }, { 'c': 'd', 'a': 'b' })).toBe(true);
    expect(substsEq({ 'a': 'b' }, { 'c': 'd', 'a': 'b' })).toBe(false);
    expect(substsEq({ 'c': 'd', 'a': 'b' }, { 'a': 'b' })).toBe(false);
});

test('ruleBasedUnify', () => {
    const Fail = undefined;

    const tests = ([
        ['F(A, B)', 'G(A, B)', Fail],
        ['F(A, B)', 'F(A, B)', {}],
        ['F(G, H, I(J, K(L(x))))', 'F(G, H, I(J, K(L(y))))', { 'x': 'y' }],
        ['F(G, H, I(J, K(L(x))))', 'F(G, H, I(J, K(L(M))))', { 'x': fun('M') }],
        ['F(G, H, I(J, K(L(x))))', 'F(G, H, I(J, K(M(x))))', Fail],
        ['A(B(C(D(a, b), c), d), e)', 'A(B(C(D(1, 2), 3), 4), 5)', {
            'a': fun('1'),
            'b': fun('2'),
            'c': fun('3'),
            'd': fun('4'),
            'e': fun('5')
        }],
        ['Layout(Azerty, Qwerty)', 'Layout(Qwerty, Azerty)', Fail],
        ['If(True, a, b)', 'If(True, 2, *(3, 7))', {
            'a': fun('2'),
            'b': fun('*', fun('3'), fun('7'))
        }],
        ['If(True, a, b)', 'If(False, 2, *(3, 7))', Fail],
        ['Eq(a, b)', 'Eq(b, a)', { 'a': 'b', 'b': 'a' }],
        ['+(a, 0)', '+(S(x), 0)', { 'a': fun('S', 'x') }],
        ['+(S(x), 0)', '+(a, 0)', Fail],
    ] as Array<[string, string, Substitution]>)
        .map(([s, t, sigma]) => [parseTerm(s), parseTerm(t), sigma])
        .filter(
            ([s, t]) => isSomething(s) && isSomething(t)
        ) as Array<[Term, Term, Substitution]>;

    for (const [s, t, sigma] of tests) {
        expect(unify(s, t)).toStrictEqual(sigma);
    }

    const randomUnificationTest = (): [Term, Term, Substitution] => {
        const s = randomTerm();
        const [t, sigma] = mutateTerm(s);
        return [s, t, sigma];
    };

    for (const [s, t, sigma] of gen(100, randomUnificationTest)) {
        const sig = unify(s, t);
        if (sig) {
            expect(substsEq(sig, sigma)).toBe(true);
        }
    }
});