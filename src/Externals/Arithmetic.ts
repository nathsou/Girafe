import { False, True } from "../Compiler/Passes/Imports";
import { isFun } from "../Compiler/Utils";
import { Fun } from "../Parser/Types";
import { nullaryVarName } from "../Translator/Translator";
import { Externals, ExternalsFactory, NativeExternals, Targets } from "./Externals";

export const symb = (f: string): Fun => ({ name: f, args: [] });

const arithbinop = (t: Fun, op: (a: bigint, b: bigint) => bigint): Fun => {
    const [a, b] = t.args;
    if (isFun(a) && isFun(b)) {
        try {
            const an = BigInt(a.name);
            const bn = BigInt(b.name);

            const res = op(an, bn);
            return symb(`${res}`);
        } catch (e) {
            return t;
        }
    }

    return t;
};

const boolbinop = (t: Fun, op: (a: bigint, b: bigint) => boolean): Fun => {
    const [a, b] = t.args;
    if (isFun(a) && isFun(b)) {
        const an = BigInt(a.name);
        const bn = BigInt(b.name);
        const res = op(an, bn);

        return res ? True : False;
    }

    return t;
};

export type ArithmeticExternals = 'add' | 'sub' | 'mult' | 'div' |
    'mod' | 'gtr' | 'geq' | 'lss' | 'leq';

const nativeArithmeticExternals: NativeExternals<ArithmeticExternals> = {
    'add': t => arithbinop(t, (a, b) => a + b),
    'sub': t => arithbinop(t, (a, b) => a - b),
    'mult': t => arithbinop(t, (a, b) => a * b),
    'div': t => arithbinop(t, (a, b) => a / b),
    'mod': t => arithbinop(t, (a, b) => a % b),
    'gtr': t => boolbinop(t, (a, b) => a > b),
    'geq': t => boolbinop(t, (a, b) => a >= b),
    'lss': t => boolbinop(t, (a, b) => a < b),
    'leq': t => boolbinop(t, (a, b) => a <= b)
};

const jsarithbinop = (op: string) => {
    return (name: string) => (
        `function ${name}(a, b) {
            if (isNat(a) && isNat(b)) {
                return ${op === '/' ? 'typeof a === "number" ? Math.floor(a / b) : a / b' : `a ${op} b`};
            }
        
            return { name: "${name}", args: [a, b] };
        }`
    );
};

const jsboolbinop = (op: string) => {
    return (name: string) => (
        `function ${name}(a, b) {
            if (isNat(a) && isNat(b)) {
                return (a ${op} b) ? ${nullaryVarName('True')} : ${nullaryVarName('False')};
            }
        
            return { name: "${name}", args: [a, b] };
        }`
    );
};

const jsArithmeticExternals: Externals<'js', ArithmeticExternals> = {
    'add': jsarithbinop('+'),
    'sub': jsarithbinop('-'),
    'mult': jsarithbinop('*'),
    'div': jsarithbinop('/'),
    'mod': jsarithbinop('%'),
    'gtr': jsboolbinop('>'),
    'geq': jsboolbinop('>='),
    'lss': jsboolbinop('<'),
    'leq': jsboolbinop('<=')
};

const haskellIntBinop = (op: string) =>
    (name: string) => `${name} (Nat a) (Nat b) = Nat (a ${op} b)`;

const haskellBoolBinop = (op: string) =>
    (name: string) => `${name} (Nat a) (Nat b) =
        if a ${op} b then ${nullaryVarName('True')} else ${nullaryVarName('False')}`;

const haskellArithmeticExternals: Externals<'haskell', ArithmeticExternals> = {
    'add': haskellIntBinop('+'),
    'sub': haskellIntBinop('-'),
    'mult': haskellIntBinop('*'),
    'div': haskellIntBinop('`div`'),
    'mod': haskellIntBinop('`mod`'),
    'gtr': haskellBoolBinop('>'),
    'geq': haskellBoolBinop('>='),
    'lss': haskellBoolBinop('<'),
    'leq': haskellBoolBinop('<=')
};

const ocamlIntBinop = (op: string) =>
    (name: string) => `let ${name} (a, b) = match (a, b) with
        | (Nat a, Nat b) -> Nat (a ${op} b)
        | _ -> Fun ("${name}", [a; b]);;
    `;

const ocamlBoolOf = (expr: string) =>
    `(if ${expr} then ${nullaryVarName('True')} else ${nullaryVarName('False')})`;

const ocamlBoolBinop = (op: string) =>
    (name: string) => `let ${name} (a, b) = match (a, b) with
        | (Nat a, Nat b) -> ${ocamlBoolOf(`a ${op} b`)}
        | _ -> Fun ("${name}", [a; b]);;
    `;

const ocamlArithmeticExternals: Externals<'ocaml', ArithmeticExternals> = {
    "sub": ocamlIntBinop('-'),
    "add": ocamlIntBinop('+'),
    "mult": ocamlIntBinop('*'),
    "mod": ocamlIntBinop('mod'),
    "div": ocamlIntBinop('/'),
    "lss": ocamlBoolBinop('<'),
    "leq": ocamlBoolBinop('<='),
    "gtr": ocamlBoolBinop('>'),
    "geq": ocamlBoolBinop('>=')
};

export const arithmeticExternals: ExternalsFactory<ArithmeticExternals, Targets> = target => {
    return {
        'native': nativeArithmeticExternals,
        'js': jsArithmeticExternals,
        'ocaml': ocamlArithmeticExternals,
        'haskell': haskellArithmeticExternals
    }[target];
};