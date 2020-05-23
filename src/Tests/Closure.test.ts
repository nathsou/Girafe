import { Arities } from "../Compiler/Passes/Lazify";
import { closure, collectArities, genSymbolSplitter, makePatterns, stringify, symbs, unstringify } from "../Normalizer/Matchers/ClosureMatcher/Closure";
import { StringClosureMatcher } from "../Normalizer/Matchers/ClosureMatcher/StringClosureMatcher";
import { fun, isSomething } from "../Compiler/Utils";
import { Symb, Term } from "../Parser/Types";
import { gen, iter, join, randomElement } from "../Parser/Utils";

export const ε = '';
export const ω = 'ω';

test('closure', () => {
    const patterns = makePatterns(
        'F(A, x)',
        'F(x, B)',
        'F(G(x), A)'
    );

    const patternsStr = patterns.map(stringify);
    const M = new Set(patternsStr);

    const arities = collectArities(patterns);

    const M_ = closure(M, arities);

    expect(M_).toEqual(new Set([
        'FAω',
        'FAB',
        'FωB',
        'FGωB',
        'FGωA'
    ]));
});

test('matcher', () => {
    const patterns = makePatterns(
        '<(a, b)',
        '<=(a, b)',
        'Not(q)',
        'Not(True)',
        'Not(False)',
        'If(True, a, b)',
        'If(False, a, b)'
    );

    const patternsStr = patterns.map(stringify);
    const M = new Set(patternsStr);
    const arities = collectArities(patterns);
    const M_ = closure(M, arities);
    const matcher = new StringClosureMatcher<string>();
    const symbols = [...arities.keys(), ω];
    const splitSymbols = genSymbolSplitter(symbols);

    for (const p of M_) {
        const letters = splitSymbols(p);
        if (isSomething(letters)) {
            matcher.insert(letters, p);
        }
    }

    expect(matcher.lookup(symbs('<(x, y)'), arities)).toBe('<ωω');
    expect(matcher.lookup(symbs('<=(x, y)'), arities)).toBe('<=ωω');

});

const genArbitraryTerm = (arities: Array<[Symb, number]>): Term => {
    if (Math.random() < 0.05) return ω;
    const [f, ar] = randomElement(arities);
    return fun(f, ...gen(ar, () => genArbitraryTerm(arities)));
};

test('unstringify', () => {
    const arities: [Symb, number][] = [
        ['If', 3],
        ['>', 2],
        ['=', 2],
        ['And', 2],
        ['Or', 2],
        ['Not', 1],
        ['Neg', 1],
        ['IsPrime', 1],
        ['True', 0],
        ['False', 0],
        ['0', 0],
        ['1', 0],
        ['3', 0],
        ['17', 0],
        ['1621', 0]
    ];

    const terms = makePatterns(
        'If(>(a, b), c, d)',
        'Not(q)',
        'Not(True)',
        'Not(Not(Not(Not(q))))',
        '>(a, b)',
        'False',
        'If(Not(>(x, y)), b, False)',
        'If(1621, 1, 0)'
    );

    const aritiesMap: Arities = new Map(arities);
    const splitSymbols = genSymbolSplitter([...aritiesMap.keys(), ω]);

    for (const term of join(iter(terms), gen(100, () => genArbitraryTerm(arities)))) {
        expect(unstringify(stringify(term), splitSymbols, aritiesMap)).toStrictEqual(term);
    }
});