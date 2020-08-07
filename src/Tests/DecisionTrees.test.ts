import { DecisionTree, evaluate, getOccurence } from '../Compiler/DecisionTrees/DecisionTree';
import { ClauseMatrix, clauseMatrixOf, compileClauseMatrix, defaultClauseMatrix, IndexedOccurence, isNeeded, isPatternMoreGeneral, isPatternRedundant, OccTerm, occTermOfRule, occurencesOf, Pattern, patternOf, specializeClauseMatrix } from '../Compiler/DecisionTrees/DecisionTreeCompiler';
import { defined, fun, isSomething } from "../Compiler/Utils";
import { DecisionTreeNormalizer } from '../Normalizer/DecisionTreeNormalizer';
import { parseRule, parseRules, parseTerm } from "../Parser/Parser";
import { Dict, Rule, Term } from '../Parser/Types';

const mergeRules = [
    'Merge(Nil, b) -> 1',
    'Merge(a, Nil) -> 2',
    'Merge(:(a, as), :(b, bs)) -> 3',
].map(r => defined(parseRule(r)));

test('clauseMatrixOf', () => {
    const m = clauseMatrixOf(mergeRules);

    expect(m.patterns).toStrictEqual([
        [{ name: 'Nil', args: [] }, '_'],
        ['_', { name: 'Nil', args: [] }],
        [{ name: ':', args: ['_', '_'] }, { name: ':', args: ['_', '_'] }]
    ]);

    expect(m.dims).toStrictEqual([3, 2]);

    expect(m.actions).toStrictEqual([
        { name: '1', args: [] },
        { name: '2', args: [] },
        { name: '3', args: [] }
    ]);
});

test('specializeClauseMatrix', () => {
    const m = clauseMatrixOf(mergeRules);
    const S = specializeClauseMatrix(m, ':', 2);

    expect(S.patterns).toStrictEqual([
        ['_', '_', { name: 'Nil', args: [] }],
        ['_', '_', { name: ':', args: ['_', '_'] }],
    ]);

    expect(S.dims).toStrictEqual([2, 3]);

    expect(S.actions).toStrictEqual([
        { name: '2', args: [] },
        { name: '3', args: [] }
    ]);

    const S2 = specializeClauseMatrix(m, 'Nil', 0);

    expect(S2.patterns).toStrictEqual([
        ['_'],
        [{ name: 'Nil', args: [] }]
    ]);

    expect(S2.dims).toStrictEqual([2, 1]);

    expect(S2.actions).toStrictEqual([
        { name: '1', args: [] },
        { name: '2', args: [] }
    ]);
});

test('defaultClauseMatrix', () => {
    const rules = [
        'Test(Nil, b) -> 1',
        'Test(a, Nil) -> 2',
        'Test(a, b) -> 3',
    ].map(parseRule).filter(isSomething);

    const m = clauseMatrixOf(rules);
    const D = defaultClauseMatrix(m);

    expect(D.patterns).toStrictEqual([
        [{ name: 'Nil', args: [] }],
        ['_'],
    ]);

    expect(D.dims).toStrictEqual([2, 1]);

    expect(D.actions).toStrictEqual([
        { name: '2', args: [] },
        { name: '3', args: [] }
    ]);
});

const mergeDecisionTree: DecisionTree = {
    "type": "switch",
    "occurence": { index: 0, pos: [] },
    "tests": [
        [
            "Nil",
            {
                "type": "leaf",
                "action": {
                    "name": "1",
                    "args": []
                }
            }
        ],
        [
            ":",
            {
                "type": "switch",
                "occurence": { index: 1, pos: [] },
                "tests": [
                    [
                        "Nil",
                        {
                            "type": "leaf",
                            "action": {
                                "name": "2",
                                "args": []
                            }
                        }
                    ],
                    [
                        ":",
                        {
                            "type": "leaf",
                            "action": {
                                "name": "3",
                                "args": []
                            }
                        }
                    ]
                ]
            }
        ]
    ]
};

test('compileClauseMatrix', () => {
    const m = clauseMatrixOf(mergeRules);
    const sig = new Set([':', 'Nil', 'If']);
    const decisionTree = compileClauseMatrix(
        2,
        m,
        sig
    );

    const expected: DecisionTree = {
        "type": "switch",
        "occurence": { index: 0, pos: [] },
        "tests": [
            [
                "Nil",
                {
                    "type": "leaf",
                    "action": {
                        "name": "1",
                        "args": []
                    }
                }
            ],
            [
                ":",
                {
                    "type": "switch",
                    "occurence": { index: 1, pos: [] },
                    "tests": [
                        [
                            "Nil",
                            {
                                "type": "leaf",
                                "action": {
                                    "name": "2",
                                    "args": []
                                }
                            }
                        ],
                        [
                            ":",
                            {
                                "type": "leaf",
                                "action": {
                                    "name": "3",
                                    "args": []
                                }
                            }
                        ],
                        [
                            "_",
                            {
                                "type": "fail"
                            }
                        ]
                    ]
                }
            ],
            [
                "_",
                {
                    "type": "switch",
                    "occurence": { index: 1, pos: [] },
                    "tests": [
                        [
                            "Nil",
                            {
                                "type": "leaf",
                                "action": {
                                    "name": "2",
                                    "args": []
                                }
                            }
                        ],
                        [
                            "_",
                            {
                                "type": "fail"
                            }
                        ]
                    ]
                }
            ]
        ]
    };

    expect(decisionTree).toStrictEqual(expected);

    const sig2 = new Set([':', 'Nil']);
    const decisionTree2 = compileClauseMatrix(
        2,
        m,
        sig2
    );

    expect(decisionTree2).toStrictEqual(mergeDecisionTree);
});

