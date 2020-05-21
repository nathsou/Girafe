"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectArity = exports.collectTRSArities = exports.lazify = exports.lazyAnnotationSymb = void 0;
const Types_1 = require("../../Types");
const Utils_1 = require("../Utils");
exports.lazyAnnotationSymb = 'Lazy';
const instSymb = 'inst';
const thunkSymb = 'Θ';
const Inst = (...args) => Utils_1.fun(instSymb, ...args);
const Thunk = (name, ...args) => Utils_1.fun(`${thunkSymb}${name}`, ...args);
exports.lazify = (trsWithAnnotations) => {
    const newTrs = Utils_1.emptyTRS();
    const [ann, hasLazyTerms] = collectLazinessAnnotations(trsWithAnnotations);
    const trs = removeLazinessAnnotations(trsWithAnnotations);
    if (!hasLazyTerms)
        return Types_1.Ok(trs);
    const arities = exports.collectTRSArities(trs);
    // thunk each lazy argument
    for (const [name, rules] of trs.entries()) {
        for (const [lhs, rhs] of rules) {
            const thunkedRule = instantiateMigrants([
                lhs,
                thunkify(rhs, ann)
            ], ann);
            Utils_1.addRules(newTrs, thunkedRule);
            // make sure the arity is correct for function symbols
            arities.set(name, Utils_1.arity(rules));
        }
    }
    // instantiate each function symbol
    for (const [symb, ar] of arities.entries()) {
        const varNames = Utils_1.genVars(ar);
        const instRule = [
            Inst(Thunk(symb, ...varNames)),
            // FIXME: Don't instantiate everything
            Utils_1.fun(symb, ...varNames.map(t => Inst(t)))
        ];
        Utils_1.addRules(newTrs, instRule);
    }
    Utils_1.addRules(newTrs, [Inst('x'), 'x']);
    return Types_1.Ok(newTrs);
};
const removeLazinessAnnotations = (trs) => {
    const newTrs = new Map();
    for (const [name, rules] of trs.entries()) {
        for (const [lhs, rhs] of rules) {
            const newArgs = [];
            for (const t of lhs.args) {
                if (Utils_1.isFun(t, exports.lazyAnnotationSymb)) {
                    newArgs.push(t.args[0]);
                }
                else {
                    newArgs.push(t);
                }
            }
            Utils_1.addRules(newTrs, [{ name, args: newArgs }, rhs]);
        }
    }
    return newTrs;
};
const collectLazinessAnnotations = (trs) => {
    const annotations = new Map();
    let hasLazyTerms = false;
    for (const [name, rules] of trs.entries()) {
        const ar = Utils_1.arity(rules);
        const ann = Utils_1.fill(false, ar);
        for (const [lhs, _] of rules) {
            lhs.args.forEach((t, i) => {
                if (Utils_1.isFun(t, exports.lazyAnnotationSymb)) {
                    ann[i] = true;
                    hasLazyTerms = true;
                }
            });
        }
        annotations.set(name, ann);
    }
    return [annotations, hasLazyTerms];
};
exports.collectTRSArities = (trs) => {
    const arities = new Map();
    for (const rules of trs.values()) {
        for (const rule of rules) {
            collectRuleArity(rule, arities);
        }
    }
    return arities;
};
const collectRuleArity = ([lhs, rhs], arities) => {
    exports.collectArity(lhs, arities);
    exports.collectArity(rhs, arities);
};
exports.collectArity = (t, arities) => {
    var _a;
    if (Utils_1.isFun(t)) {
        arities.set(t.name, (_a = arities.get(t.name)) !== null && _a !== void 0 ? _a : t.args.length);
        t.args.forEach(s => exports.collectArity(s, arities));
    }
};
const isLazy = (ruleName, nth, ann) => {
    return ann.has(ruleName) ? ann.get(ruleName)[nth] : false;
};
const isVarActive = (x, t, ann) => {
    if (Utils_1.isVar(t))
        return t === x;
    return t.args.some((arg, i) => (!isLazy(t.name, i, ann) && isVarActive(x, arg, ann)));
};
const isVarMigrant = (x, [lhs, rhs], ann) => {
    return !isVarActive(x, lhs, ann) && isVarActive(x, rhs, ann);
};
const migrantVars = (rule, ann) => {
    return Utils_1.ruleVars(rule).filter(x => isVarMigrant(x, rule, ann));
};
const thunkifyAll = (ts, ann) => (ts.map(t => Utils_1.isVar(t) ? t : Thunk(t.name, ...thunkifyAll(t.args, ann))));
const thunkify = (t, ann) => {
    if (Utils_1.isVar(t))
        return t;
    const args = t.args.map((arg, i) => {
        if (Utils_1.isFun(arg) && isLazy(t.name, i, ann)) {
            return thunkify(Thunk(arg.name, ...thunkifyAll(arg.args, ann)), ann);
        }
        return arg;
    });
    return { name: t.name, args };
};
const instantiateMigrants = (rule, ann) => {
    const [l, r] = rule;
    if (Utils_1.isVar(r) && isVarMigrant(r, rule, ann)) {
        return [l, Inst(r)];
    }
    else if (Utils_1.isFun(r)) {
        const migrants = migrantVars(rule, ann);
        if (!Utils_1.isEmpty(migrants)) {
            const newArgs = migrants.reduce((ts, x) => Utils_1.replaceTerms(x, Inst(x), ts), r.args);
            const newRhs = { name: r.name, args: newArgs };
            return [l, newRhs];
        }
    }
    return rule;
};
