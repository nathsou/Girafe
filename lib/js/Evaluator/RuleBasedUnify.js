"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleBasedUnify = void 0;
const Types_1 = require("../Parser/Types");
const Utils_1 = require("../Compiler/Utils");
const Utils_2 = require("../Parser/Utils");
exports.ruleBasedUnify = (s, t) => unify([[s, t]]);
const unify = (eqs, sigma = {}) => {
    if (eqs.length === 0)
        return sigma;
    const [a, b] = eqs.pop();
    if (Utils_1.isVar(a) && Utils_1.isVar(b) && a === b) { // Delete
        return unify(eqs, sigma);
    }
    if (Utils_1.isFun(a) && Utils_1.isFun(b) &&
        a.name == b.name &&
        a.args.length == b.args.length) { // Decompose
        eqs.push(...Utils_1.zip(a.args, b.args));
        return unify(eqs, sigma);
    }
    if (Utils_1.isVar(a) && !Utils_1.occurs(a, b)) {
        if (Types_1.mapHas(sigma, a)) {
            // handles non left-linear rules
            if (Utils_1.termsEq(Types_1.mapGet(sigma, a), b)) {
                return unify(eqs, sigma);
            }
        }
        else {
            if (Utils_1.isVar(b)) {
                return unify(eqs, Types_1.mapSet(sigma, b, a));
            }
        }
    }
    if (Utils_1.isFun(a) && Utils_1.isVar(b)) {
        Types_1.mapSet(sigma, b, a);
        return unify(Utils_2.mapMut(eqs, ([s, t]) => [Utils_1.substitute(s, sigma), Utils_1.substitute(t, sigma)]), sigma);
    }
};
