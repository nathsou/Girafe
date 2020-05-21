"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileClauseMatrix = exports.occurencesOf = exports.defaultClauseMatrix = exports.specializeClauseMatrix = exports.clauseMatrixOf = exports.patternOf = exports._ = void 0;
const Types_1 = require("../../Parser/Types");
const Utils_1 = require("../../Parser/Utils");
const Types_2 = require("../../Types");
const Utils_2 = require("../Utils");
const DecisionTree_1 = require("./DecisionTree");
exports._ = '_';
exports.patternOf = (term) => {
    if (Utils_2.isVar(term))
        return exports._;
    return { name: term.name, args: term.args.map(exports.patternOf) };
};
// all the rules must share the same head symbol and arity
exports.clauseMatrixOf = (rules) => {
    return {
        patterns: rules.map(rule => Utils_2.lhs(rule).args.map(t => exports.patternOf(t))),
        dims: [rules.length, Utils_2.arity(rules)],
        actions: rules.map(rule => Utils_2.rhs(rule))
    };
};
const specializeRow = (row, ctor, arity) => {
    const [p, ps] = Utils_2.decons(row);
    if (p === exports._)
        return [...Utils_1.repeat(exports._, arity), ...ps];
    if (p.name === ctor)
        return [...p.args, ...ps];
};
exports.specializeClauseMatrix = (matrix, c, arity) => {
    const patterns = matrix.patterns
        .map(row => specializeRow(row, c, arity));
    const actions = [...Utils_2.zip(patterns, matrix.actions)]
        .filter(([p, a]) => p)
        .map(([p, a]) => a);
    return {
        patterns: patterns.filter(Utils_2.isSomething),
        dims: [actions.length, arity + matrix.dims[1] - 1],
        actions
    };
};
const defaultRow = (row) => {
    const [p, ps] = Utils_2.decons(row);
    if (p === exports._)
        return ps;
};
exports.defaultClauseMatrix = (matrix) => {
    const patterns = matrix.patterns.map(defaultRow);
    const actions = [...Utils_2.zip(patterns, matrix.actions)]
        .filter(([p, a]) => p)
        .map(([p, a]) => a);
    return {
        patterns: patterns.filter(Utils_2.isSomething),
        dims: [actions.length, matrix.dims[1] - 1],
        actions
    };
};
const getColumn = (matrix, i) => {
    const col = [];
    for (const row of matrix.patterns) {
        col.push(row[i]);
    }
    return col;
};
const selectColumn = (matrix) => {
    for (let i = 0; i < matrix.dims[1]; i++) {
        if (getColumn(matrix, i).some(p => p !== exports._)) {
            return i;
        }
    }
    Types_1.unreachable('No valid column found');
};
const swapColumn = (matrix, i) => {
    for (const row of matrix.patterns) {
        Utils_2.swapMut(row, 0, i);
    }
};
const heads = (patterns) => {
    const hds = new Map();
    for (const p of patterns) {
        if (p !== exports._) {
            hds.set(p.name, p.args.length);
        }
    }
    return hds;
};
exports.occurencesOf = (...terms) => {
    return terms.map(t => ({ value: Types_2.Right(t) }));
};
exports.compileClauseMatrix = (occurences, matrix, signature) => {
    const [m, n] = matrix.dims;
    if (m === 0)
        return DecisionTree_1.makeFail();
    if (m > 0 && (n === 0 || matrix.patterns[0].every(p => p === exports._))) {
        return DecisionTree_1.makeLeaf(matrix.actions[0]);
    }
    const colIdx = selectColumn(matrix);
    if (colIdx !== 0) {
        Utils_2.swapMut(occurences, 0, colIdx);
        swapColumn(matrix, colIdx);
    }
    const col = getColumn(matrix, 0);
    const hds = heads(col);
    const tests = [];
    for (const [ctor, arity] of hds) {
        const o1 = [...Utils_1.gen(arity, i => ({
                value: Types_2.Left(occurences[0]),
                index: i
            }))];
        const A_k = exports.compileClauseMatrix([...o1, ...Utils_2.tail(occurences)], exports.specializeClauseMatrix(matrix, ctor, arity), signature);
        tests.push([ctor, A_k]);
    }
    if (!Utils_2.setEq(hds, signature)) {
        const A_D = exports.compileClauseMatrix(Utils_2.tail(occurences), exports.defaultClauseMatrix(matrix), signature);
        tests.push([exports._, A_D]);
    }
    return DecisionTree_1.makeSwitch(Utils_2.head(occurences), tests);
};
