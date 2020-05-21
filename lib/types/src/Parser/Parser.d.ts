import { Maybe } from "../Compiler/Utils";
import { Result } from "../Types";
import { LexerError } from "./Lexer/Lexer";
import { PrepocessorPass } from "./Preprocessor/Preprocessor";
import { ParserError } from "./TRSParser";
import { Rule, Term, TRS } from "./Types";
export declare function renameVars<T extends Term>(t: Term): T;
export declare const parseRule: (str: string) => Maybe<Rule>;
export declare const parseRules: (src: string) => Maybe<TRS>;
export declare const parseTerm: (str: string) => Maybe<Term>;
export declare function parse<Info = {}>(source: string, ...preprocessors: PrepocessorPass[]): Promise<Result<{
    trs: TRS;
    info: Info;
}, Array<ParserError | LexerError>>>;
