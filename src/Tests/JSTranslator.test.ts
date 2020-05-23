import { defined, mapify } from "../Compiler/Utils";
import { parseRule } from "../Parser/Parser";
import { JSTranslator } from "../Translator/JSTranslator";

it('Peano additionn', () => {
    const trs = mapify([
        '+(a, 0) -> a',
        '+(0, b) -> b',
        '+(S(a), b) -> S(+(a, b))',
        '+(a, S(b)) -> S(+(a, b))',
        '1 -> S(0)',
        '2 -> S(1)',
        '3 -> S(2)',
        'Query -> +(3, 2)',
    ].map(r => defined(parseRule(r))));

    const translator = new JSTranslator(trs, {});
    let res = translator.translate();
    res += '\nshowTerm(grf_Query());'

    expect(eval(res)).toBe('S(S(S(S(S(0)))))');
});

it('Fib', () => {
    const trs = mapify([
        '1 -> S(0)',
        '2 -> S(1)',
        '3 -> S(2)',
        '4 -> S(3)',
        '5 -> S(4)',
        '6 -> S(5)',
        '7 -> S(6)',
        '8 -> S(7)',
        '9 -> S(8)',
        '+(0, b) -> b',
        '+(a, 0) -> a',
        '+(S(a), b) -> S(+(a, b))',
        '+(a, S(b)) -> S(+(a, b))',
        'Fib(0) -> 0',
        'Fib(S(0)) -> 1',
        'Fib(S(S(n))) -> +(Fib(S(n)), Fib(n))',
        'Query -> Fib(7)'
    ].map(r => defined(parseRule(r))));

    const translator = new JSTranslator(trs, {});
    let res = translator.translate();
    res += '\nshowTerm(grf_Query());'

    expect(eval(res)).toBe('S(S(S(S(S(S(S(S(S(S(S(S(S(0)))))))))))))');
});