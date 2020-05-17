import { Maybe } from "../Compiler/Utils";
import { Result } from "../Types";
import { PrepocessorPass } from "./Preprocessor/Preprocessor";
import { Rule, Term, TRS } from "./Types";
export declare type ParserError = {
    message: string;
    originalLine: number;
};
export declare function isParserError(obj: any): obj is ParserError;
export declare function renameVars<T extends Term>(t: Term): T;
export declare const parseRule: (rule: string) => Maybe<Rule>;
export declare const parseRules: (src: string) => TRS;
export declare const parseTerm: (term: string) => Maybe<Term>;
export declare function parse<Info = {}>(source: string, ...preprocessors: PrepocessorPass[]): Promise<Result<{
    trs: TRS;
    info: Info;
}, ParserError[]>>;
