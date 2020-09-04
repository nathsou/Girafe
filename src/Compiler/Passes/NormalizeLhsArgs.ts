import { CompilerPass, CompilationResult } from "./CompilerPass";
import { TRS, Rule } from "../../Parser/Types";
import { NativeExternals } from "../../Externals/Externals";
import { Ok } from "../../Types";
import { mapify, rules, fun } from "../Utils";
import { DecisionTreeNormalizer } from "../../Normalizer/DecisionTreeNormalizer";

export const normalizeLhsArgs: (externals: NativeExternals<string>) => CompilerPass = exts => {
    return (trs: TRS): CompilationResult => {
        const newRules: Rule[] = [];
        const norm = new DecisionTreeNormalizer(trs).asNormalizer(exts);

        for (const [lhs, rhs] of rules(trs)) {
            const r: Rule = [fun(lhs.name, ...lhs.args.map(norm)), rhs];
            newRules.push(r);
        }

        return Ok(mapify(newRules));
    };
};