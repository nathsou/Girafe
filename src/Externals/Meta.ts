import { Fun, Term } from "../Parser/Types";
import { StepNormalizer, traceNormalize } from "../Normalizer/Normalizer";
import { showTerm, termsEq } from "../Compiler/Utils";
import { Inst } from "../Compiler/Passes/Lazify";
import { True, False } from "../Compiler/Passes/Imports";
import { NativeExternals, ExternalsFactory, Externals } from "./Externals";

export type MetaExternals = 'trace' | 'equ';

const trace = (log: (str: string) => void) => (query: Fun, normalizer: StepNormalizer, externals: NativeExternals): Term => {
    return traceNormalize(
        Inst(query.args[0]),
        normalizer,
        externals,
        (t: Term) => {
            log(showTerm(t));
        }
    );
};

const equ = (s: Term, t: Term): Fun => {
    return termsEq(s, t) ? True() : False();
};

const nativeMetaExternals = (log: (str: string) => void): NativeExternals<MetaExternals> => {
    return {
        trace: trace(log),
        equ: t => { const [a, b] = t.args; return equ(a, b); },
    };
};

const traceNotAvailableMsg = '@trace is not available with this normalizer';

const jsMetaExternals: Externals<'js', MetaExternals> = {
    trace: (name: string) => `function ${name}() { throw new Error("${traceNotAvailableMsg}"); }`,
    equ: (name: string) => `
        function ${name}(a, b) {
            if (isVar(a) && isVar(b)) return { name: a === b ? "True" : "False", args: [] };
            if (isFun(a) && isFun(b) && a.name === b.name && a.args.length === b.args.length) {
              for (let i = 0; i < a.args.length; i++) {
                  if (!${name}(a.args[i], b.args[i])) return { name: "False", args: [] };
              }
              return { name: "True", args: [] };
            }
          
            return { name: "False", args: [] };
        }`,
};

const haskellMetaExternals: Externals<'haskell', MetaExternals> = {
    trace: (name: string) => `${name} = error "${traceNotAvailableMsg}"`,
    equ: (name: string) => `${name} a b = a == b`
};

const ocamlMetaExternals: Externals<'ocaml', MetaExternals> = {
    trace: (name: string) => `let ${name} = failwith "${traceNotAvailableMsg};;"`,
    equ: (name: string) => `let ${name} a b = a = b;;`
};

export const metaExternals = (nativeLog: (str: string) => void): ExternalsFactory<MetaExternals> => target => {
    return {
        'native': nativeMetaExternals(nativeLog),
        'js': jsMetaExternals,
        'ocaml': ocamlMetaExternals,
        'haskell': haskellMetaExternals
    }[target];
};