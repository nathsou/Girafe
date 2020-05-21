import { Maybe } from "../../Compiler/Utils";
import { Source } from "../Source";
import { Either } from "../../Types";
import { ParserError } from "../TRSParser";
import { LexerError } from "../Lexer/Lexer";
export declare type PreprocessorResult = Maybe<Array<LexerError | ParserError>>;
export declare type PrepocessorPass<Info = {}> = (source: Source, passes: PrepocessorPass<Info>[], info: Partial<Info>) => Promise<PreprocessorResult>;
export declare function preprocess<Info extends {} = {}>(source: string | Source, passes: PrepocessorPass<Info>[], info?: Partial<Info>): Promise<Either<string, Array<ParserError | LexerError>>>;
