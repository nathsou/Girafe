import { Result } from "../../Types";
import { PositionInfo, Token } from "./Token";
export declare type LexerError = InvalidCharError | UnmatchingParensError;
export declare type InvalidCharError = {
    type: 'InvalidChar';
    char: string;
    position: PositionInfo;
};
export declare type UnmatchingParensError = {
    type: 'UnmatchingParens';
    name: string;
    position: PositionInfo;
};
export declare class Lexer {
    private source;
    private pos;
    private line;
    private col;
    private advance;
    private currentChar;
    private nextChar;
    tokenize(src: string): Result<Token[], LexerError>;
    private test;
    private skipWhiteSpaces;
    private position;
    private tokenizeVar;
    private tokenizeSymb;
    private tokenizeString;
    private isLowerCase;
    private isUpperCase;
    private isAlphaNum;
    private isAlpha;
    private isAllowedChar;
}
