import { TRS } from "../../Parser/Types";
import { indexed } from "../../Parser/Utils";
import { Ok } from "../../Types";
import { associate, substitute, vars } from "../Utils";
import { CompilationResult } from "./CompilerPass";

const varNamePrefix = 'var_';

// makes sure every variable appears exactly once (to prevent occurs check errors in other passes)
export const uniqueVarNames = (trs: TRS): CompilationResult => {
    let count = 0;

    for (const [_, rules] of trs) {
        for (const [[lhs, rhs], idx] of indexed(rules)) {
            const subst = associate(vars(lhs), () => `${varNamePrefix}${count++}`);
            rules[idx] = [substitute(lhs, subst), substitute(rhs, subst)];
        }
    }

    return Ok(trs);
};