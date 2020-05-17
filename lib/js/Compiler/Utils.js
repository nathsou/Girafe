"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rulesAlphaEquiv = exports.alphaEquivAux = exports.alphaEquiv = exports.isEmpty = exports.replaceTerms = exports.trd = exports.snd = exports.fst = exports.split = exports.decons = exports.tail = exports.last = exports.head = exports.hasDuplicatesMap = exports.hasDuplicatesSet = exports.hasDuplicates = exports.elem = exports.occurences = exports.fill = exports.unusedRuleVars = exports.swap = exports.swapMut = exports.setEq = exports.setDiff = exports.hasRecursiveRule = exports.isRuleRecursive = exports.hasMostGeneralRule = exports.isRuleMostGeneral = exports.mostGeneralFun = exports.genVars = exports.fun = exports.ruleArity = exports.arity = exports.emptyTRS = exports.cloneTRS = exports.showSubst = exports.showRule = exports.showTerm = exports.showTRS = exports.unmapify = exports.mapify = exports.removeRules = exports.ruleVars = exports.uniq = exports.rhs = exports.lhs = exports.ruleName = exports.addRules = exports.hasRule = exports.zip = exports.rulesEq = exports.termsEq = exports.substitute = exports.isSomething = exports.isNothing = exports.occurs = exports.vars = exports.isVar = exports.isFun = exports.defaultPasses = exports.logTRS = void 0;
const Types_1 = require("../Parser/Types");
const Utils_1 = require("../Parser/Utils");
const Types_2 = require("../Types");
const Checks_1 = require("./Passes/Checks");
const LeftLinearize_1 = require("./Passes/LeftLinearize");
const OrderBy_1 = require("./Passes/OrderBy");
exports.logTRS = (trs) => {
    console.log(exports.showTRS(trs));
    return Types_2.Ok(trs);
};
exports.defaultPasses = [
    Checks_1.check(Checks_1.checkNoFreeVars, Checks_1.checkArity, Checks_1.checkNoDuplicates),
    // currify,
    // lazify,
    LeftLinearize_1.leftLinearize,
    OrderBy_1.orderBySpecificity,
];
function isFun(term, name) {
    if (name) {
        return typeof term === "object" && term.name === name;
    }
    return typeof term === "object";
}
exports.isFun = isFun;
function isVar(term, name) {
    if (name) {
        return term === name;
    }
    return typeof term === "string";
}
exports.isVar = isVar;
function vars(term, acc = []) {
    if (isVar(term)) {
        acc.push(term);
        return acc;
    }
    return term.args.reduce((acc, t) => vars(t, acc), acc);
}
exports.vars = vars;
function occurs(x, t) {
    return vars(t).includes(x);
}
exports.occurs = occurs;
function isNothing(m) {
    return typeof m === "undefined";
}
exports.isNothing = isNothing;
function isSomething(m) {
    return !isNothing(m);
}
exports.isSomething = isSomething;
function substitute(t, sigma) {
    var _a;
    if (isVar(t))
        return (_a = Types_1.mapGet(sigma, t)) !== null && _a !== void 0 ? _a : t;
    return {
        name: t.name,
        args: t.args.map((s) => substitute(s, sigma)),
    };
}
exports.substitute = substitute;
exports.termsEq = (a, b) => {
    if (isVar(a) && isVar(b)) {
        return a === b;
    }
    if (isFun(a) && isFun(b)) {
        return a.name === b.name &&
            a.args.length === b.args.length &&
            a.args.every((arg, i) => exports.termsEq(arg, b.args[i]));
    }
    return false;
};
exports.rulesEq = ([lhs1, rhs1], [lhs2, rhs2]) => {
    return exports.termsEq(lhs1, lhs2) && exports.termsEq(rhs1, rhs2);
};
function* zip(as, bs) {
    const len = Math.min(as.length, bs.length);
    for (let i = 0; i < len; i++) {
        yield [as[i], bs[i]];
    }
}
exports.zip = zip;
exports.hasRule = (trs, rule) => {
    const name = exports.ruleName(rule);
    if (trs.has(name)) {
        return trs.get(name).some((def) => exports.rulesEq(def, rule));
    }
    return false;
};
// adds a rule to a trs if it does not already exist
exports.addRules = (trs, ...rules) => {
    for (const rule of rules) {
        const name = exports.ruleName(rule);
        if (!exports.hasRule(trs, rule)) {
            if (trs.has(name)) {
                trs.get(name).push(rule);
            }
            else {
                trs.set(name, [rule]);
            }
        }
    }
};
exports.ruleName = ([lhs, _]) => lhs.name;
exports.lhs = ([lhs, _]) => lhs;
exports.rhs = ([_, rhs]) => rhs;
function uniq(vals) {
    return [...new Set(vals)];
}
exports.uniq = uniq;
exports.ruleVars = ([lhs, rhs]) => {
    return uniq([...vars(lhs), ...vars(rhs)]);
};
exports.removeRules = (trs, ...rules) => {
    for (const rule of rules) {
        const name = exports.ruleName(rule);
        if (trs.has(name)) {
            trs.set(name, trs.get(name).filter((def) => !exports.rulesEq(rule, def)));
        }
    }
};
exports.mapify = (rules, trs = new Map()) => {
    for (const rule of rules) {
        const f = exports.ruleName(rule);
        if (trs.has(f)) {
            trs.get(f).push(rule);
        }
        else {
            trs.set(f, [rule]);
        }
    }
    return trs;
};
exports.unmapify = (trs) => ([].concat(...trs.values()));
exports.showTRS = (trs) => {
    const out = [];
    for (const [_, rules] of trs) {
        for (const rule of rules) {
            out.push(exports.showRule(rule));
        }
    }
    return out.join("\n");
};
exports.showTerm = (t) => {
    if (isVar(t))
        return t;
    if (t.args.length === 0)
        return t.name;
    return `${t.name}(${t.args.map(exports.showTerm).join(", ")})`;
};
exports.showRule = ([lhs, rhs]) => (`${exports.showTerm(lhs)} -> ${exports.showTerm(rhs)}`);
exports.showSubst = (sigma) => (Types_1.mapEntries(sigma)
    .map(([a, b]) => `${exports.showTerm(a)}: ${exports.showTerm(b)}`)
    .join(", "));
