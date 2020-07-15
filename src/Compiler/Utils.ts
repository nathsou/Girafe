import { Fun, dictEntries, dictGet, dictHas, dictSet, Rule, Dict, Substitution, Symb, Term, TRS, Var } from "../Parser/Types";
import { every, some, traverseNames, gen } from "../Parser/Utils";
import { Ok } from "../Types";
import { check, checkArity, checkNoDuplicates, checkNoFreeVars } from "./Passes/Checks";
import { CompilerPass } from "./Passes/CompilerPass";
import { orderBySpecificity } from "./Passes/OrderBy";
import { lazify } from "./Passes/Lazify";

export type Maybe<T> = T | void;

// Used when we know for sure that a maybe is defined
export function defined<T>(mb: Maybe<T>): T {
  return mb as T;
}

export const logTRS: CompilerPass = (trs: TRS) => {
  console.log(showTRS(trs));
  return Ok(trs);
};

export const defaultPasses: CompilerPass[] = [
  check(
    checkNoFreeVars,
    checkArity,
    checkNoDuplicates,
  ),
  // currify,
  lazify,
  // leftLinearize,
  orderBySpecificity,
  logTRS,
];

export function isFun(term: Term, name?: Symb): term is Fun {
  if (name) {
    return typeof term === "object" && term.name === name;
  }

  return typeof term === "object";
}

export function isVar(term: Term, name?: Var): term is Var {
  if (name) {
    return term === name;
  }

  return typeof term === "string";
}

export function vars(term: Term, acc: Var[] = []): Var[] {
  if (isVar(term)) {
    acc.push(term);
    return acc;
  }

  return term.args.reduce((acc, t) => vars(t, acc), acc);
}

export function occurs(x: Var, t: Term): boolean {
  return vars(t).includes(x);
}

export function isNothing<T>(m: Maybe<T>): m is void {
  return typeof m === "undefined";
}

export function isSomething<T>(m: Maybe<T>): m is T {
  return !isNothing(m);
}

export const substitute = (t: Term, sigma: Substitution): Term => {
  if (isVar(t)) return dictGet(sigma, t) ?? t;
  return { name: t.name, args: t.args.map(s => substitute(s, sigma)) };
};

export const termsEq = (a: Term, b: Term): boolean => {
  if (isVar(a) && isVar(b)) return a === b;
  if (isFun(a) && isFun(b)) {
    return a.name === b.name &&
      a.args.length === b.args.length &&
      every(zip(a.args, b.args), ([s, t]) => termsEq(s, t));
  }

  return false;
};

export function* zip<T, U>(as: T[], bs: U[]): IterableIterator<[T, U]> {
  const len = Math.min(as.length, bs.length);

  for (let i = 0; i < len; i++) {
    yield [as[i], bs[i]];
  }
}

export const rulesEq = ([lhs1, rhs1]: Rule, [lhs2, rhs2]: Rule): boolean => {
  return termsEq(lhs1, lhs2) && termsEq(rhs1, rhs2);
};

export const hasRule = (trs: TRS, rule: Rule): boolean => {
  const name = ruleName(rule);
  if (trs.has(name)) {
    return trs.get(name).some(def => rulesEq(def, rule));
  }

  return false;
};

// adds a rule to a trs if it does not already exist
export const addRules = (trs: TRS, ...rules: Rule[]): void => {
  for (const rule of rules) {
    const name = ruleName(rule);
    if (!hasRule(trs, rule)) {
      if (trs.has(name)) {
        trs.get(name).push(rule);
      } else {
        trs.set(name, [rule]);
      }
    }
  }
};

export const ruleName = ([lhs, _]: Rule): Symb => lhs.name;
export const lhs = ([lhs, _]: Rule): Fun => lhs;
export const rhs = ([_, rhs]: Rule): Term => rhs;

export function uniq<T>(vals: T[]): T[] {
  return [...new Set(vals)];
}

export const ruleVars = ([lhs, rhs]: Rule): Var[] => {
  return uniq([...vars(lhs), ...vars(rhs)]);
};

export const removeRules = (trs: TRS, ...rules: Rule[]): void => {
  for (const rule of rules) {
    const name = ruleName(rule);
    if (trs.has(name)) {
      trs.set(name, trs.get(name).filter(def => !rulesEq(rule, def)));
    }
  }
};

export const mapify = (rules: Rule[], trs: TRS = new Map()): TRS => {
  for (const rule of rules) {
    const f = ruleName(rule);
    if (trs.has(f)) {
      trs.get(f).push(rule);
    } else {
      trs.set(f, [rule]);
    }
  }

  return trs;
};

export const unmapify = (trs: TRS): Rule[] => (
  [].concat(...trs.values())
);

export const showTRS = (trs: TRS): string => {
  const out = [];
  for (const [, rules] of trs) {
    for (const rule of rules) {
      out.push(showRule(rule));
    }
  }

  return out.join("\n");
};

export const showTerm = (t: Term): string => {
  if (isVar(t)) return t;
  if (t.args.length === 0) return t.name;

  return `${t.name}(${t.args.map(showTerm).join(", ")})`;
};

export const showRule = ([lhs, rhs]: Rule): string => (
  `${showTerm(lhs)} -> ${showTerm(rhs)}`
);

export const showSubst = (sigma: Substitution): string => (
  dictEntries(sigma)
    .map(([a, b]) => `${showTerm(a)}: ${showTerm(b)}`)
    .join(", ")
);

export const cloneTRS = (trs: TRS): TRS => {
  return new Map(trs.entries());
};

export const emptyTRS = (): TRS => {
  return new Map();
};

