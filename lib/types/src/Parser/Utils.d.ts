import { Symb, Term } from "./Types";
export declare function reverse<T>(elems: T[]): IterableIterator<T>;
export declare function join<T>(as: IterableIterator<T>, bs: IterableIterator<T>): IterableIterator<T>;
export declare function once<T>(val: T): IterableIterator<T>;
export declare function iter<T>(vals: T[]): IterableIterator<T>;
export declare function some<T>(it: IterableIterator<T>, pred: (val: T) => boolean): boolean;
export declare function indexed<T>(vals: T[]): IterableIterator<[T, number]>;
export declare function repeat<T>(val: T, count: number): IterableIterator<T>;
export declare function union<T>(...sets: Set<T>[]): Set<T>;
export declare function unionMut<T>(a: Set<T>, ...sets: Set<T>[]): Set<T>;
export declare function setMap<U, V>(set: Set<U>, f: (val: U) => V): Set<V>;
export declare function setFilter<T>(set: Set<T>, f: (val: T) => boolean): Set<T>;
export declare function mapMut<U, V>(vals: U[], f: (val: U) => V): V[];
export declare function time<T>(f: () => T): [number, T];
export declare function traverse(term: Term): IterableIterator<Term>;
export declare function traverseSymbols(term: Term): IterableIterator<Symb>;
export declare function pop<T>(elems: T[], count?: number): T[];
export declare function randomElement<T>(elems: T[]): T;
export declare function gen<T>(count: number, f: (idx: number) => T): IterableIterator<T>;
