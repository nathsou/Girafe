"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduce = exports.oneStepReduce = exports.compileRules = exports.matches = exports.match = void 0;
const CompilerPass_1 = require("../Compiler/Passes/CompilerPass");
const Utils_1 = require("../Compiler/Utils");
const Parser_1 = require("../Parser/Parser");
const Import_1 = require("../Parser/Preprocessor/Import");
const Lists_1 = require("../Parser/Preprocessor/Lists");
const RemoveComments_1 = require("../Parser/Preprocessor/RemoveComments");
const Strings_1 = require("../Parser/Preprocessor/Strings");
const Types_1 = require("../Parser/Types");
const Utils_2 = require("../Parser/Utils");
const Types_2 = require("../Types");
const RuleBasedUnify_1 = require("./RuleBasedUnify");
exports.match = RuleBasedUnify_1.ruleBasedUnify;
exports.matches = (s, t) => Utils_1.isSomething(exports.match(s, t));
function logErrors(errors) {
    for (const err of Types_2.unwrap(errors)) {
        console.error(err);
    }
}
async function compileRules(src, passes = Utils_1.defaultPasses, fileReader) {
    const rules = await Parser_1.parse(src, RemoveComments_1.removeComments, Import_1.handleImports(fileReader), Strings_1.convertStrings, Lists_1.consLists);
    console.log(rules);
    if (Types_2.isError(rules)) {
        logErrors(rules);
        return;
    }
    const trs = CompilerPass_1.compile(Types_2.unwrap(rules).trs, ...passes);
    if (Types_2.isError(trs)) {
        logErrors(trs);
        return;
    }
    return Types_2.unwrap(trs);
}
exports.compileRules = compileRules;
exports.oneStepReduce = (term, externals = {}, matcher) => {
    // externals
    if (term.name.charAt(0) === "@") {
        const f = term.name.substr(1);
        if (Types_1.mapHas(externals, f)) {
            const newTerm = externals[f](term);
            return { term: newTerm, changed: newTerm !== term };
        }
        else {
            throw new Error(`Unknown external function: "${f}"`);
        }
    }
    const rules = matcher.lookup(term);
    if (rules) {
        for (const [lhs, rhs] of rules) {
            const sigma = exports.match(term, lhs);
            if (sigma) {
                return { term: Utils_1.substitute(rhs, sigma), changed: true };
            }
        }
    }
    return { term, changed: false };
};
exports.reduce = (term, externals = {}, matcher) => {
    if (Utils_1.isVar(term))
        return term;
    let reduced = { term, changed: true };
    while (reduced.changed) {
        if (Utils_1.isVar(reduced.term))
            return reduced.term;
        Utils_2.mapMut(reduced.term.args, (s) => exports.reduce(s, externals, matcher));
        reduced = exports.oneStepReduce(reduced.term, externals, matcher);
    }
    return reduced.term;
};
