import { Rule, TRS, Fun } from "../../Parser/Types";
import { Err, Ok } from "../../Types";
import { CompilationError, CompilationResult, CompilerPass } from "./CompilerPass";
import { arity, hasDuplicatesSet, ruleArity, ruleName, rulesAlphaEquiv, showRule, vars } from "../Utils";

export type Checker = (rules: Rule[]) => CompilationError[];

// performs a set of checks on each rule
export const check = (...checkers: Checker[]): CompilerPass => {
    return (trs: TRS): CompilationResult => {
        const errors: CompilationError[] = [];

        for (const rules of trs.values()) {
            for (const checker of checkers) {
                errors.push(...checker(rules));
            }
        }

        return errors.length > 0 ? Err(errors) : Ok(trs);
    };
};

export const checkArity: Checker = (rules: Rule[]): CompilationError[] => {
    const errors: CompilationError[] = [];
    const ar = arity(rules);

    for (const rule of rules) {
        // check if the arity is consistent
        if (ruleArity(rule) !== ar) {
            errors.push(`${ruleName(rule)} has inconsistent arities`);
        }
    }

    return errors;
};

export const isLeftLinear = ([lhs, _]: Rule): boolean => {
    return isFunLeftLinear(lhs);
};

export const isFunLeftLinear = (f: Fun): boolean => {
    return !hasDuplicatesSet(vars(f));
};

export const checkLeftLinearity: Checker = (rules: Rule[]): CompilationError[] => {
    const errors: CompilationError[] = [];

    for (const rule of rules) {
        // check if the rule is left-linear
        if (!isLeftLinear(rule)) {
            errors.push(`${showRule(rule)} is not left-linear`);
        }
    }

    return errors;
};

export const hasFreeVars = ([lhs, rhs]: Rule): boolean => {
    const lhsVars = new Set(vars(lhs));
    return vars(rhs).some(x => !lhsVars.has(x));
};

export const checkNoFreeVars: Checker = (rules: Rule[]): CompilationError[] => {
    const errors: CompilationError[] = [];

    for (const rule of rules) {
        if (hasFreeVars(rule)) {
            errors.push(`${ruleName(rule)} contains free variables`);
        }
    }

    return errors;
};

const overlappingRules = (rules: Rule[]): [Rule, Rule][] => {
    const alphaEquivRules: [Rule, Rule][] = [];

    for (let i = 0; i < rules.length; i++) {
        for (let j = 0; j < rules.length; j++) {
            if (i === j) continue;
            const [rule1, rule2] = [rules[i], rules[j]];
            if (rulesAlphaEquiv(rule1, rule2)) {
                alphaEquivRules.push([rule1, rule2]);
            }
        }
    }

    return alphaEquivRules;
};

export const checkNoDuplicates: Checker = (rules: Rule[]): CompilationError[] => {
    const errors: CompilationError[] = [];

    for (const [rule1, rule2] of overlappingRules(rules)) {
        errors.push(`${showRule(rule1)} and ${showRule(rule2)} are overlapping`);
    }

    return errors;
};

export const allChecks = check(
    checkArity,
    checkLeftLinearity,
    checkNoDuplicates,
    checkNoFreeVars
);