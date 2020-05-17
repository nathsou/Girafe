import { Externals, Fun, JSExternals } from "../Parser/Types";
export declare const symb: (f: string) => Fun;
export declare const arithbinop: (t: Fun, op: (a: bigint, b: bigint) => bigint) => Fun;
export declare const boolbinop: (t: Fun, op: (a: bigint, b: bigint) => boolean) => Fun;
export declare type ArithmeticExternals = 'add' | 'sub' | 'mult' | 'div' | 'mod' | 'pow' | 'equ' | 'gtr' | 'geq' | 'lss' | 'leq';
export declare const arithmeticExterals: JSExternals<ArithmeticExternals>;
export declare const jsArithmeticExternals: Externals<'js', ArithmeticExternals>;
export declare const haskellArithmeticExternals: Externals<'haskell', ArithmeticExternals>;
export declare const ocamlArithmeticExternals: Externals<'ocaml', ArithmeticExternals>;
