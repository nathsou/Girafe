"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermMatcher = void 0;
const Unification_1 = require("../../Evaluator/Unification");
const Utils_1 = require("../../Parser/Utils");
const Closure_1 = require("../StringMatcher/Closure");
const Utils_2 = require("../Utils");
const Closure_2 = require("../StringMatcher/Closure");
class TermMatcher {
    constructor(trs) {
        this.root = {
            symbol: null,
            children: {}
        };
        this.init(trs);
    }
    init(trs) {
        const rules = [...trs.values()].flat();
        const patterns = rules.map(Utils_2.lhs);
        const patternsStr = patterns.map(Closure_1.stringify);
        const M = new Set(patternsStr);
        const arities = Closure_1.collectArities(patterns);
        const M_ = Closure_1.closure(M, arities);
        const splitSymbols = Closure_1.genSymbolSplitter([...arities.keys(), Closure_2.ω]);
        for (const p of M_) {
            const pat = Closure_1.unstringify(p, splitSymbols, arities);
            if (pat) {
                const P_s = [];
                for (const [pattern, rule] of Utils_2.zip(patterns, rules)) {
                    if (Unification_1.matches(pat, pattern)) {
                        P_s.push(rule);
                    }
                }
                this.insert(pat, P_s);
            }
        }
    }
    termName(term) {
        return typeof term === 'string' ? Closure_2.ω : term.name;
    }
    insert(term, value, node = this.root) {
        var _a, _b;
        const name = Utils_2.isVar(term) ? Closure_2.ω : term.name;
        const child = {
            symbol: name,
            children: (_b = (_a = node.children[name]) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : {},
            value: Utils_2.isVar(term) ? value : undefined
        };
        node.children[name] = child;
        node = child;
        if (Utils_2.isFun(term)) {
            if (Utils_2.isEmpty(term.args)) {
                node.value = value;
            }
            for (const [arg, i] of Utils_1.indexed(term.args)) {
                node = this.insert(arg, i === term.args.length - 1 ? value : undefined, node);
            }
        }
        return node;
    }
    lookupArgs(term, node) {
        var _a;
        if (node === undefined)
            return undefined;
        if (node.symbol === Closure_2.ω || Utils_2.isVar(term))
            return node;
        for (const arg of term.args) {
            node = this.lookupArgs(arg, (_a = node.children[this.termName(arg)]) !== null && _a !== void 0 ? _a : node.children[Closure_2.ω]);
            if (node === undefined)
                return;
        }
        return node;
    }
    lookup(term) {
        var _a, _b;
        let node = (_a = this.root.children[this.termName(term)]) !== null && _a !== void 0 ? _a : this.root.children[Closure_2.ω];
        if (node) {
            if (Utils_2.isFun(term)) {
                for (const arg of term.args) {
                    node = this.lookupArgs(arg, (_b = node.children[this.termName(arg)]) !== null && _b !== void 0 ? _b : node.children[Closure_2.ω]);
                    if (node === undefined)
                        return;
                }
            }
            return node.value;
        }
    }
    asMatcher() {
        return (term, unificator) => {
            const rules = this.lookup(term);
            if (rules) {
                for (const [lhs, _] of rules) {
                    const sigma = unificator(term, lhs);
                    if (sigma)
                        return sigma;
                }
            }
        };
    }
}
exports.TermMatcher = TermMatcher;
