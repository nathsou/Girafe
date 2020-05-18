"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionTreeTranslator = void 0;
const Lazify_1 = require("../../Compiler/Passes/Lazify");
const Utils_1 = require("../../Parser/Utils");
const Translator_1 = require("../../Translator/Translator");
const Utils_2 = require("../Utils");
const DecisionTreeCompiler_1 = require("./DecisionTreeCompiler");
class DecisionTreeTranslator extends Translator_1.Translator {
    constructor(trs, externals) {
        super(trs, externals);
        this.arities = Lazify_1.collectTRSArities(trs);
        this.signature = new Set(this.arities.keys());
    }
    translateRules(name, rules) {
        const renameVars = (t, sigma, i = 0, j = 0, parent) => {
            const name = parent ? this.accessSubterm(parent, j) : `v${(i + 1)}`;
            if (Utils_2.isVar(t)) {
                sigma[t] = name;
                return;
            }
            t.args.forEach((s, idx) => {
                renameVars(s, sigma, i + idx, idx, name);
            });
        };
        const newVars = Utils_2.genVars(Utils_2.ruleArity(Utils_2.fst(rules)));
        const rules_ = rules.map(([lhs, rhs]) => {
            const sigma = {};
            for (const [t, i] of Utils_1.indexed(lhs.args)) {
                renameVars(t, sigma, i);
            }
            return [
                Utils_2.substitute(lhs, sigma),
                Utils_2.substitute(rhs, sigma)
            ];
        });
        const m = DecisionTreeCompiler_1.clauseMatrixOf(rules_);
        const occs = DecisionTreeCompiler_1.occurencesOf(...newVars);
        const dt = DecisionTreeCompiler_1.compileClauseMatrix(occs, m, this.signature);
        return this.translateDecisionTree(name, dt, newVars);
    }
}
exports.DecisionTreeTranslator = DecisionTreeTranslator;
