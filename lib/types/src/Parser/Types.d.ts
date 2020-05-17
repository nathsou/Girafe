export declare type Var = string;
export declare type Symb = string;
export declare type Fun = {
    name: Symb;
    args: Term[];
};
export declare type Term = Var | Fun;
export declare type StringMap<T> = {
    [key: string]: T;
};
export declare type Substitution = StringMap<Term>;
export declare type Rule = [Fun, Term];
export declare type TRS = Map<Symb, Rule[]>;
export declare type Targets = 'js' | 'haskell' | 'ocaml';
export declare type JSExternals<Exts extends string> = {
    [name in Exts]: (t: Fun) => Term;
};
export declare type Externals<Target extends Targets, Exts extends string> = {
    [key in Exts]: (name: string) => string;
};
export declare function mapSet<T>(map: StringMap<T>, key: string, value: T): StringMap<T>;
export declare function mapHas<T>(map: StringMap<T>, key: string): boolean;
export declare function mapGet<T>(map: StringMap<T>, key: string): T;
export declare function mapEntries<T>(map: StringMap<T>): [string, T][];
export declare function mapValues<T>(map: StringMap<T>): T[];
export declare function mapKeys<T>(map: StringMap<T>): string[];
