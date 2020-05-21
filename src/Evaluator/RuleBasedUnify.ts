import { isFun, isVar, Maybe, occurs, substitute, termsEq, zip } from "../Compiler/Utils";
import { mapSet, Substitution, Term } from "../Parser/Types";
import { mapMut } from "../Parser/Utils";
import { Unificator } from "./Unificator";

export const ruleBasedUnify: Unificator = (s: Term, t: Term): Maybe<Substitution> => unify([[s, t]]);

// http://moscova.inria.fr/~levy/courses/X/IF/03/pi/levy2/martelli-montanari.pdf
const unify = (eqs: [Term, Term][], sigma: Substitution = {}): Maybe<Substitution> => {
    if (eqs.length === 0) return sigma;
    const [s, t] = eqs.pop();

    // Delete
    if (termsEq(s, t)) {
        return unify(eqs, sigma);
    }

    // Decompose
    if (
        isFun(s) && isFun(t) &&
        s.name == t.name &&
        s.args.length == t.args.length
    ) {
        eqs.push(...zip(s.args, t.args));
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
    if (isVar(s) && !occurs(s, t)) {
        const S_: Array<[Term, Term]> = mapMut(eqs, ([a, b]) => [
            substitute(a, sigma),
            substitute(b, sigma)
        ]);

        return unify(S_, mapSet(sigma, s, t));
    }
};