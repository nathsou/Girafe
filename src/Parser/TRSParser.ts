import { lazyAnnotationSymb } from "../Compiler/Passes/Lazify";
import { fun, Maybe } from "../Compiler/Utils";
import { Err, isError, Ok, Result, unwrap } from "../Types";
import { Lexer, LexerError } from "./Lexer/Lexer";
import { PositionInfo, Token } from "./Lexer/Token";
import { Fun, Rule, Term } from "./Types";

export type ParserError =
    | ExpectedLeftParen
    | ExpectedRightParen
    | ExpectedArrow
    | UnexpectedToken;

export type ExpectedLeftParen = {
    type: 'ExpectedLeftParen',
    position: PositionInfo
};

export type ExpectedRightParen = {
    type: 'ExpectedLeftParen',
    position: PositionInfo
};

export type ExpectedArrow = {
    type: 'ExpectedArrow',
    position: PositionInfo
};

export type UnexpectedToken = {
    type: 'UnexpectedToken',
    token: Token,
    position: PositionInfo
};

export class TRSParser {
    private pos = 0;
    private tokens: Token[];
    private lexer = new Lexer();
    private static instance = new TRSParser();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() { }

    public static getInstance(): TRSParser {
        return this.instance;
    }

    public tokenize(src: string): Maybe<LexerError> {
        this.pos = 0;
        const tokens = this.lexer.tokenize(src);
        if (isError(tokens)) return unwrap(tokens);
        this.tokens = unwrap(tokens);
    }

    public parse(src: string): Result<Rule[], ParserError | LexerError> {
        const err = this.tokenize(src);
        if (err) return Err(err);

        return this.parseTokens(this.tokens);
    }

    public parseTokens(tokens: Token[]): Result<Rule[], ParserError> {
        this.tokens = tokens;
        const rules: Rule[] = [];

        while (this.pos < this.tokens.length) {
            const res = this.parseRule();
            if (isError(res)) return res;
            rules.push(unwrap(res));
        }

        return Ok(rules);
    }

    private currentToken(): Token {
        return this.tokens[this.pos];
    }

    private nextToken(): Token {
        return this.tokens[this.pos + 1];
    }

    private advance(count = 1): void {
        this.pos += count;
    }

    public parseRule(): Result<Rule, ParserError> {
        if (this.currentToken().type === 'Symb') {
            const lhs = this.parseFun();
            if (isError(lhs)) return lhs;
            if (this.currentToken().type === '->') {
                this.advance();
                const rhs = this.parseTerm();
                if (isError(rhs)) return rhs;
                const rule: Rule = [unwrap(lhs), unwrap(rhs)];
                return Ok(rule);
            } else {
                return Err({
                    type: 'ExpectedArrow' as const,
                    position: this.currentToken().position
                });
            }
        } else {
            return Err({
                type: 'UnexpectedToken' as const,
                token: this.currentToken(),
                position: this.currentToken().position
            });
        }
    }

    public parseTerm(): Result<Term, ParserError> {
        const term = this.parseVar();
        if (isError(term)) return term;

        // Wrap inside a Lazy constructor
        // when the term is annotated as lazy
        if (this.currentToken()?.type === '?') {
            this.advance();
            return Ok(fun(lazyAnnotationSymb, unwrap(term)));
        }

        return term;
    }

    private parseVar(): Result<Term, ParserError> {
        const tok = this.currentToken();
        if (tok.type === 'Var') {
            this.advance();
            return Ok(tok.name);
        }

        return this.parseFun();
    }

    private parseFun(): Result<Fun, ParserError> {
        const tok = this.currentToken();
        if (tok.type === 'Symb') {
            const name = tok.name;
            const args = [];
            if (this.nextToken()?.type === '(') {
                this.advance(2);
                while (this.currentToken()?.type !== ')') {
                    if (this.currentToken().type === ',') {
                        // skip the comma
                        this.advance();
                    }

                    const arg = this.parseTerm();
                    if (isError(arg)) return arg;
                    args.push(unwrap(arg));
                    if (![',', ')', '->'].includes(this.currentToken().type)) {
                        return Err({
                            type: 'UnexpectedToken' as const,
                            token: this.currentToken(),
                            position: this.currentToken().position
                        });
                    }
                }

                this.advance();
                return Ok({ name, args });
            } else {
                this.advance();
                return Ok({ name, args: [] });
            }
        }

        return Err({
            type: 'UnexpectedToken' as const,
            token: this.currentToken(),
            position: this.currentToken().position
        });
    }
}