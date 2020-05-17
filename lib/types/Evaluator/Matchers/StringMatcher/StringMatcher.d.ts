import { Symb, Term } from "../../../Parser/Types";
import { Arities } from "../../../Compiler/Passes/Lazify";
import { Maybe } from "../../../Compiler/Utils";
export declare type TrieNode<T> = {
    symbol: Symb;
    value?: T;
    children?: {
        [key: string]: TrieNode<T>;
    };
};
export declare class StringMatcher<T> {
    private root;
    constructor();
    private findNode;
    insert(key: Symb[], value: T): void;
    lookup(key: Symb[], arities: Arities): Maybe<T>;
    lookupTerm(term: Term, arities: Arities): Maybe<T>;
    toJSON(): string;
}
