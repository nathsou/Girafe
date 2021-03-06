import { collectSymbols } from "../../Normalizer/Matchers/ClosureMatcher/Closure";
import { ruleBasedUnify } from "../../Normalizer/RuleBasedUnify";
import { Fun, Rule, Term, TRS, Var } from "../../Parser/Types";
import { find, indexed, partition } from "../../Parser/Utils";
import { Ok } from "../../Types";
import { And, Eq, False, True, useAnd } from '../Passes/Imports';
import { decons, freshPrefixedSymb, fun, funs, genVars, head, isSomething, isVar, occurrences, rule, ruleName, split, tail, vars } from "../Utils";
import { isLeftLinear } from "./Checks";
import { CompilationResult, CompilerPass } from "./CompilerPass";

export const symbolNameSimulationSuffix = /_(sim)[0-9]+/g;

const rulesName = (rules: Rule[]): string => ruleName(rules[0]);

// transforms a general TRS into a left-linear one
// requires a structural equality external function (eqSymb)
// should be used with a normalizeLhsArgs pass
export const leftLinearize: CompilerPass = (trs: TRS): CompilationResult => {
    const symbs = collectSymbols(funs(trs));

    const notLeftLinear = find(trs.keys(), name => trs.get(name).some(rule => !isLeftLinear(rule)));

    if (notLeftLinear) {
        const rules = trs.get(notLeftLinear);
        for (const [rule, index] of indexed(rules)) {
            if (!isLeftLinear(rule)) {
                const [prev, rem] = split(rules, index);
                const {
                    updatedRule,
                    simRules,
                    selectRules,
                    unchangedRules
                } = leftLinearizeRule(rule, tail(rem), symbs);

                trs.set(notLeftLinear, [...prev, updatedRule, ...unchangedRules]);

                if (selectRules.length > 0) {
                    trs.set(rulesName(selectRules), selectRules);
                }

                if (simRules.length > 0) {
                    trs.set(rulesName(simRules), simRules);
                }
            }
        }

        useAnd(trs);

        // left linearize the updated TRS
        return leftLinearize(trs);
    }

    return Ok(trs);
};

const leftLinearizeRule = (
    [lhs, rhs]: Rule,
    remainingRules: Rule[], // less specific rules with the same head symbol
    symbs: Set<string>
): {
    updatedRule: Rule,
    selectRules: Rule[],
    simRules: Rule[],
    unchangedRules: Rule[],
} => {
    const lhsVars = vars(lhs);
    const rhsVars = vars(rhs);
    const uniqueVars = genVars(lhsVars.length);
    const counts = occurrences(lhsVars);
    const eqs: Fun[] = [];

    for (const occs of counts.values()) {
        if (occs.length > 1) {
            eqs.push(allEq(occs.map(idx => uniqueVars[idx])));
        }
    }

    const newRhsVars = rhsVars.map(v => uniqueVars[lhsVars.indexOf(v)]);
    const simName = freshPrefixedSymb(`${lhs.name}_sim`, symbs);
    const newLhs = replaceVars<Fun>(lhs, uniqueVars);

    const selectRuleName = freshPrefixedSymb(`${lhs.name}_select`, symbs);

    const updatedRule: Rule = [newLhs, fun(selectRuleName, conjunction(eqs), ...newLhs.args)];

    const selectRules: Rule[] = [
        [fun(selectRuleName, True, ...newLhs.args), replaceVars(rhs, newRhsVars)],
        [fun(selectRuleName, False, ...newLhs.args), fun(simName, ...newLhs.args)],
    ];

    // only change the head symbol of matching rules
    const [
        matchingRules,
        unchangedRules
    ] = partition(remainingRules, ([lhs2, _]) => isSomething(ruleBasedUnify(lhs, lhs2)));

    return {
        updatedRule,
        simRules: matchingRules.map(([lhs, rhs]) => rule(fun(simName, ...lhs.args), rhs)),
        selectRules,
        unchangedRules
    };
};

export function replaceVars<T extends Term>(t: Term, newVars: Var[], i = { offset: 0 }): T {
    if (isVar(t)) return newVars[i.offset++] as T;
    return fun(t.name, ...t.args.map(s => replaceVars(s, newVars, i))) as T;
}

const conjunction = (terms: Term[]): Term => {
    if (terms.length === 0) return True;
    if (terms.length === 1) return head(terms);
    const [h, tl] = decons(terms);
    return And(h, conjunction(tl));
};

// allEq(['a', 'b', 'c']) = And(Eq('a', 'b'), Eq('b', 'c'))
const allEq = (terms: Term[]): Fun => {
    if (terms.length <= 1) return True;
    if (terms.length === 2) return Eq(terms[0], terms[1]);

    const [h, tl] = decons(terms);
    return And(Eq(h, head(tl)), allEq(tl));
};

export const removeSimSuffixes = (term: string): string => {
    return term.replace(symbolNameSimulationSuffix, '');
};