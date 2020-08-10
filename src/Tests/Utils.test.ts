import { isRuleRecursive, isSomething, unusedRuleVars, setEq, replaceTermAt, defined, showTerm } from "../Compiler/Utils";
import { parseRule, parseTerm } from "../Parser/Parser";

test('isRuleRecursive', () => {
    const notRecursiveRules = [
        '-(a, b) -> @sub(a, b)',
        'Range(n) -> RangeAux(n, Nil)',
        'RangeAux(0, rng) -> Reverse(rng)',
        'IsPrime(n) -> IsPrimeAux(n, 3)'
    ].map(parseRule).filter(isSomething);

    const recursiveRules = [
        'A -> A',
        'RangeAux(n, rng) -> RangeAux(-(n, 1), :(n, rng))',
        'G -> A(B(C(D(E(F(G))))))',
        'IsPrimeAux(n, i) -> If(Divisible(n, i), False, IsPrimeAux(n, +(i, 2)))'
    ].map(parseRule).filter(isSomething);

    expect(recursiveRules.every(isRuleRecursive)).toBe(true);
    expect(notRecursiveRules.some(isRuleRecursive)).toBe(false);
});

test('unusedRuleVars', () => {

    const tests: Array<[string, string[]]> = [
        ['-(a, b) -> @sub(a, b)', []],
        ['F(a, b, c) -> G(b)', ['a', 'c']],
        ['Len(lst) -> LenAux(lst, 0)', []],
        ['LenAux(Nil, n) -> n', []],
        ['ZipAux(Nil, l2, z) -> Reverse(z)', ['l2']]
    ];

    for (const [ruleStr, out] of tests) {
        const rule = parseRule(ruleStr);

        if (rule) {
            expect(unusedRuleVars(rule)).toEqual(new Set(out));
        }
    }
});

test('setEq', () => {
    expect(setEq(new Set(['a', 'b']), new Set(['a', 'b']))).toBe(true);
    expect(setEq(new Set(['a', 'b']), new Set(['b', 'a']))).toBe(true);
    expect(setEq(new Set(['a']), new Set(['b', 'a']))).toBe(false);
    expect(setEq(new Set(['a', 'b', 'c']), new Set(['b', 'a']))).toBe(false);

    expect(setEq(
        new Set(['a', 'b']),
        new Map([['b', 1], ['a', 2]])
    )).toBe(true);

    // Map { 'Nil' => 0, ':' => 2 } Set { ':', 'Nil' }

    expect(setEq(
        new Map([['Nil', 0], [':', 2]]),
        new Set([':', 'Nil']),
    )).toBe(true);
});

test('replaceTermAt', () => {
    const tests = [
        {
            parent: 'If(Or(a, b), IsPrime(a), IsPrime(b))',
            child: '+(a, b)',
            pos: [1, 0],
            res: 'If(Or(a, b), IsPrime(+(a, b)), IsPrime(b))'
        },
        { parent: 'x', child: '+(a, b)', pos: [1, 0], res: 'x' },
        { parent: 'Not(q)', child: 'And(u, v)', pos: [], res: 'Not(q)' },
        {
            parent: 'If(Or(a, b), IsPrime(a), IsPrime(b))',
            child: 'Divisible(b, a)',
            pos: [0],
            res: 'If(Divisible(b, a), IsPrime(a), IsPrime(b))'
        },
    ].map(({ parent, child, pos, res }) => ({
        parent: defined(parseTerm(parent)),
        child: defined(parseTerm(child)),
        res: defined(parseTerm(res)),
        pos
    }));

    for (const { parent, child, pos, res } of tests) {
        expect(showTerm(replaceTermAt(parent, child, pos))).toBe(showTerm(res));
    }
});