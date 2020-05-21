import { isVar, mapify, Maybe } from "../Compiler/Utils";
import { isError, mapEither, Ok, Result, unwrap, Err } from "../Types";
import { LexerError } from "./Lexer/Lexer";
import { PrepocessorPass, preprocess } from "./Preprocessor/Preprocessor";
import { Source } from "./Source";
import { ParserError, TRSParser } from "./TRSParser";
import { Rule, Term, TRS } from "./Types";

export function renameVars<T extends Term>(t: Term): T {
    if (isVar(t)) return `$${t}` as T;

    return {
        name: t.name,
        args: t.args.map(s => renameVars(s))
    } as T;
}

export const parseRule = (str: string): Maybe<Rule> => {
    const err = TRSParser.getInstance().tokenize(str);
    if (err) return;
    const rule = TRSParser.getInstance().parseRule();
    if (isError(rule)) return;
    return unwrap(rule);
};

export const parseRules = (src: string): Maybe<TRS> => {
    const rules = TRSParser.getInstance().parse(src);
    const trs = mapEither(rules, mapify);
    if (isError(trs)) return;
    return unwrap(trs);
};

export const parseTerm = (str: string): Maybe<Term> => {
    const err = TRSParser.getInstance().tokenize(str);
    if (err) return;
    const term = TRSParser.getInstance().parseTerm();
    if (isError(term)) return;
    return unwrap(term);
};

export async function parse<Info = {}>(
    source: string,
    ...preprocessors: PrepocessorPass[]
): Promise<Result<{ trs: TRS, info: Info }, Array<ParserError | LexerError>>> {
    const info: Partial<Info> = {};
    const src = new Source(source);
    const preprocessedSource = await preprocess(src, preprocessors, info);
    if (isError(preprocessedSource)) {
        return preprocessedSource;
    }

    const rules = TRSParser.getInstance().parse(unwrap(preprocessedSource));
    if (isError(rules)) return Err([unwrap(rules)].map(err => {
        return {
            ...err,
            position: {
                line: src.originalLineNumber(err.position.line),
                col: err.position.col
            }
        };
    }));
    if (rules) {
        return Ok({ trs: mapify(unwrap(rules)), info: info as Info });
    }
}