import { clauseMatrixOf, compileClauseMatrix, defaultClauseMatrix, occurencesOf, specializeClauseMatrix } from '../Compiler/DecisionTrees/DecisionTreeCompiler';
import { isSomething } from "../Compiler/Utils";
import { parseRule } from "../Parser/Parser";

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

test('compileClauseMatrix', () => {
    const m = clauseMatrixOf(rules);
    const sig = new Set([':', 'Nil', 'If']);
    const decisionTree = compileClauseMatrix(
        occurencesOf('as', 'bs'),
        m,
        sig
    );

    expect(decisionTree).toStrictEqual({
        "type": "switch",
        "occurence": {
            "value": [
                "as",
                "right"
            ]
        },
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
                    "occurence": {
                        "value": [
                            "bs",
                            "right"
                        ]
                    },
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
                    "occurence": {
                        "value": [
                            "bs",
                            "right"
                        ]
                    },
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
    });

    const sig2 = new Set([':', 'Nil']);
    const decisionTree2 = compileClauseMatrix(
        occurencesOf('as', 'bs'),
        m,
        sig2
    );

    expect(decisionTree2).toStrictEqual({
        "type": "switch",
        "occurence": {
            "value": [
                "as",
                "right"
            ]
        },
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
                    "occurence": {
                        "value": [
                            "bs",
                            "right"
                        ]
                    },
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
    });
});