test('getOccurence', () => {
    const tests: Array<[Term[], IndexedOccurence, Term]> = [
        [[fun(':', 'h', 'tl')], { index: 0, pos: [] }, fun(':', 'h', 'tl')],
        [[fun(':', 'h', 'tl')], { index: 0, pos: [0] }, 'h'],
        [[fun(':', 'h', 'tl')], { index: 0, pos: [1] }, 'tl'],
        [[
            defined(parseTerm('C(H(I, C(a, g, O(x, y))))')),
            defined(parseTerm('P(A(R, i, S(0)))')),
        ], { index: 1, pos: [0, 2] }, fun('S', fun('0'))],
        [[
            defined(parseTerm('C(H(I, C(a, g, O(x, y))))')),
            defined(parseTerm('P(A(R, i, S(0)))')),
        ], { index: 0, pos: [0, 1, 2, 1] }, 'y'],
    ];

    for (const [ts, occ, res] of tests) {
        expect(getOccurence(ts, occ)).toStrictEqual(res);
    }
});

test('occurencesOf', () => {
    type Subst = Dict<IndexedOccurence>;

    const tests: Array<[Term, Subst]> = ([
        ['a', { 'a': { index: 0, pos: [] } }],
        ['Just(Symbols, No, Vars)', {}],
        ['S(a)', { 'a': { index: 0, pos: [0] } }],
        ['S(S(x))', { 'x': { index: 0, pos: [0, 0] } }],
        ['+(a, b)', {
            'a': { index: 0, pos: [0] },
            'b': { index: 0, pos: [1] }
        }],
        ['+(a, S(b))', {
            'a': { index: 0, pos: [0] },
            'b': { index: 0, pos: [1, 0] }
        }],
        ['A(B(c, d, E(f, G(h))))', {
            'c': { index: 0, pos: [0, 0] },
            'd': { index: 0, pos: [0, 1] },
            'f': { index: 0, pos: [0, 2, 0] },
            'h': { index: 0, pos: [0, 2, 1, 0] }
        }],
        ["Range(S(n), rng)", {
            'n': { index: 0, pos: [0, 0] },
            'rng': { index: 0, pos: [1] }
        }]
    ] as Array<[string, Subst]>)
        .map(([a, sigma]) => [parseTerm(a), sigma]) as Array<[Term, Subst]>;

    for (const [a, expectedSigma] of tests) {
        const sigma = occurencesOf(a);
        expect(sigma).toStrictEqual(expectedSigma);
    }
});

test('occTermOfRule', () => {
    const tests: Array<[Rule, OccTerm]> = ([
        ['A(x) -> x', { index: 0, pos: [] }],
        ['+(a, S(b)) -> S(+(a, b))', {
            name: 'S',
            args: [{
                name: '+',
                args: [
                    { index: 0, pos: [] },
                    { index: 1, pos: [0] },
                ]
            }]
        }],
    ] as Array<[string, OccTerm]>)
        .map(([rule, term]) => ([defined(parseRule(rule)), term]));

    for (const [rule, expectedOccTerm] of tests) {
        expect(occTermOfRule(rule)).toStrictEqual(expectedOccTerm);
    }
});

test('evaluate', () => {
    expect(evaluate([fun('Nil')], mergeDecisionTree)).toStrictEqual(fun('1'));

    expect(evaluate([
        fun(':', '1', 'Nil'),
        fun('Nil')
    ], mergeDecisionTree)).toStrictEqual(fun('2'));

    expect(evaluate([
        fun(':', 'x', 'xs'),
        fun(':', 'y', 'ys'),
    ], mergeDecisionTree)).toStrictEqual(fun('3'));

    expect(evaluate([
        fun('+', 'x', 'y'),
        fun(':', 'y', 'ys'),
    ], mergeDecisionTree)).toStrictEqual(undefined);

    expect(evaluate(
        [fun('S', 'y')],
        compileClauseMatrix(1, clauseMatrixOf([
            [fun('Test', fun('S', 'x')), 'x']
        ]), new Set(['Test', 'S']))
    )).toStrictEqual('y');

    expect(evaluate(
        [fun('S', fun('S', fun('S', 'a')))],
        compileClauseMatrix(1, clauseMatrixOf([
            [fun('Test', fun('S', fun('S', fun('S', 'x')))), 'x']
        ]), new Set(['Test', 'S']))
    )).toStrictEqual('a');

});

