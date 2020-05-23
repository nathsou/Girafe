import { Term, TRS } from "../../Parser/Types";
import { Unificator } from "../Unificator";
import { Matcher } from "./Matcher";
import { isVar } from "../../Compiler/Utils";

// A matcher checking all the rules corresponding to the term's head symbol 
export const headMatcher: (trs: TRS) => Matcher = (trs: TRS) => {
    return (term: Term, unificator: Unificator): ReturnType<Matcher> => {
        if (isVar(term)) return;
        for (const [lhs, rhs] of (trs.get(term.name) ?? [])) {
            const sigma = unificator(term, lhs);
            if (sigma) return { sigma, rule: [lhs, rhs] };
        }
    };
};