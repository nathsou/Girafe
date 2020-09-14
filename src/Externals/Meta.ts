import { False, True } from "../Compiler/Passes/Imports";
import { Inst } from "../Compiler/Passes/Lazify";
import { showTerm, termsEq } from "../Compiler/Utils";
import { StepNormalizer, traceNormalize } from "../Normalizer/Normalizer";
import { Fun, Term } from "../Parser/Types";
import { nullaryVarName } from "../Translator/JSTranslator";
import { Externals, ExternalsFactory, NativeExternals, Targets } from "./Externals";

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
    return termsEq(s, t) ? True : False;
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
            if (isFun(a) && isFun(b) && a.name === b.name && a.args.length === b.args.length) {
              for (let i = 0; i < a.args.length; i++) {
                  if (${name}(a.args[i], b.args[i]).name === "False") {
                      return ${nullaryVarName('False')};
                  }
              }
              return ${nullaryVarName('True')};
            }
          
            return a === b ? ${nullaryVarName('True')} : ${nullaryVarName('False')};
        }`,
};

const haskellMetaExternals: Externals<'haskell', MetaExternals> = {
    trace: (name: string) => `${name} = error "${traceNotAvailableMsg}"`,
    equ: (name: string) => `${name} a b = if a == b then (Fun "True" []) else (Fun "False" [])`
};

const ocamlMetaExternals: Externals<'ocaml', MetaExternals> = {
    trace: (name: string) => `let ${name} () = failwith "${traceNotAvailableMsg}";;`,
    equ: (name: string) => `let ${name} (a, b) = if a = b then Fun ("True", []) else Fun ("False", []);;`
};

const log = (msg: string) => { console.log(msg); };

export const metaExternals = (nativeLog = log): ExternalsFactory<MetaExternals, Targets> => target => {
    return {
        'native': nativeMetaExternals(nativeLog),
        'js': jsMetaExternals,
        'ocaml': ocamlMetaExternals,
        'haskell': haskellMetaExternals
    }[target];
};