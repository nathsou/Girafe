import { isSomething, Maybe } from "../../Compiler/Utils";
import { Source } from "../Source";
import { Either, Err, Ok } from "../../Types";
import { ParserError } from "../TRSParser";
import { LexerError } from "../Lexer/Lexer";

export type PreprocessorResult = Maybe<Array<LexerError | ParserError>>;
export type PrepocessorPass<Info = Record<string, unknown>> = (
    source: Source,
    passes: PrepocessorPass<Info>[],
    info: Partial<Info>
) => Promise<PreprocessorResult>;

export async function preprocess<Info extends Record<string, unknown> = Record<string, unknown>>(
    source: string | Source,
    passes: PrepocessorPass<Info>[],
    info: Partial<Info> = {}
): Promise<Either<string, Array<ParserError | LexerError>>> {
    const src = source instanceof Source ? source : new Source(source);
    const passedPasses: PrepocessorPass<Info>[] = [];

    for (const pass of passes) {
        passedPasses.push(pass);
        const errors = await pass(src, passedPasses, info);
        if (isSomething(errors)) return Err(errors);
    }

    return Ok(src.asString());
}