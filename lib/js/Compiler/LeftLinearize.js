"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceVars = exports.leftLinearize = void 0;
const Checks_1 = require("./Checks");
const Imports_1 = require("./Imports");
const Utils_1 = require("./Utils");
const Types_1 = require("../Types");
// transforms a general TRS into a left-linear one
// requires a structural equality external function (eqSymb)
exports.leftLinearize = (trs) => {
    const removedRules = [];
    const newRules = [];
    for (const rules of trs.values()) {
        for (const rule of rules) {
            if (!Checks_1.isLeftLinear(rule)) {
                const lhsVars = Utils_1.vars(Utils_1.lhs(rule));
                const rhsVars = Utils_1.vars(Utils_1.rhs(rule));
                const uniqueVars = Utils_1.genVars(lhsVars.length);
                const counts = Utils_1.occurences(lhsVars);
                const eqs = [];
                for (const occs of counts.values()) {
                    if (occs.length > 1) {
                        eqs.push(allEq(occs.map(idx => uniqueVars[idx])));
                    }
                }
                const newRhsVars = rhsVars.map(v => uniqueVars[lhsVars.indexOf(v)]);
                const newRule = [
                    replaceVars(Utils_1.lhs(rule), uniqueVars),
                    Imports_1.If(conjunction(eqs), replaceVars(Utils_1.rhs(rule), newRhsVars), Utils_1.fun('.'))
                ];
                removedRules.push(rule);
                newRules.push(newRule);
            }
        }
    }
    Utils_1.removeRules(trs, ...removedRules);
    Utils_1.addRules(trs, ...newRules);
    if (newRules.length > 0) {
        Imports_1.useIf(trs);
        Imports_1.useAnd(trs);
    }
    return Types_1.Ok(trs);
};
function replaceVars(t, newVars, i = { offset: 0 }) {
    if (Utils_1.isVar(t))
        return newVars[i.offset++];
    return Utils_1.fun(t.name, ...t.args.map(s => replaceVars(s, newVars, i)));
}
exports.replaceVars = replaceVars;
const conjunction = (terms) => {
    if (terms.length === 0)
        return Imports_1.True();
    if (terms.length === 1)
        return Utils_1.head(terms);
    const [h, tl] = Utils_1.decons(terms);
    return Imports_1.And(h, conjunction(tl));
};
// allEq(['a', 'b', 'c']) = And(Eq('a', 'b'), Eq('b', 'c'))
const allEq = (terms) => {
    if (terms.length <= 1)
        return Imports_1.True();
    if (terms.length === 2)
        return Imports_1.Eq(Utils_1.fst(terms), Utils_1.snd(terms));
    const [h, tl] = Utils_1.decons(terms);
    return Imports_1.And(Imports_1.Eq(h, Utils_1.head(tl)), allEq(tl));
};
