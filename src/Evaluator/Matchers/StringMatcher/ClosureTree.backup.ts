import { isNothing, Maybe, fun, isVar, decons, isSomething, termsEq, showTerm, isFun, isEmpty, head } from "../../../Compiler/Utils";
import { Symb, Term, Fun } from "../../../Parser/Types";

const ε = '';
const ω = 'ω';

const factorOutAux = (α: Symb, term: Term, returnVars = false): Maybe<Term> => {
    if (isNothing(term)) return;
    if (isVar(term)) return returnVars ? term : undefined;
    if (term.name === α) return fun(ε, ...term.args);
    if (term.name !== ε) return term;
    const [h, tl] = decons(term.args);
    let h_ = factorOutAux(α, h, true);
    if (!returnVars && isSomething(h_) && termsEq(h_, fun(ε))) {
        h_ = undefined;
    }

    if (isSomething(h_) && isVar(h_, α)) return fun(ε, ...tl);

    if (term.name === ε) return fun(ε, ...[h_, ...tl].filter(isSomething));
    return term;
};

export const factorOutTree = (α: Symb, M: Term[]): Fun[] => {
    const res = [];

    for (const term of M) {
        const t = factorOutAux(α, term);
        if (isSomething(t) && !termsEq(term, t)) {
            res.push(t as Fun);
        }
    }

    // console.log(`factorOut(${α}, [${M.map(showTerm).join(', ')}]) = [${res.map(showTerm).join(', ')}]`);
    // console.log(res);
    return res;
};

export const prependTree = (α: string | Fun, terms: Fun[]): Fun[] => {
    const res = (() => {
        if (isFun(α)) return terms.map(t => ({ name: t.name, args: [α, ...t.args] }));
        return terms.map(t => {
            if (t.name === ε) return fun(α, ...t.args);
            return fun(α, t);
        });
    })();

    // console.log(`prepend(${showTerm(α)}, [${terms.map(showTerm).join(', ')}]) = [${res.map(showTerm).join(', ')}]`);
    return res;
};

export const repeatTree = (α: Symb, n: number): Fun => {
    if (n < 1) return { name: ε, args: [] };
    return { name: ε, args: new Array(n).fill(α) };
};

export const closureTree = (M: Fun[], arities: Map<Symb, number>): Fun[] => {
    if (
        (M.length === 1 && head(M).name === ε && isEmpty(head(M).args)) ||
        isEmpty(M)
    ) {
        return M;
    }

    const Mα = (α: string): Fun[] => {
        const M_α = factorOutTree(α, M);
        if (α === ω) return M_α;
        if (isEmpty(M_α)) return [];
        const arity = arities.get(α) ?? 0;
        const r = repeatTree(ω, arity);
        const f = factorOutTree(ω, M);
        const p = prependTree(r, f);
        M_α.push(...p);
        return M_α;
    };

    const M_: Fun[] = [];

    for (const α of [...arities.keys(), ω]) {
        const m = Mα(α);
        const p = prependTree(α, closureTree(m, arities));
        M_.push(...p);
    }

    return M_;
};