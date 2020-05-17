"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.parseTerm = exports.parseRules = exports.parseRule = exports.renameVars = exports.isParserError = void 0;
const Utils_1 = require("../Compiler/Utils");
const Types_1 = require("../Types");
const grammar_js_1 = require("./grammar.js");
const Preprocessor_1 = require("./Preprocessor/Preprocessor");
const Source_1 = require("./Source");
function isParserError(obj) {
    return typeof obj === 'object'
        && obj.hasOwnProperty('message') &&
        obj.hasOwnProperty('originalLine');
}
exports.isParserError = isParserError;
function renameVars(t) {
    if (Utils_1.isVar(t))
        return `$${t}`;
    return {
        name: t.name,
        args: t.args.map(s => renameVars(s))
    };
}
exports.renameVars = renameVars;
exports.parseRule = (rule) => {
    if (!rule.includes('->'))
        return;
    const [lhs, rhs] = rule.split('->');
    const l = exports.parseTerm(lhs);
    const r = exports.parseTerm(rhs);
    if (Utils_1.isSomething(l) && Utils_1.isFun(l) && Utils_1.isSomething(r)) {
        return [l, r];
    }
};
exports.parseRules = (src) => {
    const rules = grammar_js_1.parse(src);
    return Utils_1.mapify(rules.map(([lhs, rhs]) => [lhs, rhs]
    // [renameVars(lhs), renameVars(rhs)]
    ));
};
exports.parseTerm = (term) => {
    try {
        return grammar_js_1.parse(term);
    }
    catch (e) {
        console.error(e);
    }
};
async function parse(source, ...preprocessors) {
    const info = {};
    const src = new Source_1.Source(source);
    const preprocessedSource = await Preprocessor_1.preprocess(src, preprocessors, info);
    if (Types_1.isError(preprocessedSource)) {
        return preprocessedSource;
    }
    try {
        const trs = exports.parseRules(Types_1.unwrap(preprocessedSource));
        return Types_1.Ok({ trs, info: info });
    }
    catch (e) {
        return Types_1.Error([{
                message: e.message.replace(/(Parse error on line [0-9]+:\n)/, ''),
                originalLine: src.originalLineNumber(e.hash.line)
            }]);
    }
}
exports.parse = parse;
