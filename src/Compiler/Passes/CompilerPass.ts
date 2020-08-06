import { TRS } from "../../Parser/Types";
import { unwrap, isError, Ok, Result } from "../../Types";
import { showTRS } from "../Utils";

export type CompilationMessage = { type: 'error' | 'warning', message: string };
export type CompilationResult = Result<TRS, CompilationMessage[]>;
export type CompilerPass = (trs: TRS) => CompilationResult;

export const compile = (trs: TRS, ...passes: CompilerPass[]): CompilationResult => {
    if (passes.length === 0) return Ok(trs);

    for (const pass of passes) {
        const res = pass(trs);

        if (isError(res)) {
            return res;
        }

        trs = unwrap(res);
    }

    return Ok(trs);
};

export function log(trs: TRS): CompilationResult {
    console.log(showTRS(trs));
    return Ok(trs);
}