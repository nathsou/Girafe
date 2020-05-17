import { TRS } from "../../Parser/Types";
import { Result } from "../../Types";
export declare type CompilationError = string;
export declare type CompilationResult = Result<TRS, CompilationError[]>;
export declare type CompilerPass = (trs: TRS) => CompilationResult;
export declare const compile: (trs: TRS, ...passes: CompilerPass[]) => CompilationResult;
export declare function log(trs: TRS): CompilationResult;
