"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showDecisionTree = exports.makeSwitch = exports.makeFail = exports.makeLeaf = void 0;
const Types_1 = require("../../Types");
const Utils_1 = require("../Utils");
exports.makeLeaf = (action) => ({ type: 'leaf', action });
exports.makeFail = () => ({ type: 'fail' });
exports.makeSwitch = (occurence, tests) => {
    return {
        type: 'switch',
        occurence,
        tests
    };
};
const showOccurence = (occ) => {
    const val = Types_1.either(occ.value, showOccurence, Utils_1.showTerm);
    if (occ.index !== undefined)
        return `${val}[${occ.index}]`;
    return val;
};
exports.showDecisionTree = (tree) => {
    switch (tree.type) {
        case 'fail':
            return 'fail;';
        case 'leaf':
            return `return ${Utils_1.showTerm(tree.action)};`;
        case 'switch':
            const tests = [];
            for (const [ctor, A] of tree.tests) {
                if (ctor === '_') {
                    tests.push(`default:
                        ${exports.showDecisionTree(A)}
                    `);
                }
                else {
                    tests.push(`case "${ctor}":
                        ${exports.showDecisionTree(A)}
                    `);
                }
            }
            return `switch (${showOccurence(tree.occurence)}) {
                ${tests.join('\n')}
            }`;
    }
};
