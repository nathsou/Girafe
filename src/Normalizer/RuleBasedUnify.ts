import { isFun, isVar, Maybe, occurs, substitute, zip } from "../Compiler/Utils";
import { dictSet, Substitution, Term } from "../Parser/Types";
import { mapMut } from "../Parser/Utils";
import { Unificator } from "./Unificator";

export const ruleBasedUnify: Unificator = (s: Term, t: Term): Maybe<Substitution> => unify([[s, t]]);

// http://moscova.inria.fr/~levy/courses/X/IF/03/pi/levy2/martelli-montanari.pdf
// We use directed unification so we don't need the orient/swap rule
const unify = (eqs: [Term, Term][]): Maybe<Substitution> => {
    const sigma: Substitution = {};

    while (eqs.length > 0) {
        const [s, t] = eqs.pop();

        // Decompose
        if (
            isFun(s) && isFun(t, s.name) &&
            s.args.length === t.args.length
        ) {
            eqs.push(...zip(s.args, t.args));
            continue;
        }

        // Delete (at this point s === t iff isVar(s) && isVar(t, s))
        if (s === t) continue;

        // Eliminate
        if (isVar(s) && !occurs(s, t)) {
            mapMut(eqs, eq => mapMut(eq, u => substitute(u, sigma)));
            dictSet(sigma, s, t)
            continue;
        }

        return; // not unifyable
    }

    return sigma;
};