exports.cloneTRS = (trs) => {
    return new Map(trs.entries());
};
exports.emptyTRS = () => {
    return new Map();
};
exports.arity = (rules) => {
    return exports.ruleArity(rules[0]);
};
exports.ruleArity = ([lhs, _]) => {
    return lhs.args.length;
};
exports.fun = (name, ...args) => {
    return { name, args };
};
function genVars(n) {
    const names = [];
    for (let i = 0; i < n; i++) {
        names.push(`v${(i + 1)}`);
    }
    return names;
}
exports.genVars = genVars;
exports.mostGeneralFun = (name, arity) => {
    return { name, args: genVars(arity) };
};
exports.isRuleMostGeneral = ([lhs, _]) => {
    return lhs.args.every(t => isVar(t));
};
exports.hasMostGeneralRule = (rules) => {
    return rules.some(exports.isRuleMostGeneral);
};
exports.isRuleRecursive = ([lhs, rhs]) => {
    const name = exports.ruleName([lhs, rhs]);
    return Utils_1.some(Utils_1.traverseSymbols(rhs), f => f === name);
};
exports.hasRecursiveRule = (rules) => (rules.some(exports.isRuleRecursive));
function setDiff(as, bs) {
    const diff = new Set();
    for (const a of as) {
        if (!bs.has(a)) {
            diff.add(a);
        }
    }
    return diff;
}
exports.setDiff = setDiff;
function setEq(as, bs) {
    return as.size === bs.size && !Utils_1.some(as.keys(), a => !bs.has(a));
}
exports.setEq = setEq;
function swapMut(vals, i, j) {
    if (i < 0 || j < 0 || i >= vals.length || j >= vals.length) {
        throw new Error(`invalid swap indices, len: ${vals.length}, i: ${i}, j: ${j}`);
    }
    const tmp = vals[i];
    vals[i] = vals[j];
    vals[j] = tmp;
}
exports.swapMut = swapMut;
function swap(vals, i, j) {
    const copy = [...vals];
    swapMut(copy, i, j);
    return copy;
}
exports.swap = swap;
exports.unusedRuleVars = ([lhs, rhs]) => {
    return setDiff(new Set(vars(lhs)), new Set(vars(rhs)));
};
function fill(val, count) {
    const vals = [];
    for (let i = 0; i < count; i++) {
        vals.push(val);
    }
    return vals;
}
exports.fill = fill;
function occurences(vals) {
    const occurences = new Map();
    vals.forEach((val, idx) => {
        if (occurences.has(val)) {
            occurences.get(val).push(idx);
        }
        else {
            occurences.set(val, [idx]);
        }
    });
    return occurences;
}
exports.occurences = occurences;
function elem(value, elems, eq = (a, b) => a === b) {
    return elems.some((val) => eq(val, value));
}
exports.elem = elem;
function hasDuplicates(vals, eq) {
    if (isEmpty(vals))
        return false;
    const [h, tl] = decons(vals);
    return elem(h, tl, eq) || hasDuplicates(tl);
}
exports.hasDuplicates = hasDuplicates;
function hasDuplicatesSet(vals) {
    return new Set(vals).size !== vals.length;
}
exports.hasDuplicatesSet = hasDuplicatesSet;
function hasDuplicatesMap(vals) {
    return Utils_1.some(occurences(vals).values(), (occs) => occs.length > 1);
}
exports.hasDuplicatesMap = hasDuplicatesMap;
function head(list) {
    return list[0];
}
exports.head = head;
function last(list) {
    return list[list.length - 1];
}
exports.last = last;
function tail(list) {
    return list.slice(1);
}
exports.tail = tail;
function decons(list) {
    return [head(list), tail(list)];
}
exports.decons = decons;
function split(list, splitIdx) {
    return [list.slice(0, splitIdx), list.slice(splitIdx)];
}
exports.split = split;
function fst(list) {
    return list[0];
}
exports.fst = fst;
function snd(list) {
    return list[1];
}
exports.snd = snd;
function trd(list) {
    return list[2];
}
exports.trd = trd;
exports.replaceTerms = (old, by, inside) => {
    return inside.map((t) => exports.termsEq(t, old) ? by : t);
};
function isEmpty(collection) {
    return (Array.isArray(collection) ? collection.length : collection.size) ===
        0;
}
exports.isEmpty = isEmpty;
exports.alphaEquiv = (s, t) => (isSomething(exports.alphaEquivAux([hasDuplicates(vars(t)) ? [t, s] : [s, t]])));
exports.alphaEquivAux = (eqs, sigma = {}) => {
    if (isEmpty(eqs))
        return sigma;
    const [a, b] = eqs.pop();
    if (isVar(a) && isVar(b)) {
        if (Types_1.mapHas(sigma, a)) {
            if (Types_1.mapGet(sigma, a) === b) {
                return exports.alphaEquivAux(eqs, sigma);
            }
        }
        else {
            return exports.alphaEquivAux(eqs, Types_1.mapSet(sigma, a, b));
        }
    }
    else if (isFun(a) && isFun(b)) {
        if (a.name == b.name && a.args.length === b.args.length) {
            eqs.push(...zip(a.args, b.args));
            return exports.alphaEquivAux(eqs, sigma);
        }
    }
};
exports.rulesAlphaEquiv = (rule1, rule2) => {
    return exports.alphaEquiv(exports.lhs(rule1), exports.lhs(rule2));
};
