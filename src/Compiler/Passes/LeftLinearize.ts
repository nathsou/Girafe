import { Fun, Rule, Term, TRS, Var } from "../../Parser/Types";
import { isLeftLinear } from "./Checks";
import { CompilationResult, CompilerPass } from "./CompilerPass";
import { And, Eq, If, True, useAnd, useIf } from '../Passes/Imports';
import { addRules, decons, fst, fun, genVars, head, isVar, lhs, occurences, removeRules, rhs, snd, vars } from "../Utils";
import { Ok } from "../../Types";

// transforms a general TRS into a left-linear one
// requires a structural equality external function (eqSymb)
export const leftLinearize: CompilerPass = (trs: TRS): CompilationResult => {
    const removedRules: Rule[] = [];
    const newRules: Rule[] = [];

    for (const rules of trs.values()) {
        for (const rule of rules) {
            if (!isLeftLinear(rule)) {
                const lhsVars = vars(lhs(rule));
                const rhsVars = vars(rhs(rule));
                const uniqueVars = genVars(lhsVars.length);
                const counts = occurences(lhsVars);
                const eqs: Fun[] = [];

                for (const occs of counts.values()) {
                    if (occs.length > 1) {
                        eqs.push(allEq(occs.map(idx => uniqueVars[idx])));
                    }
                }

                const newRhsVars = rhsVars.map(v => uniqueVars[lhsVars.indexOf(v)]);

                const newRule: Rule = [
                    replaceVars(lhs(rule), uniqueVars),
                    If(conjunction(eqs), replaceVars(rhs(rule), newRhsVars), fun('.'))
                ];

                removedRules.push(rule);
                newRules.push(newRule);
            }
        }
    }

    removeRules(trs, ...removedRules);
    addRules(trs, ...newRules);

    if (newRules.length > 0) {
        useIf(trs);
        useAnd(trs);
    }

    return Ok(trs);
};

export function replaceVars<T extends Term>(t: Term, newVars: Var[], i = { offset: 0 }): T {
    if (isVar(t)) return newVars[i.offset++] as T;
    return fun(t.name, ...t.args.map(s => replaceVars(s, newVars, i))) as T;
}

const conjunction = (terms: Term[]): Term => {
    if (terms.length === 0) return True();
    if (terms.length === 1) return head(terms);
    const [h, tl] = decons(terms);
    return And(h, conjunction(tl));
};

// allEq(['a', 'b', 'c']) = And(Eq('a', 'b'), Eq('b', 'c'))
const allEq = (terms: Term[]): Fun => {
    if (terms.length <= 1) return True();
    if (terms.length === 2) return Eq(fst(terms), snd(terms));

    const [h, tl] = decons(terms);
    return And(Eq(h, head(tl)), allEq(tl));
};