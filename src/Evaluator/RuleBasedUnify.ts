import { Substitution, Term, mapHas, mapGet, mapSet } from "../Parser/Types";
import { isVar, Maybe, isFun, zip, occurs, termsEq, substitute } from "../Compiler/Utils";
import { Unificator } from "./Unificator";
import { mapMut } from "../Parser/Utils";

export const ruleBasedUnify: Unificator = (s: Term, t: Term): Maybe<Substitution> => unify([[s, t]]);

const unify = (eqs: [Term, Term][], sigma: Substitution = {}): Maybe<Substitution> => {
    if (eqs.length === 0) return sigma;
    const [a, b] = eqs.pop();

    if (isVar(a) && isVar(b) && a === b) { // Delete
        return unify(eqs, sigma);
    }

    if (
        isFun(a) && isFun(b) &&
        a.name == b.name &&
        a.args.length == b.args.length
    ) { // Decompose
        eqs.push(...zip(a.args, b.args));
        return unify(eqs, sigma);
    }

    if (isVar(a) && !occurs(a, b)) {
        if (mapHas(sigma, a)) {
            // handles non left-linear rules
            if (termsEq(mapGet(sigma, a), b)) {
                return unify(eqs, sigma);
            }
        } else {
            if (isVar(b)) {
                return unify(eqs, mapSet(sigma, b, a));
            }
        }
    }

    if (isFun(a) && isVar(b)) {
        mapSet(sigma, b, a);
        return unify(mapMut(eqs, ([s, t]) => [substitute(s, sigma), substitute(t, sigma)]), sigma);
    }
};