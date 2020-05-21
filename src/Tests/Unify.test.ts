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
        ['Layout(Azerty, Qwerty)', 'Layout(Qwerty, Azerty)', Fail],
        ['If(True, a, b)', 'If(True, 2, *(3, 7))', {
            'a': fun('2'),
            'b': fun('*', fun('3'), fun('7'))
        }],
        ['If(True, a, b)', 'If(False, 2, *(3, 7))', Fail],
        ['Eq(a, b)', 'Eq(b, a)', { 'a': 'b', 'b': 'a' }]
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