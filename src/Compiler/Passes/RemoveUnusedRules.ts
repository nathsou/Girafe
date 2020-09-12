import { Symb, TRS } from "../../Parser/Types";
import { Ok } from "../../Types";
import { allSymbs } from "../Utils";
import { CompilationResult, CompilerPass } from "./CompilerPass";

export const removeUnusedRules = (startingRule: Symb): CompilerPass => {
    return (trs: TRS): CompilationResult => {
        const usedRules = collectUsedRules(trs, startingRule);

        for (const ruleName of trs.keys()) {
            if (!usedRules.has(ruleName)) {
                trs.delete(ruleName);
            }
        }

        return Ok(trs);
    };
}

const collectUsedRules = (
    trs: TRS,
    start: Symb,
    usedRules: Set<string> = new Set()
): Set<string> => {
    if (usedRules.has(start)) return;
    const rules = trs.get(start) ?? [];
    usedRules.add(start);

    for (const [lhs, rhs] of rules) {
        const symbs: Symb[] = [];
        for (const arg of lhs.args) {
            allSymbs(arg, symbs);
        }

        allSymbs(rhs, symbs);

        for (const f of symbs) {
            collectUsedRules(trs, f, usedRules);
        }
    }

    return usedRules;
};