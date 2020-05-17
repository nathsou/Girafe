import { isSomething, Maybe } from "../../Compiler/Utils";
import { Source } from "../Source";
import { Either, Error, Ok } from "../../Types";
import { ParserError } from "../Parser";

export type PreprocessorResult = Maybe<ParserError[]>;
export type PrepocessorPass<Info = {}> = (
    source: Source,
    passes: PrepocessorPass<Info>[],
    info: Partial<Info>
) => Promise<PreprocessorResult>;

export async function preprocess<Info extends {} = {}>(
    source: string | Source,
    passes: PrepocessorPass<Info>[],
    info: Partial<Info> = {}
): Promise<Either<string, ParserError[]>> {
    const src = source instanceof Source ? source : new Source(source);
    const passedPasses: PrepocessorPass<Info>[] = [];

    for (const pass of passes) {
        passedPasses.push(pass);
        const errors = await pass(src, passedPasses, info);
        if (isSomething(errors)) return Error(errors);
    }

    return Ok(src.asString());
}