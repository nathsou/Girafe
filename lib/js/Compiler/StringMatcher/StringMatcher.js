"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringMatcher = void 0;
const Utils_1 = require("../../Parser/Utils");
const Closure_1 = require("./Closure");
class StringMatcher {
    constructor() {
        this.root = { symbol: null, children: {} };
    }
    findNode(symb, node) {
        var _a;
        if (node.children) {
            return (_a = node.children[symb]) !== null && _a !== void 0 ? _a : node.children[Closure_1.ω];
        }
    }
    insert(key, value) {
        let node = this.root;
        key.forEach((symb, i) => {
            let child = this.findNode(symb, node);
            if (child) {
                node = child;
            }
            else {
                const childNode = {
                    symbol: symb,
                    value: i === key.length - 1 ? value : undefined
                };
                if (node.children) {
                    node.children[symb] = childNode;
                }
                else {
                    node.children = { [symb]: childNode };
                }
                node = childNode;
            }
        });
    }
    lookup(key, arities) {
        var _a;
        let node = this.root;
        for (let i = 0; i < key.length; i++) {
            const symb = key[i];
            const child = this.findNode(symb, node);
            if (child) {
                node = child;
                if (child.symbol === Closure_1.ω) {
                    // skip the subterm
                    const ar = (_a = arities.get(symb)) !== null && _a !== void 0 ? _a : 0;
                    i += ar;
                }
            }
        }
        return node.value;
    }
    lookupTerm(term, arities) {
        var _a;
        let node = this.root;
        let skip = 0;
        for (const symb of Utils_1.traverseSymbols(term)) {
            if (skip > 0) {
                skip--;
                continue;
            }
            const child = this.findNode(symb, node);
            if (child) {
                node = child;
                if (child.symbol === Closure_1.ω) {
                    // skip the subterm
                    const ar = (_a = arities.get(symb)) !== null && _a !== void 0 ? _a : 0;
                    skip += ar;
                }
            }
        }
        return node.value;
    }
    toJSON() {
        return JSON.stringify(this.root);
    }
}
exports.StringMatcher = StringMatcher;
