import { Fun, Rule, Symb, Term, TRS } from "../../../Parser/Types";
import { Arities } from "../../../Compiler/Passes/Lazify";
import { Maybe } from "../../../Compiler/Utils";
declare type SuffixSet = Set<string>;
declare type Closure = Set<string>;
export declare const ε = "";
export declare const ω = "\u03C9";
export declare const factorOut: (α: Symb, M: SuffixSet) => SuffixSet;
export declare const prepend: (α: string, M: SuffixSet) => SuffixSet;
export declare const closure: (M: SuffixSet, arities: Map<Symb, number>) => Closure;
export declare const stringify: (t: Maybe<Term>) => string;
export declare const collectArities: (terms: Maybe<Term>[]) => Arities;
export declare const collectTermSymbols: (t: Term, symbols: Set<Symb>) => void;
export declare const collectSymbols: (terms: Maybe<Term>[]) => Set<Symb>;
export declare function genSymbolSplitter(symbols: string[]): (str: string) => Maybe<string[]>;
export declare const termToNames: (term: Term) => string[];
export declare const makePatterns: (...patterns: string[]) => Fun[];
export declare const symbs: (term: string) => string[];
export declare const unstringify: (str: string, splitter: (str: string) => Maybe<string[]>, arities: Arities) => Maybe<Term>;
export declare type RuleMatcher = (query: Term) => Maybe<Rule[]>;
export declare const buildMatcher: (trs: TRS) => RuleMatcher;
export {};
