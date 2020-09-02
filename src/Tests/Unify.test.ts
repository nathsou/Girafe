import { Arities } from "../Compiler/Passes/Lazify";
import { fun, isSomething } from "../Compiler/Utils";
import { ruleBasedUnify as unify } from '../Normalizer/RuleBasedUnify';
import { parseTerm } from "../Parser/Parser";
import { Substitution, Term } from "../Parser/Types";
import { gen } from "../Parser/Utils";
import { mutateTerm, randomLeftLinearFun, substIn, substsEq, testPrng } from "./TestUtils";

const rnd = testPrng;

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
        ['a', 'b', { 'a': 'b' }],
        ['b', 'a', { 'b': 'a' }],
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
        ['a', 'S(a)', Fail],
        ['D(E(E(w, x), y), z)', 'D(E(E(P(w), x), y), z)', Fail],
        ['D(E(E(w, x), y), z)', 'D(E(E(P(t), x), y), z)', {
            'w': fun('P', 't')
        }],
    ] as Array<[string, string, Substitution]>)
        .map(([s, t, sigma]) => [parseTerm(s), parseTerm(t), sigma])
        .filter(
            ([s, t]) => isSomething(s) && isSomething(t)
        ) as Array<[Term, Term, Substitution]>;

    for (const [s, t, sigma] of tests) {
        expect(unify(s, t)).toStrictEqual(sigma);
    }

    const arities: Arities = new Map();

    const randomUnificationTest = (): [Term, Term, Substitution] => {
        const s = randomLeftLinearFun(rnd, arities);
        const [t, sigma] = mutateTerm(rnd, s, arities);
        return [s, t, sigma];
    };

    for (const [s, t, sigma] of gen(100, randomUnificationTest)) {
        const sig = unify(s, t);
        if (sig) {
            expect(substsEq(sig, sigma)).toBe(true);
        }
    }
});