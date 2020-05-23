import { Symb, Term } from "../../../Parser/Types";
import { traverseNames } from "../../../Parser/Utils";
import { Arities } from "../../../Compiler/Passes/Lazify";
import { Maybe } from "../../../Compiler/Utils";
import { ω } from './Closure';

export type TrieNode<T> = {
    symbol: Symb,
    value?: T,
    children?: { [key: string]: TrieNode<T> }
};

export class StringClosureMatcher<T> {
    private root: TrieNode<T>;

    constructor() {
        this.root = { symbol: null, children: {} };
    }

    private findNode(symb: Symb, node: TrieNode<T>): Maybe<TrieNode<T>> {
        if (node.children) {
            return node.children[symb] ?? node.children[ω];
        }
    }

    public insert(key: Symb[], value: T): void {
        let node = this.root;
        key.forEach((symb, i) => {
            const child = this.findNode(symb, node);

            if (child) {
                node = child;
            } else {
                const childNode: TrieNode<T> = {
                    symbol: symb,
                    value: i === key.length - 1 ? value : undefined
                };

                if (node.children) {
                    node.children[symb] = childNode;
                } else {
                    node.children = { [symb]: childNode };
                }

                node = childNode;
            }
        });
    }

    public lookup(key: Symb[], arities: Arities): Maybe<T> {
        let node = this.root;
        for (let i = 0; i < key.length; i++) {
            const symb = key[i];
            const child = this.findNode(symb, node);

            if (child) {
                node = child;
                if (child.symbol === ω) {
                    // skip the subterm
                    const ar = arities.get(symb) ?? 0;
                    i += ar;
                }
            }
        }

        return node.value;
    }

    public lookupTerm(term: Term, arities: Arities): Maybe<T> {
        let node = this.root;
        let skip = 0;

        for (const symb of traverseNames(term)) {
            if (skip > 0) {
                skip--;
                continue;
            }

            const child = this.findNode(symb, node);

            if (child) {
                node = child;
                if (child.symbol === ω) {
                    // skip the subterm
                    const ar = arities.get(symb) ?? 0;
                    skip += ar;
                }
            }
        }

        return node.value;
    }

    public toJSON(): string {
        return JSON.stringify(this.root);
    }
}