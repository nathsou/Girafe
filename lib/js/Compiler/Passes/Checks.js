"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allChecks = exports.checkNoDuplicates = exports.checkNoFreeVars = exports.hasFreeVars = exports.checkLeftLinearity = exports.isLeftLinear = exports.checkArity = exports.check = void 0;
const Types_1 = require("../../Types");
const Utils_1 = require("../Utils");
// performs a set of checks on each rule
exports.check = (...checkers) => {
    return (trs) => {
        const errors = [];
        for (const rules of trs.values()) {
            for (const checker of checkers) {
                errors.push(...checker(rules));
            }
        }
        return errors.length > 0 ? Types_1.Err(errors) : Types_1.Ok(trs);
    };
};
exports.checkArity = (rules) => {
    const errors = [];
    const ar = Utils_1.arity(rules);
    for (const rule of rules) {
        // check if the arity is consistent
        if (Utils_1.ruleArity(rule) !== ar) {
            errors.push(`${Utils_1.ruleName(rule)} has inconsistent arities`);
        }
    }
    return errors;
};
exports.isLeftLinear = ([lhs, _]) => {
    return !Utils_1.hasDuplicatesSet(Utils_1.vars(lhs));
};
exports.checkLeftLinearity = (rules) => {
    const errors = [];
    for (const rule of rules) {
        // check if the rule is left-linear
        if (!exports.isLeftLinear(rule)) {
            errors.push(`${Utils_1.showRule(rule)} is not left-linear`);
        }
    }
    return errors;
};
exports.hasFreeVars = ([lhs, rhs]) => {
    const lhsVars = new Set(Utils_1.vars(lhs));
    return Utils_1.vars(rhs).some(x => !lhsVars.has(x));
};
exports.checkNoFreeVars = (rules) => {
    const errors = [];
    for (const rule of rules) {
        if (exports.hasFreeVars(rule)) {
            errors.push(`${Utils_1.ruleName(rule)} contains free variables`);
        }
    }
    return errors;
};
const overlappingRules = (rules) => {
    const alphaEquivRules = [];
    for (let i = 0; i < rules.length; i++) {
        for (let j = 0; j < rules.length; j++) {
            if (i === j)
                continue;
            const [rule1, rule2] = [rules[i], rules[j]];
            if (Utils_1.rulesAlphaEquiv(rule1, rule2)) {
                alphaEquivRules.push([rule1, rule2]);
            }
        }
    }
    return alphaEquivRules;
};
exports.checkNoDuplicates = (rules) => {
    const errors = [];
    for (const [rule1, rule2] of overlappingRules(rules)) {
        errors.push(`${Utils_1.showRule(rule1)} and ${Utils_1.showRule(rule2)} are overlapping`);
    }
    return errors;
};
exports.allChecks = exports.check(exports.checkArity, exports.checkLeftLinearity, exports.checkNoDuplicates, exports.checkNoFreeVars);
