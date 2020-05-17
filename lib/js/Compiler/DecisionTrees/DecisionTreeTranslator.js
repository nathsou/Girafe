"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionTreeTranslator = void 0;
const Lazify_1 = require("../../Compiler/Passes/Lazify");
const Translator_1 = require("../../Translator/Translator");
const Utils_1 = require("../Utils");
const DecisionTreeCompiler_1 = require("./DecisionTreeCompiler");
class DecisionTreeTranslator extends Translator_1.Translator {
    constructor(trs, externals) {
        super(trs, externals);
        this.arities = Lazify_1.collectTRSArities(trs);
        this.signature = new Set(this.arities.keys());
    }
    translateRules(name, rules) {
        const newVars = Utils_1.genVars(Utils_1.ruleArity(Utils_1.fst(rules)));
        const rules_ = rules.map(([lhs, rhs]) => {
            const sigma = {};
            const unusedVars = Utils_1.unusedRuleVars([lhs, rhs]);
            for (const [a, b] of Utils_1.zip(lhs.args, newVars)) {
                if (Utils_1.isVar(a)) {
                    sigma[a] = unusedVars.has(a) ? `_${b}` : b;
                }
            }
            return [
                Utils_1.substitute(lhs, sigma),
                Utils_1.substitute(rhs, sigma)
            ];
        });
        const m = DecisionTreeCompiler_1.clauseMatrixOf(rules_);
        const occs = DecisionTreeCompiler_1.occurencesOf(...newVars);
        const dt = DecisionTreeCompiler_1.compileClauseMatrix(occs, m, this.signature);
        return this.translateDecisionTree(name, dt, newVars);
    }
}
exports.DecisionTreeTranslator = DecisionTreeTranslator;
