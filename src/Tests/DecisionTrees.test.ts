import { DecisionTree, evaluate, getOccurence } from '../Compiler/DecisionTrees/DecisionTree';
import { clauseMatrixOf, compileClauseMatrix, defaultClauseMatrix, Occcurence, specializeClauseMatrix, occurencesOf } from '../Compiler/DecisionTrees/DecisionTreeCompiler';
import { fun, isSomething } from "../Compiler/Utils";
import { DecisionTreeMatcher } from '../Evaluator/Matchers/DecisionTreeMatcher';
import { parseRule, parseRules, parseTerm } from "../Parser/Parser";
import { Term, Dict } from '../Parser/Types';

const rules = [
    'Merge(Nil, b) -> 1',
    'Merge(a, Nil) -> 2',
    'Merge(:(a, as), :(b, bs)) -> 3',
].map(parseRule).filter(isSomething);

test('clauseMatrixOf', () => {
    const m = clauseMatrixOf(rules);

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
    const m = clauseMatrixOf(rules);
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

test('specializeClauseMatrix', () => {
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
    "occurence": "as",
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
                "occurence": "bs",
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
    const m = clauseMatrixOf(rules);
    const sig = new Set([':', 'Nil', 'If']);
    const decisionTree = compileClauseMatrix(
        ['as', 'bs'],
        m,
        sig
    );

    const expected: DecisionTree = {
        "type": "switch",
        "occurence": "as",
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
                    "occurence": "bs",
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
                    "occurence": "bs",
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
        ['as', 'bs'],
        m,
        sig2
    );

    expect(decisionTree2).toStrictEqual(mergeDecisionTree);
});

test('getOccurence', () => {
    const tests: Array<[Occcurence, Term]> = [
        [{
            value: fun(':', 'h', 'tl'),
            index: 0
        }, 'h'],
        [{
            value: fun(':', 'h', 'tl'),
            index: 1
        }, 'tl'],
        [fun(':', 'h', 'tl'), fun(':', 'h', 'tl')],
        [{
            value: {
                value: fun(':', 'a', fun(':', 'b', 'c')),
                index: 1
            },
            index: 0
        }, 'b'],
    ];

    for (const [occ, res] of tests) {
        expect(getOccurence({}, occ)).toStrictEqual(res);
    }
});

test('evaluate', () => {
    expect(evaluate({ 'as': fun('Nil') }, mergeDecisionTree)).toStrictEqual(fun('1'));

    expect(evaluate({
        'as': fun(':', '1', 'Nil'),
        'bs': fun('Nil')
    }, mergeDecisionTree)).toStrictEqual(fun('2'));

    expect(evaluate({
        'as': fun(':', 'x', 'xs'),
        'bs': fun(':', 'y', 'ys'),
    }, mergeDecisionTree)).toStrictEqual(fun('3'));

    expect(evaluate({
        'as': fun('+', 'x', 'y'),
        'bs': fun(':', 'y', 'ys'),
    }, mergeDecisionTree)).toStrictEqual(undefined);
});

test('occurencesOf', () => {
    type Subst = Dict<Occcurence>;

    const tests = ([
        ['a', { 'a': 'a' }],
        ['Just(Symbols, No, Vars)', {}],
        ['S(a)', { 'a': { value: fun('S', 'a'), index: 0 } }],
        ['S(S(x))', { 'x': { value: { value: fun('S', fun('S', 'x')), index: 0 }, index: 0 } }],
        ['+(a, b)', {
            'a': { value: fun('+', 'a', 'b'), index: 0 },
            'b': { value: fun('+', 'a', 'b'), index: 1 }
        }],
        ['+(a, S(b))', {
            'a': { value: fun('+', 'a', fun('S', 'b')), index: 0 },
            'b': {
                value: {
                    value: fun('+', 'a', fun('S', 'b')),
                    index: 1
                },
                index: 0
            }
        }]
    ] as Array<[string, Subst]>)
        .map(([a, sigma]) => [parseTerm(a), sigma]) as Array<[Term, Subst]>;

    for (const [a, expectedSigma] of tests) {
        const sigma = occurencesOf(a);
        expect(sigma).toStrictEqual(expectedSigma);
    }
});

test('DecisionTreeMatcher', () => {
    const trs = parseRules([
        'Merge(Nil, bs) -> 1',
        'Merge(as, Nil) -> 2',
        'Merge(:(a, as), :(b, bs)) -> 3',
        'Test(a) -> a'
    ].join('\n'));

    if (trs) {
        const matcher = new DecisionTreeMatcher(trs);
        expect(matcher.match(fun('Merge', fun('Nil'), 'ys'))).toStrictEqual(fun('1'));
        // expect(matcher.match(fun('Test', 'x'))).toStrictEqual('x');
    }
});