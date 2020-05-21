"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const Types_1 = require("../../Types");
const SpecialChars_1 = require("./SpecialChars");
const Types_2 = require("../Types");
const specialCharsSet = new Set(SpecialChars_1.specialCharacters);
const whitespaces = new Set([' ', '\n', '\r', '\t']);
class Lexer {
    advance(count = 1) {
        for (let i = 0; i < count; i++) {
            const nextChar = this.source[this.pos++];
            this.col++;
            if (nextChar === '\n') {
                this.line++;
                this.col = 1;
            }
        }
    }
    currentChar() {
        return this.source[this.pos];
    }
    nextChar() {
        return this.source[this.pos + 1];
    }
    tokenize(src) {
        this.pos = 0;
        this.source = src;
        this.line = 1;
        this.col = 1;
        const tokens = [];
        const tokenizeLeftParen = this.tokenizeString('(');
        const tokenizeRightParen = this.tokenizeString(')');
        const tokenizeComma = this.tokenizeString(',');
        const tokenizeLazy = this.tokenizeString('?');
        const tokenizeArrow = this.tokenizeString('->');
        while (this.pos < src.length) {
            this.skipWhiteSpaces();
            if (this.test(tokenizeArrow, tokens))
                continue;
            if (this.test(this.tokenizeVar, tokens))
                continue;
            if (this.test(this.tokenizeSymb, tokens))
                continue;
            if (this.test(tokenizeLeftParen, tokens))
                continue;
            if (this.test(tokenizeRightParen, tokens))
                continue;
            if (this.test(tokenizeComma, tokens))
                continue;
            if (this.test(tokenizeLazy, tokens))
                continue;
            return Types_1.Err({
                type: 'InvalidChar',
                char: this.currentChar(),
                position: this.position()
            });
        }
        return Types_1.Ok(tokens);
    }
    test(fn, tokens) {
        const token = fn.call(this);
        if (token) {
            tokens.push(token);
            return true;
        }
        return false;
    }
    skipWhiteSpaces() {
        while (whitespaces.has(this.currentChar())) {
            this.advance();
        }
    }
    position() {
        return {
            line: this.line,
            col: this.col
        };
    }
    tokenizeVar() {
        if (this.isAlpha(this.currentChar()) &&
            this.isLowerCase(this.currentChar())) {
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
    tokenizeSymb() {
        if (this.isAllowedChar(this.currentChar()) &&
            this.isUpperCase(this.currentChar())) {
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
    tokenizeString(str) {
        const pos = this.position();
        return () => {
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
                    Types_2.unreachable();
            }
        };
    }
    isLowerCase(str) {
        if (str === undefined)
            return false;
        return str.split('').every(c => c.toLowerCase() === c);
    }
    isUpperCase(str) {
        if (str === undefined)
            return false;
        return str.split('').every(c => c.toUpperCase() === c);
    }
    isAlphaNum(c) {
        if (c === undefined)
            return false;
        return /[a-zA-Z0-9]/.test(c);
    }
    isAlpha(c) {
        if (c === undefined)
            return false;
        return /[a-zA-Z]/.test(c);
    }
    isAllowedChar(c) {
        if (c === undefined)
            return false;
        return specialCharsSet.has(c) || this.isAlphaNum(c);
    }
}
exports.Lexer = Lexer;
