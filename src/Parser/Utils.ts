import { isVar, Maybe } from "../Compiler/Utils";
import { Symb, Term } from "./Types";

export function* reverse<T>(elems: T[]): Iterable<T> {
    for (let i = elems.length - 1; i >= 0; i--) {
        yield elems[i];
    }
}

export function* join<T>(as: Iterable<T>, bs: Iterable<T>): Iterable<T> {
    for (const a of as) yield a;
    for (const b of bs) yield b;
}

export function* once<T>(val: T): Iterable<T> {
    yield val;
}

export function* iter<T>(vals: T[]): Iterable<T> {
    for (const val of vals) {
        yield val;
    }
}

export function some<T>(it: Iterable<T>, pred: (val: T) => boolean): boolean {
    for (const val of it) {
        if (pred(val)) return true;
    }

    return false;
}

export function every<T>(it: Iterable<T>, pred: (val: T) => boolean): boolean {
    for (const val of it) {
        if (!pred(val)) return false;
    }

    return true;
}

export function find<T>(it: Iterable<T>, pred: (val: T) => boolean): Maybe<T> {
    for (const val of it) {
        if (pred(val)) return val;
    }
}

export function partition<T>(it: Iterable<T>, pred: (val: T) => boolean): [T[], T[]] {
    const as = [];
    const bs = [];

    for (const val of it) {
        if (pred(val)) {
            as.push(val);
        } else {
            bs.push(val);
        }
    }

    return [as, bs];
}

export function* indexed<T>(vals: Iterable<T>): Iterable<[T, number]> {
    let i = 0;
    for (const val of vals) {
        yield [val, i++];
    }
}

export function* range(from: number, to: number, step = 1): Iterable<number> {
    for (let i = from; i <= to; i += step) {
        yield i;
    }
}

export function* map<U, V>(it: Iterable<U>, f: (val: U) => V): Iterable<V> {
    for (const val of it) {
        yield f(val);
    }
}

export function* repeat<T>(val: T, count: number): Iterable<T> {
    for (let i = 0; i < count; i++) {
        yield val;
    }
}

export function union<T>(...sets: Set<T>[]): Set<T> {
    return unionMut(new Set(), ...sets);
}

export function intersection<T>(...sets: Set<T>[]): Set<T> {
    return intersectionMut(new Set(), ...sets);
}

export function unionMut<T>(a: Set<T>, ...sets: Set<T>[]): Set<T> {
    for (const set of sets) {
        for (const val of set) {
            a.add(val);
        }
    }

    return a;
}

export function intersectionMut<T>(a: Set<T>, ...sets: Set<T>[]): Set<T> {
    for (const set of sets) {
        for (const val of a) {
            if (!set.has(val)) {
                a.delete(val);
            }
        }
    }

    return a;
}

export function setMap<U, V>(set: Set<U>, f: (val: U) => V): Set<V> {
    return new Set([...set.values()].map(f));
}

export function setFilter<T>(set: Set<T>, f: (val: T) => boolean): Set<T> {
    return new Set([...set.values()].filter(f));
}

export function mapMut<U, V>(vals: U[], f: (val: U, index: number) => V): V[] {
    for (let i = 0; i < vals.length; i++) {
        (vals[i] as (V | U)) = f(vals[i], i);
    }

    return vals as unknown as V[];
}

export function mapString(str: string, f: (char: string) => string): string {
    let newStr = '';
    for (const char of str) {
        newStr += f(char);
    }

    return newStr;
}

export function time<T>(f: () => T): [number, T] {
    const start = Date.now();
    const res = f();
    return [Date.now() - start, res];
}

export function* traverse(term: Term): Iterable<Term> {
    if (isVar(term)) {
        yield term;
    } else {
        yield term;
        for (const arg of term.args) {
            for (const t of traverse(arg)) {
                yield t;
            }
        }
    }
}

export function* traverseNames(term: Term): Iterable<Symb> {
    for (const t of traverse(term)) {
        if (isVar(t)) {
            yield t;
        } else {
            yield t.name;
        }

    }
}

export function pop<T>(elems: T[], count = 1): T[] {
    const popped = [];
    for (let i = 0; i < count; i++) {
        popped.push(elems.pop());
    }

    return popped;
}

export function* gen<T>(count: number, f: (idx: number) => T): Iterable<T> {
    for (let i = 0; i < count; i++) {
        yield f(i);
    }
}

export const repeatString = (str: string, n: number): string => {
    if (n < 1) return '';
    let seq = str;

    while (2 * seq.length <= n) {
        seq += seq;
    }

    seq += seq.slice(0, n - seq.length);

    return seq;
};

export const tabs = (count: number): string => repeatString('   ', count);

export const indent = (tabCount: number, ...lines: string[]): string => {
    const ident = tabs(tabCount);
    return lines.map(l => `${ident}${l}`).join('\n');
};

export const format = (...lines: string[]): string => {
    let tabCount = 0;
    const indented: string[] = [];

    for (const line of map(lines, s => s.trimRight())) {
        if (line.endsWith('{')) {
            indented.push(indent(tabCount, line));
            tabCount++;
            continue;
        } else if (line.endsWith('}')) {
            tabCount--;
        }

        indented.push(indent(tabCount, line));
    }

    return indented.join('\n');
};