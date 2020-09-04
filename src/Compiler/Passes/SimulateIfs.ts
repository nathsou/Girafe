import { Rule, Term, TRS } from "../../Parser/Types";
import { Ok } from "../../Types";
import { fun, isVar, mapify, rules, uniq, vars } from "../Utils";
import { CompilationResult, CompilerPass } from "./CompilerPass";
import { False, ifSymb, True } from "./Imports";

export const simulateIfs: CompilerPass = (trs: TRS): CompilationResult => {
    const newRules: Rule[] = [];
    const addRules = (rules: Rule[]) => { newRules.push(...rules); };

    for (const [lhs, rhs] of rules(trs)) {
        newRules.push([lhs, simIf(rhs, addRules)]);
    }

    return Ok(mapify(newRules));
};

let ifs_count = 0;

const simIf = (
    term: Term,
    addRules: (rules: Rule[]) => void
): Term => {
    if (isVar(term)) return term;
    if (term.name === ifSymb) {
        const ifName = `${ifSymb}_sim${ifs_count++}`;
        const [cond, thenExpr, elseExpr] = term.args;

        const simVars = uniq([...vars(thenExpr), ...vars(elseExpr)]);

        const sim: Rule[] = [
            [fun(ifName, True(), ...simVars), simIf(thenExpr, addRules)],
            [fun(ifName, False(), ...simVars), simIf(elseExpr, addRules)]
        ];

        addRules(sim);

        return fun(ifName, cond, ...simVars);
    }

    return fun(term.name, ...term.args.map(t => simIf(t, addRules)));
};