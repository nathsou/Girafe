import { JSExternals, Fun, Term } from "../Parser/Types";
import { StepNormalizer, traceNormalize } from "../Normalizer/Normalizer";
import { showTerm } from "../Compiler/Utils";
import { Inst } from "../Compiler/Passes/Lazify";

export type MetaExternals = 'trace';

const trace = (log: (str: string) => void) => (query: Fun, normalizer: StepNormalizer, externals: JSExternals): Term => {
    return traceNormalize(
        Inst(query.args[0]),
        normalizer,
        externals,
        (t: Term) => {
            log(showTerm(t));
        }
    );
};

export const metaExternals = (log: (str: string) => void): JSExternals<MetaExternals> => {
    return {
        trace: trace(log)
    };
};