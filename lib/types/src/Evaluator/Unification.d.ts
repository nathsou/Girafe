import { Maybe } from "../Compiler/Utils";
import { FileReader } from "../Parser/Preprocessor/Import";
import { Fun, JSExternals, Term, TRS } from "../Parser/Types";
import { TermMatcher } from "./Matchers/TermMatcher/TermMatcher";
import { Unificator } from "./Unificator";
export declare const match: Unificator;
export declare const matches: (s: Term, t: Term) => boolean;
export declare function compileRules(src: string, passes: import("../Compiler/Passes/CompilerPass").CompilerPass[], fileReader: FileReader): Promise<Maybe<TRS>>;
export declare const oneStepReduce: (term: Fun, externals: JSExternals<string>, matcher: TermMatcher) => {
    term: Term;
    changed: boolean;
};
export declare const reduce: (term: Term, externals: JSExternals<string>, matcher: TermMatcher) => Term;
export declare const parseTRS: (term: string) => Maybe<Term>;
