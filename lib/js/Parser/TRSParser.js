"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRSParser = void 0;
const Utils_1 = require("../Compiler/Utils");
const Types_1 = require("../Types");
const Lexer_1 = require("./Lexer/Lexer");
const Lazify_1 = require("../Compiler/Passes/Lazify");
class TRSParser {
    constructor() {
        this.pos = 0;
        this.lexer = new Lexer_1.Lexer();
    }
    ;
    static getInstance() {
        if (this.instance === undefined) {
            this.instance = new TRSParser();
        }
        return this.instance;
    }
    tokenize(src) {
        this.pos = 0;
        const tokens = this.lexer.tokenize(src);
        if (Types_1.isError(tokens))
            return Types_1.unwrap(tokens);
        this.tokens = Types_1.unwrap(tokens);
    }
    parse(src) {
        const err = this.tokenize(src);
        if (err)
            return Types_1.Err(err);
        return this.parseTokens(this.tokens);
    }
    parseTokens(tokens) {
        this.tokens = tokens;
        const rules = [];
        while (this.pos < this.tokens.length) {
            const res = this.parseRule();
            if (Types_1.isError(res))
                return res;
            rules.push(Types_1.unwrap(res));
        }
        return Types_1.Ok(rules);
    }
    currentToken() {
        return this.tokens[this.pos];
    }
    nextToken() {
        return this.tokens[this.pos + 1];
    }
    advance(count = 1) {
        this.pos += count;
    }
    parseRule() {
        if (this.currentToken().type === 'Symb') {
            const lhs = this.parseFun();
            if (Types_1.isError(lhs))
                return lhs;
            if (this.currentToken().type === '->') {
                this.advance();
                const rhs = this.parseTerm();
                if (Types_1.isError(rhs))
                    return rhs;
                const rule = [Types_1.unwrap(lhs), Types_1.unwrap(rhs)];
                return Types_1.Ok(rule);
            }
            else {
                return Types_1.Err({
                    type: 'ExpectedArrow',
                    position: this.currentToken().position
                });
            }
        }
        else {
            return Types_1.Err({
                type: 'UnexpectedToken',
                token: this.currentToken(),
                position: this.currentToken().position
            });
        }
    }
    parseTerm() {
        var _a;
        const term = this.parseVar();
        if (Types_1.isError(term))
            return term;
        // Wrap inside a Lazy constructor
        // when the term is annotated as lazy
        if (((_a = this.currentToken()) === null || _a === void 0 ? void 0 : _a.type) === '?') {
            this.advance();
            return Types_1.Ok(Utils_1.fun(Lazify_1.lazyAnnotationSymb, Types_1.unwrap(term)));
        }
        return term;
    }
    parseVar() {
        const tok = this.currentToken();
        if (tok.type === 'Var') {
            this.advance();
            return Types_1.Ok(tok.name);
        }
        return this.parseFun();
    }
    parseFun() {
        var _a, _b;
        const tok = this.currentToken();
        if (tok.type === 'Symb') {
            const name = tok.name;
            const args = [];
            if (((_a = this.nextToken()) === null || _a === void 0 ? void 0 : _a.type) === '(') {
                this.advance(2);
                while (this.currentToken() !== undefined &&
                    ((_b = this.currentToken()) === null || _b === void 0 ? void 0 : _b.type) !== ')') {
                    if (this.currentToken().type === ',') {
                        // skip the comma
                        this.advance();
                    }
                    const arg = this.parseTerm();
                    if (Types_1.isError(arg))
                        return arg;
                    args.push(Types_1.unwrap(arg));
                    if (this.currentToken().type !== ',' &&
                        this.currentToken().type !== ')' &&
                        this.currentToken().type !== '->') {
                        return Types_1.Err({
                            type: 'UnexpectedToken',
                            token: this.currentToken(),
                            position: this.currentToken().position
                        });
                    }
                }
                this.advance();
                return Types_1.Ok({ name, args });
            }
            else {
                this.advance();
                return Types_1.Ok({ name, args: [] });
            }
        }
        return Types_1.Err({
            type: 'UnexpectedToken',
            token: this.currentToken(),
            position: this.currentToken().position
        });
    }
}
exports.TRSParser = TRSParser;
