import { Maybe } from "../../Compiler/Utils";
import { Err, Ok, Result } from "../../Types";
import { specialCharacters } from "./SpecialChars";
import { PositionInfo, SymbToken, Token, VarToken } from "./Token";
import { unreachable } from "../Types";
import { ifSymb } from "../../Compiler/Passes/Imports";
import { appSymb } from "../../Compiler/Passes/Currify";
import { instSymb } from "../../Compiler/Passes/Lazify";

const specialCharsSet = new Set<string>(specialCharacters);
const whitespaces = new Set([' ', '\n', '\r', '\t']);
export const lowerCaseSymbols = [ifSymb, appSymb, instSymb]; // keywords

export type LexerError =
    | InvalidCharError
    | UnmatchingParensError;

export type InvalidCharError = {
    type: 'InvalidChar',
    char: string,
    position: PositionInfo
};

export type UnmatchingParensError = {
    type: 'UnmatchingParens',
    name: string,
    position: PositionInfo,
};

export class Lexer {
    private source: string;
    private pos: number;
    private line: number;
    private col: number;

    private advance(count = 1): void {
        for (let i = 0; i < count; i++) {
            const nextChar = this.source[this.pos++];
            this.col++;
            if (nextChar === '\n') {
                this.line++;
                this.col = 1;
            }
        }
    }

    private currentChar(): string {
        return this.source[this.pos];
    }

    private nextChar(): string {
        return this.source[this.pos + 1];
    }

    public tokenize(src: string): Result<Token[], LexerError> {
        this.pos = 0;
        this.source = src;
        this.line = 1;
        this.col = 1;

        const tokens: Token[] = [];
        const tokenizeLeftParen = this.tokenizeString('(');
        const tokenizeRightParen = this.tokenizeString(')');
        const tokenizeComma = this.tokenizeString(',');
        const tokenizeLazy = this.tokenizeString('?');
        const tokenizeArrow = this.tokenizeString('->');

        while (this.pos < src.length) {
            this.skipWhiteSpaces();
            if (this.test(tokenizeArrow, tokens)) continue;
            if (this.test(this.tokenizeVar, tokens)) continue;
            if (this.test(this.tokenizeSymb, tokens)) continue;
            if (this.test(tokenizeLeftParen, tokens)) continue;
            if (this.test(tokenizeRightParen, tokens)) continue;
            if (this.test(tokenizeComma, tokens)) continue;
            if (this.test(tokenizeLazy, tokens)) continue;

            return Err({
                type: 'InvalidChar' as const,
                char: this.currentChar(),
                position: this.position()
            });
        }

        return Ok(tokens);
    }

    private test(fn: () => Maybe<Token>, tokens: Token[]): boolean {
        const token = fn.call(this);
        if (token) {
            tokens.push(token);
            return true;
        }

        return false;
    }

    private skipWhiteSpaces() {
        while (whitespaces.has(this.currentChar())) {
            this.advance();
        }
    }

    private position(): PositionInfo {
        return {
            line: this.line,
            col: this.col
        };
    }

    private match(str: string): boolean {
        return this.source.substr(this.pos, str.length) === str &&
            !this.isAllowedChar(this.source[this.pos + str.length]);
    }

    private matchLowercaseSymb(): boolean {
        return lowerCaseSymbols.some(s => this.match(s));
    }

    private tokenizeVar(): Maybe<VarToken> {
        if (
            this.isAlpha(this.currentChar()) &&
            this.isLowerCase(this.currentChar()) &&
            !this.matchLowercaseSymb()
        ) {
            const pos = this.position();
            let name = this.currentChar();
            this.advance();
            while (this.isAllowedChar(this.currentChar())) {
                name += this.currentChar();
                this.advance();
            }

            return { type: 'Var', name, position: pos };
        }
    }

    private tokenizeSymb(): Maybe<SymbToken> {
        if (
            this.isAllowedChar(this.currentChar()) &&
            (
                this.isUpperCase(this.currentChar()) ||
                this.matchLowercaseSymb()
            )
        ) {
            const pos = this.position();
            let symb = this.currentChar();
            this.advance();
            while (this.isAllowedChar(this.currentChar())) {
                symb += this.currentChar();
                this.advance();
            }

            return { type: 'Symb', name: symb, position: pos };
        }
    }

    private tokenizeString(str: string): () => Maybe<Token> {
        const pos = this.position();
        return (): Token => {
            switch (str) {
                case '(':
                    if (this.currentChar() === '(') {
                        this.advance();
                        return { type: '(', position: pos };
                    }
                    break;
                case ')':
                    if (this.currentChar() === ')') {
                        this.advance();
                        return { type: ')', position: pos };
                    }
                    break;
                case ',':
                    if (this.currentChar() === ',') {
                        this.advance();
                        return { type: ',', position: pos };
                    }
                    break;
                case '?':
                    if (this.currentChar() === '?') {
                        this.advance();
                        return { type: '?', position: pos };
                    }
                    break;
                case '->':
                    if (this.currentChar() === '-' && this.nextChar() === '>') {
                        this.advance(2);
                        return { type: '->', position: pos };
                    }
                    break;
                default:
                    unreachable();
            }
        }
    }

    private isLowerCase(str: string): boolean {
        if (str === undefined) return false;
        return str.split('').every(c => c.toLowerCase() === c);
    }

    private isUpperCase(str: string): boolean {
        if (str === undefined) return false;
        return str.split('').every(c => c.toUpperCase() === c);
    }

    private isAlphaNum(c: string): boolean {
        if (c === undefined) return false;
        return /[a-zA-Z0-9]/.test(c);
    }

    private isAlpha(c: string): boolean {
        if (c === undefined) return false;
        return /[a-zA-Z]/.test(c);
    }

    private isAllowedChar(c: string): boolean {
        if (c === undefined) return false;
        return this.isAlphaNum(c) || specialCharsSet.has(c);
    }
}