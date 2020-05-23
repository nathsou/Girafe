import { False, True } from "../Compiler/Passes/Imports";
import { isFun } from "../Compiler/Utils";
import { Externals, Fun, JSExternals } from "../Parser/Types";

export const symb = (f: string): Fun => ({ name: f, args: [] });

export const arithbinop = (t: Fun, op: (a: bigint, b: bigint) => bigint): Fun => {
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

export const boolbinop = (t: Fun, op: (a: bigint, b: bigint) => boolean): Fun => {
    const [a, b] = t.args;
    if (isFun(a) && isFun(b)) {
        const an = BigInt(a.name);
        const bn = BigInt(b.name);

        const res = op(an, bn);

        return res ? True() : False();
    }

    return t;
};

export type ArithmeticExternals = 'add' | 'sub' | 'mult' | 'div' |
    'mod' | 'pow' | 'equ' | 'gtr' | 'geq' | 'lss' | 'leq';

export const arithmeticExternals: JSExternals<ArithmeticExternals> = {
    'add': t => arithbinop(t, (a, b) => a + b),
    'sub': t => arithbinop(t, (a, b) => a - b),
    'mult': t => arithbinop(t, (a, b) => a * b),
    'div': t => arithbinop(t, (a, b) => a / b),
    'mod': t => arithbinop(t, (a, b) => a % b),
    'pow': t => arithbinop(t, (a, b) => a ** b),
    'equ': t => boolbinop(t, (a, b) => a === b),
    'gtr': t => boolbinop(t, (a, b) => a > b),
    'geq': t => boolbinop(t, (a, b) => a >= b),
    'lss': t => boolbinop(t, (a, b) => a < b),
    'leq': t => boolbinop(t, (a, b) => a <= b)
};

const jsarithbinop = (op: string) => {
    return (name: string) => (
        `function ${name}(a, b) {
            if (isFun(a) && isFun(b)) {
                try {
                    const an = BigInt(a.name);
                    const bn = BigInt(b.name);
        
                    const res = (an ${op} bn).toString();
                    return { name: res, args: [] };
                } catch (e) {
                    return { name: name, args: [a, b] };
                }
        
            }
        
            return { name: name, args: [a, b] };
        }`
    );
};

const jsboolbinop = (op: string) => {
    return (name: string) => (
        `function ${name}(a, b) {
            if (isFun(a) && isFun(b)) {
                const an = BigInt(a.name);
                const bn = BigInt(b.name);
                const res = an ${op} bn;
        
                return { name: res ? 'True' : 'False', args: [] };
            }
        
            return { name: name, args: [a, b] };
        }`
    );
};

export const jsArithmeticExternals: Externals<'js', ArithmeticExternals> = {
    'add': jsarithbinop('+'),
    'sub': jsarithbinop('-'),
    'mult': jsarithbinop('*'),
    'div': jsarithbinop('/'),
    'mod': jsarithbinop('%'),
    'pow': jsarithbinop('**'),
    'equ': jsboolbinop('==='),
    'gtr': jsboolbinop('>'),
    'geq': jsboolbinop('>='),
    'lss': jsboolbinop('<'),
    'leq': jsboolbinop('<=')
};

export const haskellArithmeticExternals: Externals<'haskell', ArithmeticExternals> = {
    "sub": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) - (read b :: Int))) []`,
    "add": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) + (read b :: Int))) []`,
    "mult": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) * (read b :: Int))) []`,
    "mod": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) \`mod\` (read b :: Int))) []`,
    "div": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) \`div\` (read b :: Int))) []`,
    "pow": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) ^ (read b :: Int))) []`,
    "equ": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) == (read b :: Int))) []`,
    "lss": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) < (read b :: Int))) []`,
    "leq": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) <= (read b :: Int))) []`,
    "gtr": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) > (read b :: Int))) []`,
    "geq": (name) =>
        `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) >= (read b :: Int))) []`,
};

const ocamlIntBinop = (op: string, reversed = false) => {
    return (name: string) =>
        'let ' + name + ' (a, b) = match (a, b) with\n' +
        '   | ((Fun (a, [])), (Fun (b, []))) ->\n' +
        (reversed ?
            '       Fun ((string_of_int ((' + op + ' (int_of_string a)) (int_of_string b))), [])' :
            '       Fun ((string_of_int ((int_of_string a) ' + op + ' (int_of_string b))), [])'
        ) + '\n' +
        '   | _ -> Fun ("@' + name + '", []);;';
};

const ocamlBoolOf = (expr: string) => `(if ${expr} then "True" else "False")`;

const ocamlBoolBinop = (op: string) => {
    return (name: string) =>
        'let ' + name + ' (a, b) = match (a, b) with\n' +
        '   | ((Fun (a, [])), (Fun (b, []))) ->\n' +
        '       Fun (' + ocamlBoolOf('((int_of_string a) ' + op + ' (int_of_string b))') + ', [])\n' +
        '   | _ -> Fun ("@' + name + '", []);;';
};

export const ocamlArithmeticExternals: Externals<'ocaml', ArithmeticExternals> = {
    "sub": ocamlIntBinop('-'),
    "add": ocamlIntBinop('+'),
    "mult": ocamlIntBinop('*'),
    "mod": ocamlIntBinop('mod'),
    "div": ocamlIntBinop('/'),
    "pow": name => `
let rec pow a = function
    | 0 -> 1
    | 1 -> a
    | n -> 
      let b = pow a (n / 2) in
      b * b * (if n mod 2 = 0 then 1 else a);;
    
      ${ocamlIntBinop('pow', true)(name)}
`.trim().trimEnd(),
    "equ": ocamlBoolBinop('='),
    "lss": ocamlBoolBinop('<'),
    "leq": ocamlBoolBinop('<='),
    "gtr": ocamlBoolBinop('>'),
    "geq": ocamlBoolBinop('>=')
};