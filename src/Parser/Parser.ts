import { isVar, mapify, Maybe, isSomething, isFun } from "../Compiler/Utils";
import { unwrap, isError, Ok, Result, Error } from "../Types";
import { parse as jisonParser } from "./grammar.js";
import { PrepocessorPass, preprocess } from "./Preprocessor/Preprocessor";
import { Rule, Term, TRS } from "./Types";
import { Source } from "./Source";

export type ParserError = {
    message: string,
    originalLine: number
};

export function isParserError(obj: any): obj is ParserError {
    return typeof obj === 'object'
        && obj.hasOwnProperty('message') &&
        obj.hasOwnProperty('originalLine');
}

export function renameVars<T extends Term>(t: Term): T {
    if (isVar(t)) return `$${t}` as T;

    return {
        name: t.name,
        args: t.args.map(s => renameVars(s))
    } as T;
}

export const parseRule = (rule: string): Maybe<Rule> => {
    if (!rule.includes('->')) return;

    const [lhs, rhs] = rule.split('->');
    const l = parseTerm(lhs);
    const r = parseTerm(rhs);

    if (isSomething(l) && isFun(l) && isSomething(r)) {
        return [l, r];
    }
};

export const parseRules = (src: string): TRS => {
    const rules: Rule[] = jisonParser(src);
    return mapify(rules.map(([lhs, rhs]) =>
        [lhs, rhs]
        // [renameVars(lhs), renameVars(rhs)]
    ));
};

export const parseTerm = (term: string): Maybe<Term> => {
    try {
        return jisonParser(term);
    } catch (e) {
        console.error(e);
    }
};

export async function parse<Info = {}>(
    source: string,
    ...preprocessors: PrepocessorPass[]
): Promise<Result<{ trs: TRS, info: Info }, ParserError[]>> {
    const info: Partial<Info> = {};
    const src = new Source(source);
    const preprocessedSource = await preprocess(src, preprocessors, info);
    if (isError(preprocessedSource)) {
        return preprocessedSource;
    }

    try {
        const trs = parseRules(unwrap(preprocessedSource));
        return Ok({ trs, info: info as Info });
    } catch (e) {
        return Error([{
            message: (e.message as string).replace(/(Parse error on line [0-9]+:\n)/, ''),
            originalLine: src.originalLineNumber(e.hash.line)
        }]);
    }

}