export type Var = string;
export type Symb = string;
export type Fun = { name: Symb, args: Term[] };
export type Term = Var | Fun;
export type Dict<T> = { [key: string]: T };
export type Substitution = Dict<Term>;
export type Rule = [Fun, Term];
export type TRS = Map<Symb, Rule[]>;
export type EmptyObject = Record<string, unknown>;

export function dictSet<T>(dict: Dict<T>, key: string, value: T): Dict<T> {
    dict[key] = value;
    return dict;
}

export function dictHas<T>(dict: Dict<T>, key: string): boolean {
    // https://eslint.org/docs/rules/no-prototype-builtins
    return Object.prototype.hasOwnProperty.call(dict, key);
}

export function dictGet<T>(dict: Dict<T>, key: string): T {
    return dict[key];
}

export function dictEntries<T>(dict: Dict<T>): [string, T][] {
    return Object.entries(dict);
}

export function dictValues<T>(dict: Dict<T>): T[] {
    return Object.values(dict);
}

export function dictKeys<T>(dict: Dict<T>): string[] {
    return Object.keys(dict);
}

export function dictMap<T, U>(dict: Dict<T>, f: (val: T) => U): Dict<U> {
    const newDict: Dict<U> = {};
    for (const [key, val] of dictEntries(dict)) {
        dictSet(newDict, key, f(val));
    }

    return newDict;
}

export const unreachable = (msg = ''): never => {
    throw new Error(`Code marked as unreachable was reached: ${msg}`);
};