import { Fun, Rule, Symb, Term, TRS, Var } from "../../Parser/Types";
import { Ok } from "../../Types";
import { CompilationResult, CompilerPass } from "./CompilerPass";
import { addRules, arity, emptyTRS, fill, fun, genVars, isEmpty, isFun, isVar, replaceTerms, ruleVars } from "../Utils";

export type LazinessAnnotations = Map<Symb, boolean[]>;
export type Arities = Map<Symb, number>;

export const lazyAnnotationSymb = 'Lazy';

const instSymb = 'inst';
const thunkSymb = 'Θ';

const Inst = (...args: Term[]) => fun(instSymb, ...args);
const Thunk = (name: Symb, ...args: Term[]) => fun(`${thunkSymb}${name}`, ...args);

export const lazify: CompilerPass = (trsWithAnnotations: TRS): CompilationResult => {
    const newTrs = emptyTRS();
    const [ann, hasLazyTerms] = collectLazinessAnnotations(trsWithAnnotations);
    const trs = removeLazinessAnnotations(trsWithAnnotations);
    if (!hasLazyTerms) return Ok(trs);

    const arities = collectTRSArities(trs);

    // thunk each lazy argument
    for (const [name, rules] of trs.entries()) {
        for (const [lhs, rhs] of rules) {
            const thunkedRule: Rule = instantiateMigrants([
                lhs,
                thunkify(rhs, ann)
            ], ann);

            addRules(newTrs, thunkedRule);

            // make sure the arity is correct for function symbols
            arities.set(name, arity(rules));
        }
    }

    // instantiate each function symbol
    for (const [symb, ar] of arities.entries()) {
        const varNames = genVars(ar);

        const instRule: Rule = [
            Inst(Thunk(symb, ...varNames)),
            // FIXME: Don't instantiate everything
            fun(symb, ...varNames.map(t => Inst(t)))
        ];

        addRules(newTrs, instRule);
    }

    addRules(newTrs, [Inst('x'), 'x']);

    return Ok(newTrs);
};

const removeLazinessAnnotations = (trs: TRS): TRS => {
    const newTrs = new Map<string, Rule[]>();

    for (const [name, rules] of trs.entries()) {
        for (const [lhs, rhs] of rules) {
            const newArgs: Term[] = [];
            for (const t of lhs.args) {
                if (isFun(t, lazyAnnotationSymb)) {
                    newArgs.push(t.args[0]);
                } else {
                    newArgs.push(t);
                }
            }

            addRules(newTrs, [{ name, args: newArgs }, rhs]);
        }
    }

    return newTrs;
};

const collectLazinessAnnotations = (trs: TRS): [LazinessAnnotations, boolean] => {
    const annotations = new Map<string, boolean[]>();
    let hasLazyTerms = false;

    for (const [name, rules] of trs.entries()) {
        const ar = arity(rules);
        const ann = fill(false, ar);

        for (const [lhs, _] of rules) {
            lhs.args.forEach((t, i) => {
                if (isFun(t, lazyAnnotationSymb)) {
                    ann[i] = true;
                    hasLazyTerms = true;
                }
            });
        }

        annotations.set(name, ann);
    }

    return [annotations, hasLazyTerms];
};

export const collectTRSArities = (trs: TRS): Arities => {
    const arities = new Map<Symb, number>();

    for (const rules of trs.values()) {
        for (const rule of rules) {
            collectRuleArity(rule, arities);
        }
    }

    return arities;
};

const collectRuleArity = ([lhs, rhs]: Rule, arities: Arities): void => {
    collectArity(lhs, arities);
    collectArity(rhs, arities);
};

export const collectArity = (t: Term, arities: Arities): void => {
    if (isFun(t)) {
        arities.set(t.name, arities.get(t.name) ?? t.args.length);
        t.args.forEach(s => collectArity(s, arities));
    }
};

const isLazy = (ruleName: string, nth: number, ann: LazinessAnnotations): boolean => {
    return ann.has(ruleName) ? ann.get(ruleName)[nth] : false;
};

const isVarActive = (x: Var, t: Term, ann: LazinessAnnotations): boolean => {
    if (isVar(t)) return t === x;
    return t.args.some((arg, i) => (
        !isLazy(t.name, i, ann) && isVarActive(x, arg, ann)
    ));
};

const isVarMigrant = (x: Var, [lhs, rhs]: Rule, ann: LazinessAnnotations): boolean => {
    return !isVarActive(x, lhs, ann) && isVarActive(x, rhs, ann);
};

const migrantVars = (rule: Rule, ann: LazinessAnnotations): Var[] => {
    return ruleVars(rule).filter(x => isVarMigrant(x, rule, ann));
};

const thunkifyAll = (ts: Term[], ann: LazinessAnnotations): Term[] => (
    ts.map(t => isVar(t) ? t : Thunk(t.name, ...thunkifyAll(t.args, ann)))
);

const thunkify = (t: Term, ann: LazinessAnnotations): Term => {
    if (isVar(t)) return t;

    const args = t.args.map((arg, i) => {
        if (isFun(arg) && isLazy(t.name, i, ann)) {
            return thunkify(Thunk(arg.name, ...thunkifyAll(arg.args, ann)), ann);
        }

        return arg;
    });

    return { name: t.name, args };
};

const instantiateMigrants = (rule: Rule, ann: LazinessAnnotations): Rule => {
    const [l, r] = rule;
    if (isVar(r) && isVarMigrant(r, rule, ann)) {
        return [l, Inst(r)];
    } else if (isFun(r)) {
        const migrants = migrantVars(rule, ann);
        if (!isEmpty(migrants)) {
            const newArgs = migrants.reduce((ts, x) => replaceTerms(x, Inst(x), ts), r.args);
            const newRhs: Fun = { name: r.name, args: newArgs };
            return [l, newRhs];
        }
    }

    return rule;
};