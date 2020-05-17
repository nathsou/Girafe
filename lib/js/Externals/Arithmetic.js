"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocamlArithmeticExternals = exports.haskellArithmeticExternals = exports.jsArithmeticExternals = exports.arithmeticExterals = exports.boolbinop = exports.arithbinop = exports.symb = void 0;
const Imports_1 = require("../Compiler/Passes/Imports");
const Utils_1 = require("../Compiler/Utils");
exports.symb = (f) => ({ name: f, args: [] });
exports.arithbinop = (t, op) => {
    const [a, b] = t.args;
    if (Utils_1.isFun(a) && Utils_1.isFun(b)) {
        try {
            const an = BigInt(a.name);
            const bn = BigInt(b.name);
            const res = op(an, bn);
            return exports.symb(`${res}`);
        }
        catch (e) {
            return t;
        }
    }
    return t;
};
exports.boolbinop = (t, op) => {
    const [a, b] = t.args;
    if (Utils_1.isFun(a) && Utils_1.isFun(b)) {
        const an = BigInt(a.name);
        const bn = BigInt(b.name);
        const res = op(an, bn);
        return res ? Imports_1.True() : Imports_1.False();
    }
    return t;
};
exports.arithmeticExterals = {
    'add': t => exports.arithbinop(t, (a, b) => a + b),
    'sub': t => exports.arithbinop(t, (a, b) => a - b),
    'mult': t => exports.arithbinop(t, (a, b) => a * b),
    'div': t => exports.arithbinop(t, (a, b) => a / b),
    'mod': t => exports.arithbinop(t, (a, b) => a % b),
    'pow': t => exports.arithbinop(t, (a, b) => a ** b),
    'equ': t => exports.boolbinop(t, (a, b) => a === b),
    'gtr': t => exports.boolbinop(t, (a, b) => a > b),
    'geq': t => exports.boolbinop(t, (a, b) => a >= b),
    'lss': t => exports.boolbinop(t, (a, b) => a < b),
    'leq': t => exports.boolbinop(t, (a, b) => a <= b)
};
const jsarithbinop = (op) => {
    return (name) => (`function ${name}(a, b) {
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
        }`);
};
const jsboolbinop = (op) => {
    return (name) => (`function ${name}(a, b) {
            if (isFun(a) && isFun(b)) {
                const an = BigInt(a.name);
                const bn = BigInt(b.name);
                const res = an ${op} bn;
        
                return { name: res ? 'True' : 'False', args: [] };
            }
        
            return { name: name, args: [a, b] };
        }`);
};
exports.jsArithmeticExternals = {
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
exports.haskellArithmeticExternals = {
    "sub": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) - (read b :: Int))) []`,
    "add": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) + (read b :: Int))) []`,
    "mult": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) * (read b :: Int))) []`,
    "mod": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) \`mod\` (read b :: Int))) []`,
    "div": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) \`div\` (read b :: Int))) []`,
    "pow": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) \`pow\` (read b :: Int))) []`,
    "equ": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) == (read b :: Int))) []`,
    "lss": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) < (read b :: Int))) []`,
    "leq": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) <= (read b :: Int))) []`,
    "gtr": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) > (read b :: Int))) []`,
    "geq": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) >= (read b :: Int))) []`,
};
const ocamlIntBinop = (op, reversed = false) => {
    return (name) => 'let ' + name + ' a b = match (a, b) with\n' +
        '   | ((Fun (a, [])), (Fun (b, []))) ->\n' +
        (reversed ?
            '       Fun ((string_of_int ((' + op + ' (int_of_string a)) (int_of_string b))), [])' :
            '       Fun ((string_of_int ((int_of_string a) ' + op + ' (int_of_string b))), [])') + '\n' +
        '   | _ -> Fun ("@' + name + '", []);;';
};
const ocamlBoolOf = (expr) => `(if ${expr} then "True" else "False")`;
const ocamlBoolBinop = (op) => {
    return (name) => 'let ' + name + ' a b = match (a, b) with\n' +
        '   | ((Fun (a, [])), (Fun (b, []))) ->\n' +
        '       Fun (' + ocamlBoolOf('((int_of_string a) ' + op + ' (int_of_string b))') + ', [])\n' +
        '   | _ -> Fun ("@' + name + '", []);;';
};
exports.ocamlArithmeticExternals = {
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
