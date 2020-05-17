"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closureTree = exports.repeatTree = exports.prependTree = exports.factorOutTree = void 0;
const Utils_1 = require("../../../Compiler/Utils");
const ε = '';
const ω = 'ω';
const factorOutAux = (α, term, returnVars = false) => {
    if (Utils_1.isNothing(term))
        return;
    if (Utils_1.isVar(term))
        return returnVars ? term : undefined;
    if (term.name === α)
        return Utils_1.fun(ε, ...term.args);
    if (term.name !== ε)
        return term;
    const [h, tl] = Utils_1.decons(term.args);
    let h_ = factorOutAux(α, h, true);
    if (!returnVars && Utils_1.isSomething(h_) && Utils_1.termsEq(h_, Utils_1.fun(ε))) {
        h_ = undefined;
    }
    if (Utils_1.isSomething(h_) && Utils_1.isVar(h_, α))
        return Utils_1.fun(ε, ...tl);
    if (term.name === ε)
        return Utils_1.fun(ε, ...[h_, ...tl].filter(Utils_1.isSomething));
    return term;
};
exports.factorOutTree = (α, M) => {
    const res = [];
    for (const term of M) {
        const t = factorOutAux(α, term);
        if (Utils_1.isSomething(t) && !Utils_1.termsEq(term, t)) {
            res.push(t);
        }
    }
    // console.log(`factorOut(${α}, [${M.map(showTerm).join(', ')}]) = [${res.map(showTerm).join(', ')}]`);
    // console.log(res);
    return res;
};
exports.prependTree = (α, terms) => {
    const res = (() => {
        if (Utils_1.isFun(α))
            return terms.map(t => ({ name: t.name, args: [α, ...t.args] }));
        return terms.map(t => {
            if (t.name === ε)
                return Utils_1.fun(α, ...t.args);
            return Utils_1.fun(α, t);
        });
    })();
    // console.log(`prepend(${showTerm(α)}, [${terms.map(showTerm).join(', ')}]) = [${res.map(showTerm).join(', ')}]`);
    return res;
};
exports.repeatTree = (α, n) => {
    if (n < 1)
        return { name: ε, args: [] };
    return { name: ε, args: new Array(n).fill(α) };
};
exports.closureTree = (M, arities) => {
    if ((M.length === 1 && Utils_1.head(M).name === ε && Utils_1.isEmpty(Utils_1.head(M).args)) ||
        Utils_1.isEmpty(M)) {
        return M;
    }
    const Mα = (α) => {
        var _a;
        const M_α = exports.factorOutTree(α, M);
        if (α === ω)
            return M_α;
        if (Utils_1.isEmpty(M_α))
            return [];
        const arity = (_a = arities.get(α)) !== null && _a !== void 0 ? _a : 0;
        const r = exports.repeatTree(ω, arity);
        const f = exports.factorOutTree(ω, M);
        const p = exports.prependTree(r, f);
        M_α.push(...p);
        return M_α;
    };
    const M_ = [];
    for (const α of [...arities.keys(), ω]) {
        const m = Mα(α);
        const p = exports.prependTree(α, exports.closureTree(m, arities));
        M_.push(...p);
    }
    return M_;
};