export const arity = (rules: Rule[]): number => {
  return ruleArity(rules[0]);
};

export const ruleArity = ([lhs, _]: Rule): number => {
  return lhs.args.length;
};

export const fun = (name: Symb, ...args: Term[]): Fun => {
  return { name, args };
};

export function genVars(n: number): string[] {
  return [...gen(n, i => `v${i + 1}`)];
}

export const mostGeneralFun = (name: string, arity: number): Fun => {
  return { name, args: genVars(arity) };
};

export const isRuleMostGeneral = ([lhs, _]: Rule): boolean => {
  return lhs.args.every(t => isVar(t));
};

export const hasMostGeneralRule = (rules: Rule[]): boolean => {
  return rules.some(isRuleMostGeneral);
};

export const isRuleRecursive = ([lhs, rhs]: Rule): boolean => {
  const name = ruleName([lhs, rhs]);
  return some(traverseNames(rhs), f => f === name);
};

export const hasRecursiveRule = (rules: Rule[]): boolean => (
  rules.some(isRuleRecursive)
);

export function setDiff<T>(as: Set<T>, bs: Set<T>): Set<T> {
  const diff = new Set<T>();

  for (const a of as) {
    if (!bs.has(a)) {
      diff.add(a);
    }
  }

  return diff;
}

export type SetLike<T> = Set<T> | Map<T, unknown>;

export function setEq<T>(as: SetLike<T>, bs: SetLike<T>): boolean {
  return as.size === bs.size && !some(as.keys(), a => !bs.has(a));
}

export function swapMut<T>(vals: T[], i: number, j: number): void {
  if (i < 0 || j < 0 || i >= vals.length || j >= vals.length) {
    throw new Error(`invalid swap indices, len: ${vals.length}, i: ${i}, j: ${j}`);
  }
  const tmp = vals[i];
  vals[i] = vals[j];
  vals[j] = tmp;
}

export function swap<T>(vals: T[], i: number, j: number): T[] {
  const copy = [...vals];
  swapMut(copy, i, j);
  return copy;
}

export const unusedRuleVars = ([lhs, rhs]: Rule): Set<string> => {
  return setDiff(new Set(vars(lhs)), new Set(vars(rhs)));
};

export function fill<T>(val: T, count: number): T[] {
  const vals = [];
  for (let i = 0; i < count; i++) {
    vals.push(val);
  }
  return vals;
}

export function occurrences<T>(vals: T[]): Map<T, number[]> {
  const occurrences = new Map<T, number[]>();

  vals.forEach((val, idx) => {
    if (occurrences.has(val)) {
      occurrences.get(val).push(idx);
    } else {
      occurrences.set(val, [idx]);
    }
  });

  return occurrences;
}

export function elem<T>(
  value: T,
  elems: T[],
  eq = (a: T, b: T): boolean => a === b,
): boolean {
  return elems.some(val => eq(val, value));
}

export function hasDuplicates<T>(
  vals: T[],
  eq?: (a: T, b: T) => boolean,
): boolean {
  if (isEmpty(vals)) return false;
  const [h, tl] = decons(vals);
  return elem(h, tl, eq) || hasDuplicates(tl);
}

export function hasDuplicatesSet<T>(
  vals: T[],
): boolean {
  return new Set(vals).size !== vals.length;
}

export function hasDuplicatesMap<T>(
  vals: T[],
): boolean {
  return some(occurrences(vals).values(), (occs: number[]) => occs.length > 1);
}

export function head<T>(list: T[]): T {
  return list[0];
}

export function last<T>(list: T[]): T {
  return list[list.length - 1];
}

export function tail<T>(list: T[]): T[] {
  return list.slice(1);
}

export function decons<T>(list: T[]): [T, T[]] {
  return [head(list), tail(list)];
}

export function split<T>(list: T[], splitIdx: number): [T[], T[]] {
  return [list.slice(0, splitIdx), list.slice(splitIdx)];
}

export function fst<U, V>([u,]: [U, V]): U {
  return u;
}

export function snd<U, V>([, v]: [U, V]): V {
  return v;
}

export function trd<U, V, W>([, , w]: [U, V, W]): W {
  return w;
}

export const replaceTerms = (old: Term, by: Term, inside: Term[]): Term[] => {
  return inside.map(t => termsEq(t, old) ? by : t);
};

export function isEmpty<T>(collection: T[] | Set<T>): boolean {
  return (Array.isArray(collection) ? collection.length : collection.size) ===
    0;
}

export const alphaEquiv = (s: Term, t: Term): boolean => (
  isSomething(alphaEquivAux([hasDuplicatesSet(vars(t)) ? [t, s] : [s, t]]))
);

export type AlphaSubst = Dict<Var>;

const alphaEquivAux = (
  eqs: Array<[Term, Term]>,
  sigma: AlphaSubst = {},
): Maybe<AlphaSubst> => {
  if (isEmpty(eqs)) return sigma;
  const [a, b] = eqs.pop();

  if (isVar(a) && isVar(b)) {
    if (dictHas(sigma, a)) {
      if (dictGet(sigma, a) === b) {
        return alphaEquivAux(eqs, sigma);
      }
    } else {
      return alphaEquivAux(eqs, dictSet(sigma, a, b));
    }
  } else if (isFun(a) && isFun(b, a.name)) {
    if (a.args.length === b.args.length) {
      eqs.push(...zip(a.args, b.args));
      return alphaEquivAux(eqs, sigma);
    }
  }
};

export const rulesAlphaEquiv = (rule1: Rule, rule2: Rule): boolean => {
  return alphaEquiv(lhs(rule1), lhs(rule2));
};
