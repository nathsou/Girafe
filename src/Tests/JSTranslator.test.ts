import { defined, mapify } from "../Compiler/Utils";
import { parseRule } from "../Parser/Parser";
import { JSTranslator } from "../Translator/JSTranslator";

test('JSTranslator sould not throw errors', () => {
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