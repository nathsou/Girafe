"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleBasedUnify = void 0;
const Utils_1 = require("../Compiler/Utils");
const Types_1 = require("../Parser/Types");
const Utils_2 = require("../Parser/Utils");
exports.ruleBasedUnify = (s, t) => unify([[s, t]]);
// http://moscova.inria.fr/~levy/courses/X/IF/03/pi/levy2/martelli-montanari.pdf
const unify = (eqs, sigma = {}) => {
    if (eqs.length === 0)
        return sigma;
    const [s, t] = eqs.pop();
    // Delete
    if (Utils_1.termsEq(s, t)) {
        return unify(eqs, sigma);
    }
    // Decompose
    if (Utils_1.isFun(s) && Utils_1.isFun(t) &&
        s.name == t.name &&
        s.args.length == t.args.length) {
        eqs.push(...Utils_1.zip(s.args, t.args));
        return unify(eqs, sigma);
    }
    // We use directed unification
    // so we don't need the orient rule
    // // Orient
    // if (isVar(t) && !isVar(s)) {
    //     eqs.push([t, s]);
    //     return unify(eqs, sigma);
    // }
    // Eliminate
    if (Utils_1.isVar(s) && !Utils_1.occurs(s, t)) {
        const S_ = Utils_2.mapMut(eqs, ([a, b]) => [
            Utils_1.substitute(a, sigma),
            Utils_1.substitute(b, sigma)
        ]);
        return unify(S_, Types_1.mapSet(sigma, s, t));
    }
};
