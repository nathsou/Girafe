import { Rule, Term, TRS } from "../../Parser/Types";
import { Ok } from "../../Types";
import { emptyTRS, isFun, isVar, lhs, zip, hasDuplicates, vars } from "../Utils";
import { CompilationResult, CompilerPass } from "./CompilerPass";

export type TotalOrder = (s: Term, t: Term) => boolean;

export const ruleOrder = (
    order: TotalOrder,
    rule1: Rule,
    rule2: Rule
): number => (
        order(lhs(rule1), lhs(rule2)) ? 1 : -1
    );

export const orderBy = (order: TotalOrder): CompilerPass => {
    return (trs: TRS): CompilationResult => {
        const reordered = emptyTRS();

        for (const [name, rules] of trs.entries()) {
            reordered.set(
                name,
                rules.sort((a, b) => ruleOrder(order, a, b))
            );
        }

        return Ok(reordered);
    };
}

export const lessSpecific: TotalOrder = (s: Term, t: Term): boolean => {
    if (isVar(s) && isFun(t)) return true;
    if (isFun(s) && isVar(t)) return false;
    if (isFun(s) && isFun(t)) {
        if (s.args.length !== t.args.length) {
            return s.args.length < t.args.length;
        }

        for (const [a, b] of zip(s.args, t.args)) {
            if (lessSpecific(a, b)) return true;
        }

        // left-linear rules are less specific than non-left-linear ones
        if (!hasDuplicates(vars(s)) && hasDuplicates(vars(t))) {
            return true;
        }

        return s.name > t.name;
    }

    return false;
};

export const orderBySpecificity = orderBy(lessSpecific);