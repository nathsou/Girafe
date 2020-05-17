"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMatcher = exports.unstringify = exports.symbs = exports.makePatterns = exports.termToSymbols = exports.genSymbolSplitter = exports.collectSymbols = exports.collectTermSymbols = exports.collectArities = exports.stringify = exports.closure = exports.prepend = exports.factorOut = exports.ω = exports.ε = void 0;
const Unification_1 = require("../../Evaluator/Unification");
const Parser_1 = require("../../Parser/Parser");
const Utils_1 = require("../../Parser/Utils");
const Lazify_1 = require("../Lazify");
const Utils_2 = require("../Utils");
const StringMatcher_1 = require("./StringMatcher");
exports.ε = "";
exports.ω = "ω";
exports.factorOut = (α, M) => {
    const factored = new Set();
    for (const suffix of M) {
        if (suffix.substr(0, α.length) === α) {
            factored.add(suffix.substr(α.length));
        }
    }
    return factored;
};
exports.prepend = (α, M) => (Utils_1.setMap(M, (s) => `${α}${s}`));
const repeat = (α, n) => {
    if (n < 1)
        return exports.ε;
    let seq = α;
    while (2 * seq.length <= n) {
        seq += seq;
    }
    seq += seq.slice(0, n - seq.length);
    return seq;
};
exports.closure = (M, arities) => {
    if ((M.size === 1 && M.has(exports.ε)) || Utils_2.isEmpty(M))
        return M;
    const Mα = (α) => {
        const M_α = exports.factorOut(α, M);
        if (α === exports.ω)
            return M_α;
        if (Utils_2.isEmpty(M_α))
            return new Set();
        const arity = arities.get(α);
        return Utils_1.unionMut(M_α, exports.prepend(repeat(exports.ω, arity), exports.factorOut(exports.ω, M)));
    };
    const M_ = new Set();
    for (const α of Utils_1.join(arities.keys(), Utils_1.once(exports.ω))) {
        Utils_1.unionMut(M_, exports.prepend(α, exports.closure(Mα(α), arities)));
    }
    return M_;
};
exports.stringify = (t) => {
    if (Utils_2.isNothing(t))
        return "";
    if (Utils_2.isVar(t))
        return exports.ω;
    return `${t.name}${t.args.map((s) => exports.stringify(s)).join("")}`;
};
exports.collectArities = (terms) => {
    const arities = new Map();
    for (const t of terms) {
        if (t) {
            Lazify_1.collectArity(t, arities);
        }
    }
    return arities;
};
exports.collectTermSymbols = (t, symbols) => {
    if (Utils_2.isFun(t)) {
        symbols.add(t.name);
        t.args.forEach((s) => exports.collectTermSymbols(t, symbols));
    }
};
exports.collectSymbols = (terms) => {
    const symbols = new Set();
    for (const t of terms) {
        if (t) {
            exports.collectTermSymbols(t, symbols);
        }
    }
    return symbols;
};
function genSymbolSplitter(symbols) {
    const maxLen = Math.max(...symbols.map((l) => l.length));
    const alphabetSet = new Set(symbols);
    return (str) => {
        const letters = [];
        while (str.length > 0) {
            let found = false;
            for (let len = maxLen; len > 0 && str.length > 0; len--) {
                const prefix = str.substr(0, len);
                if (alphabetSet.has(prefix)) {
                    found = true;
                    letters.push(prefix);
                    str = str.slice(len);
                    break;
                }
            }
            if (!found)
                return;
        }
        return letters;
    };
}
exports.genSymbolSplitter = genSymbolSplitter;
const replaceVars = (t) => {
    if (Utils_2.isVar(t))
        return exports.ω;
    return Utils_2.fun(t.name, ...t.args.map((s) => replaceVars(s)));
};
exports.termToSymbols = (term) => {
    return [...Utils_1.traverseSymbols(term)];
};
exports.makePatterns = (...patterns) => {
    return patterns
        .map((s) => Parser_1.parseTerm(s))
        .filter((t) => Utils_2.isSomething(t) && Utils_2.isFun(t))
        .map(replaceVars);
};
exports.symbs = (term) => {
    const [t] = exports.makePatterns(term);
    return exports.termToSymbols(t);
};
exports.unstringify = (str, splitter, arities) => {
    if (str === exports.ω)
        return exports.ω;
    const symbols = splitter(str);
    if (Utils_2.isSomething(symbols)) {
        return unstringifyAux(symbols, arities);
    }
};
const unstringifyAux = (symbols, arities) => {
    var _a;
    if (Utils_2.isEmpty(symbols))
        return;
    const stack = [];
    for (const f of Utils_1.reverse(symbols)) {
        if (f === exports.ω) {
            stack.push(exports.ω);
        }
        else {
            const ar = (_a = arities.get(f)) !== null && _a !== void 0 ? _a : 0;
            const subterm = Utils_2.fun(f, ...Utils_1.pop(stack, ar).filter(Utils_2.isSomething));
            stack.push(subterm);
        }
    }
    return stack[0];
};
exports.buildMatcher = (trs) => {
    const rules = [...trs.values()].flat();
    const patterns = rules.map(Utils_2.lhs);
    const patternsStr = patterns.map(exports.stringify);
    const M = new Set(patternsStr);
    const arities = exports.collectArities(patterns);
    const M_ = exports.closure(M, arities);
    // console.log([...M_.values()].map(s => unstringify(s, arities)).map(showTerm));
    // const termMatcher = new TermMatcher<string>();
    // for (const t of M_) {
    //     const term = unstringify(t, arities);
    //     if (term) {
    //         termMatcher.insert(term, t);
    //     }
    // }
    // console.log(termMatcher);
    const matcher = new StringMatcher_1.StringMatcher();
    const symbols = [...arities.keys(), exports.ω];
    const splitSymbols = genSymbolSplitter(symbols);
    for (const pat_ of M_) {
        const letters = splitSymbols(pat_);
        if (letters) {
            const pat = exports.unstringify(pat_, splitSymbols, arities);
            if (Utils_2.isNothing(pat))
                continue;
            const P_s = [];
            for (const [pattern, rule] of Utils_2.zip(patterns, rules)) {
                if (Unification_1.matches(pat, pattern)) {
                    P_s.push(rule);
                }
            }
            matcher.insert(letters, P_s);
        }
    }
    console.log(matcher);
    return (query) => {
        return matcher.lookupTerm(query, arities);
    };
};