test('DecisionTreeMatcher', () => {
    const trs = parseRules([
        'Merge(Nil, bs) -> 1',
        'Merge(as, Nil) -> 2',
        'Merge(:(a, as), :(b, bs)) -> 3',
        'Test(a) -> a',
        'T(R(O(Y(E(s))))) -> s',
        "Range(n) -> Range'(n, Nil)",
        "Range'(0, rng) -> rng",
        "Range'(S(n), rng) -> Range'(n, :(n, rng))",
        "+(a, 0) -> a",
        "+(0, b) -> b",
        "+(a, S(b)) -> S(+(a, b))",
        "+(S(a), b) -> S(+(a, b))"
    ].join('\n'));

    if (trs) {
        const nf = new DecisionTreeNormalizer(trs);
        expect(nf.oneStepReduce(fun('Merge', fun('Nil'), 'ys'))).toStrictEqual(fun('1'));
        expect(nf.oneStepReduce(defined(parseTerm('T(R(O(Y(E(ns)))))')))).toStrictEqual('ns');

        expect(nf.oneStepReduce(
            defined(parseTerm('Range(S(S(0)))'))
        )).toStrictEqual(
            defined(parseTerm("Range'(S(S(0)), Nil)"))
        );

        expect(nf.oneStepReduce(
            defined(parseTerm("Range'(S(S(0)), Nil)"))
        )).toStrictEqual(
            defined(parseTerm("Range'(S(0), :(S(0), Nil))"))
        );

        expect(nf.oneStepReduce(
            defined(parseTerm("Range'(S(0), :(S(0), Nil))"))
        )).toStrictEqual(
            defined(parseTerm("Range'(0, :(0, :(S(0), Nil)))"))
        );

        expect(nf.oneStepReduce(
            defined(parseTerm("Range'(0, :(0, :(S(0), Nil)))"))
        )).toStrictEqual(
            defined(parseTerm(":(0, :(S(0), Nil))"))
        );

        expect(nf.asNormalizer({})(
            defined(parseTerm('Range(S(S(0)))'))
        )).toStrictEqual(
            defined(parseTerm(':(0, :(S(0), Nil))'))
        );

        expect(nf.oneStepReduce(
            defined(parseTerm('+(S(0), 0)'))
        )).toStrictEqual(
            defined(parseTerm('S(0)'))
        );

        expect(nf.oneStepReduce(
            defined(parseTerm('+(0, S(0))'))
        )).toStrictEqual(
            defined(parseTerm('S(0)'))
        );

        expect(nf.oneStepReduce(
            defined(parseTerm('+(a, S(b))'))
        )).toStrictEqual(
            defined(parseTerm('S(+(a, b))'))
        );
    }
});

test('isPatternMoreGeneral', () => {
    const tests = ([
        ['+(a, S(b))', '+(S(a), b)', false],
        ['+(S(a), b)', '+(a, S(b))', false],
        ['x', '+(a, S(b))', true],
        ['+(a, S(b))', 'x', false],
        ['a', 'b', true],
        ['A(x, B(y, z))', 'A(x, B(y, C))', true],
        ['A(x, B(y, C))', 'A(x, B(y, z))', false],
        ['A', 'B', false],
        ['A(x)', 'A(3)', true],
        ['A(3)', 'A(x)', false],
        ['A(a, b, 3)', 'A(a, 7, 3)', true],
        ['A(a, B(c, 9), 3)', 'A(a, B(2, 9), 3)', true],
    ] as Array<[string, string, boolean]>).map(([p1, p2, res]) => [
        patternOf(defined(parseTerm(p1))),
        patternOf(defined(parseTerm(p2))),
        res
    ]) as Array<[Pattern, Pattern, boolean]>;

    for (const [p1, p2, res] of tests) {
        expect(isPatternMoreGeneral(p1, p2)).toBe(res);
    }
});

test('isPatternRedundant', () => {
    const tests = ([
        [['x', 'Nil', ':(h, tl)'], 1, true],
    ] as Array<[string[], number, boolean]>).map(([ps, idx, res]) => [
        ps.map(p => patternOf(defined(parseTerm(p)))),
        idx,
        res
    ]) as Array<[Pattern[], number, boolean]>;

    for (const [ps, idx, res] of tests) {
        expect(isPatternRedundant(idx, ps)).toBe(res);
    }
});

const necessityMatrixOf = (matrix: ClauseMatrix): boolean[][] => {
    const [rows, cols] = matrix.dims;
    const neccesityMatrix: boolean[][] = [];

    for (let row = 0; row < rows; row++) {
        neccesityMatrix[row] = [];
        for (let col = 0; col < cols; col++) {
            neccesityMatrix[row][col] = isNeeded(row, col, matrix);
        }
    }

    return neccesityMatrix;
};

test('isNeeded', () => {
    const m = clauseMatrixOf(mergeRules);
    const N = necessityMatrixOf(m);
    expect(N).toStrictEqual([[true, false], [true, true], [true, true]]);
});