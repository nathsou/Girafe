import { Term, Var } from "../../Parser/Types";
import { CompilerPass } from "./CompilerPass";
export declare const leftLinearize: CompilerPass;
export declare function replaceVars<T extends Term>(t: Term, newVars: Var[], i?: {
    offset: number;
}): T;
