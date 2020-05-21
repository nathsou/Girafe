import { Maybe } from "../Compiler/Utils";
import { Result } from "../Types";
import { LexerError } from "./Lexer/Lexer";
import { PositionInfo, Token } from "./Lexer/Token";
import { Rule, Term } from "./Types";
export declare type ParserError = ExpectedLeftParen | ExpectedRightParen | ExpectedArrow | UnexpectedToken;
export declare type ExpectedLeftParen = {
    type: 'ExpectedLeftParen';
    position: PositionInfo;
};
export declare type ExpectedRightParen = {
    type: 'ExpectedLeftParen';
    position: PositionInfo;
};
export declare type ExpectedArrow = {
    type: 'ExpectedArrow';
    position: PositionInfo;
};
export declare type UnexpectedToken = {
    type: 'UnexpectedToken';
    token: Token;
    position: PositionInfo;
};
export declare class TRSParser {
    private pos;
    private tokens;
    private lexer;
    private static instance;
    private constructor();
    static getInstance(): TRSParser;
    tokenize(src: string): Maybe<LexerError>;
    parse(src: string): Result<Rule[], ParserError | LexerError>;
    parseTokens(tokens: Token[]): Result<Rule[], ParserError>;
    private currentToken;
    private nextToken;
    private advance;
    parseRule(): Result<Rule, ParserError>;
    parseTerm(): Result<Term, ParserError>;
    private parseVar;
    private parseFun;
}
