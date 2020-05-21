export type Var = string;
export type Symb = string;
export type Fun = { name: Symb, args: Term[] };
export type Term = Var | Fun;
export type StringMap<T> = { [key: string]: T };
export type Substitution = StringMap<Term>;
export type Rule = [Fun, Term];
export type TRS = Map<Symb, Rule[]>;

export type Targets = 'js' | 'haskell' | 'ocaml';
export const supportedTargets: Targets[] = ['js', 'ocaml', 'haskell'];

export type JSExternals<Exts extends string> = {
    [name in Exts]: (t: Fun) => Term
};

export type Externals<Target extends Targets, Exts extends string> = {
    [key in Exts]: (name: string) => string
};

export function mapSet<T>(map: StringMap<T>, key: string, value: T): StringMap<T> {
    map[key] = value;
    return map;
}

export function mapHas<T>(map: StringMap<T>, key: string): boolean {
    return map.hasOwnProperty(key);
}

export function mapGet<T>(map: StringMap<T>, key: string): T {
    return map[key];
}

export function mapEntries<T>(map: StringMap<T>): [string, T][] {
    return Object.entries(map);
}

export function mapValues<T>(map: StringMap<T>): T[] {
    return Object.values(map);
}

export function mapKeys<T>(map: StringMap<T>): string[] {
    return Object.keys(map);
}

export const unreachable = (msg = ''): never => {
    throw Error(`Code marked as unreachable was reached: ${msg}`);
};