import { False, True } from "../Compiler/Passes/Imports";
import { Inst } from "../Compiler/Passes/Lazify";
import { showTerm, termsEq } from "../Compiler/Utils";
import { StepNormalizer, traceNormalize } from "../Normalizer/Normalizer";
import { Fun, Term } from "../Parser/Types";
import { format } from "../Parser/Utils";
import { nullaryVarName } from "../Translator/Translator";
import { Externals, ExternalsFactory, NativeExternals, Targets } from "./Externals";

export type MetaExternals = 'trace' | 'equ' | 'show';

const trace = (log: (str: string) => void) =>
    (query: Fun, normalizer: StepNormalizer, externals: NativeExternals): Term => {
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
        show: t => showTerm(t)
    };
};

const traceNotAvailableMsg = '@trace is not available with this normalizer';

const jsMetaExternals: Externals<'js', MetaExternals> = {
    trace: name => `grf["${name}"] = () => { throw new Error("${traceNotAvailableMsg}"); };`,
    equ: name => `
        grf["${name}"] = (a, b) => {
            if (isFun(a) && isFun(b) && a.name === b.name && a.args.length === b.args.length) {
              for (let i = 0; i < a.args.length; i++) {
                  if (grf["${name}"](a.args[i], b.args[i]).name === "False") {
                      return ${nullaryVarName('False')};
                  }
              }
              return ${nullaryVarName('True')};
            }
          
            return a === b ? ${nullaryVarName('True')} : ${nullaryVarName('False')};
        };`,
    show: name => `
        grf["${name}"] = term => {
            if (isVar(term)) return term;
            if (isNat(term)) return term.toString();
            if (term.args.length === 0) return term.name;
            
            const terms = [term];
            const stack = [];
            const symbols = [];
            
            // flatten the terms onto a stack
            while (terms.length > 0) {
                const t = terms.pop();
            
                if (isVar(t) || isNat(t)) {
                    stack.push(t.toString());
                } else if (t.args.length === 0) {
                    stack.push(t.name);
                } else {
                    for (let i = t.args.length - 1; i >= 0; i--) {
                        terms.push(t.args[i]);
                    }
                
                    terms.push(t.name);
                    symbols.push([t.name, t.args.length]);
                }
            }
            
            const argsStack = [];
            
            // assemble constructors back when all arguments have been stringified
            for (let i = stack.length - 1; i >= 0; i--) {
                const t = stack[i];
                if (symbols.length === 0) break;
                const [f, ar] = symbols[symbols.length - 1];
            
                if (t === f) {
                    const args = [];
                    for (let k = 0; k < ar; k++) {
                        args.push(argsStack.pop());
                    }
            
                    argsStack.push(f + '(' + args.join(', ') + ')');
                    symbols.pop();
                } else {
                    argsStack.push(t);
                }
            }
            
            return argsStack[0];
        };`
};

const haskellMetaExternals: Externals<'haskell', MetaExternals> = {
    trace: name => `${name} = error "${traceNotAvailableMsg}"`,
    equ: name => `${name} a b = if a == b then ${nullaryVarName('True')} else ${nullaryVarName('False')}`,
    show: name => format(
        `${name} (Var x) = x`,
        `${name} (Fun f []) = f`,
        `${name} (Fun f ts) = f ++ "(" ++ (intercalate ", " (map ${name} ts)) ++ ")"`,
        `${name} (Nat n) = show n`
    )
};

const ocamlMetaExternals: Externals<'ocaml', MetaExternals> = {
    trace: name => `let ${name} () = failwith "${traceNotAvailableMsg}";;`,
    equ: name => `let ${name} (a, b) = if a = b then ${nullaryVarName('True')} else ${nullaryVarName('False')};;`,
    show: name => `let rec ${name} t = match t with
        | Var x -> x
        | Fun (f, []) -> f
        | Fun (f, ts) -> f ^ "(" ^ (String.concat ", " (List.map ${name} ts)) ^ ")"
        | Nat n -> string_of_int n;;
`
};

const log = (msg: string) => { console.log(msg); };

export const metaExternals = (nativeLog = log): ExternalsFactory<MetaExternals, Targets> => (target: Targets) => {
    return {
        'native': nativeMetaExternals(nativeLog),
        'js': jsMetaExternals,
        'ocaml': ocamlMetaExternals,
        'haskell': haskellMetaExternals
    }[target];
};