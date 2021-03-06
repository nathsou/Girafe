import { Dict, dictEntries, dictGet, dictHas, dictSet, Fun, Rule, Substitution, Symb, Term, TRS, Var } from "../Parser/Types";
import { every, gen, range, some, traverseNames } from "../Parser/Utils";
import { Ok } from "../Types";
import { check, checkArity, checkNoDuplicates, checkNoFreeVars, warn } from "./Passes/Checks";
import { CompilerPass } from "./Passes/CompilerPass";
import { lazify } from "./Passes/Lazify";
import { leftLinearize, replaceVars } from "./Passes/LeftLinearize";
import { orderBySpecificity } from "./Passes/OrderBy";
import { NativeExternals } from "../Externals/Externals";
import { normalizeLhsArgs } from "./Passes/NormalizeLhsArgs";
import { simulateIfs } from "./Passes/SimulateIfs";

export type Maybe<T> = T | void;

// Used when we know for sure that a maybe is defined
export function defined<T>(mb: Maybe<T>): T {
  if (isNothing(mb)) {
    throw new Error(`Called 'defined' on Nothing`);
  }

  return mb as T;
}

export const logTRS = (logFn: (trs: string) => void = console.log): CompilerPass => (trs: TRS) => {
  logFn(showTRS(trs));
  return Ok(trs);
};

export const defaultPasses: (exts: NativeExternals) => CompilerPass[] = exts => [
  check(
    checkNoFreeVars,
    checkArity,
    checkNoDuplicates,
    // checkLeftLinearity
  ),
  warn(
    (warnings: string[]) => warnings.forEach(w => console.warn(w)),
    // checkTailRecursive
  ),
  // currify,
  orderBySpecificity,
  leftLinearize,
  simulateIfs(),
  lazify,
  normalizeLhsArgs(exts),
  // logTRS(),
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

export const isConst = (term: Term): boolean => {
  return isFun(term) && term.args.length === 0;
};

export function vars(term: Term, acc: Var[] = []): Var[] {
  if (isVar(term)) {
    acc.push(term);
    return acc;
  }

  return term.args.reduce((acc, t) => vars(t, acc), acc);
}

export function* rules(trs: TRS): Iterable<Rule> {
  for (const rules of trs.values()) {
    yield* rules;
  }
}

export const rule = (lhs: Fun, rhs: Term): Rule => [lhs, rhs];

export const terms = (trs: TRS): Term[] => {
  const terms = [];
  for (const rules of trs.values()) {
    for (const [lhs, rhs] of rules) {
      terms.push(lhs, rhs);
    }
  }

  return terms;
};

export const funs = (trs: TRS): Term[] => {
  const terms = [];
  for (const rules of trs.values()) {
    for (const [lhs, rhs] of rules) {
      terms.push(lhs);
      if (isFun(rhs)) {
        terms.push(rhs);
      }
    }
  }

  return terms;
};

// returns all the funs in t
export const allSymbs = (
  t: Term,
  acc: Symb[] = []
): Symb[] => {
  if (isVar(t)) return acc;
  acc.push(t.name);

  for (const arg of t.args) {
    allSymbs(arg, acc);
  }

  return acc;
};

export function occurs(x: Var, t: Term): boolean {
  return vars(t).includes(x);
}

export function isNothing<T>(m: Maybe<T>): m is void {
  return typeof m === "undefined";
}

export function isSomething<T>(m: Maybe<T>): m is T {
  return !isNothing(m);
}

export function substitute(x: Var, sigma: Substitution): Term;
export function substitute(f: Fun, sigma: Substitution): Fun;
export function substitute(t: Term, sigma: Substitution): Term;
export function substitute(t: Term, sigma: Substitution): Term {
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

export const showTermRec = (t: Term): string => {
  if (isVar(t)) return t;
  if (t.args.length === 0) return t.name;

  return `${t.name}(${t.args.map(showTermRec).join(", ")})`;
};

// Requires constructor arities to be consistant
export function showTerm(term: Term): string {
  if (isVar(term)) return term;
  if (term.args.length === 0) return term.name;

  const terms: Term[] = [term];
  const stack: string[] = [];
  const symbols: [Symb, number][] = [];

  // flatten the terms onto a stack
  while (terms.length > 0) {
    const t = terms.pop();

    if (isVar(t)) {
      stack.push(t);
    } else if (t.args.length === 0) {
      stack.push(t.name);
    } else {
      for (let i = t.args.length - 1; i >= 0; i--) {
        terms.push(t.args[i]);
      }

      terms.push(t.name);
      symbols.push([t.name, t.args.length]);
    }
  }

  const argsStack: string[] = [];

  // assemble constructors back when all arguments have been stringified
  for (let i = stack.length - 1; i >= 0; i--) {
    const t = stack[i];
    if (symbols.length === 0) break;
    const [f, ar] = symbols[symbols.length - 1];

    if (t === f) {
      const args = [];
      for (let k = 0; k < ar; k++) {
        args.push(argsStack.pop());
      }

      argsStack.push(f + '(' + args.join(', ') + ')');
      symbols.pop();
    } else {
      argsStack.push(t);
    }
  }

  return argsStack[0];
}

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

export const isRuleTailRecursive = ([lhs, rhs]: Rule): boolean => {
  const name = ruleName([lhs, rhs]);
  return isFun(rhs, name);
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
  return inside.map(t => termsEq(t, old) ? by : (isVar(t) ? t : fun(t.name, ...replaceTerms(old, by, t.args))));
};

export const cloneTerm = <T extends Term>(t: T): T => {
  if (isVar(t)) return t;
  return { name: (t as Fun).name, args: (t as Fun).args.map(arg => cloneTerm(arg)) } as T;
};

export const replaceTermAt = (parent: Term, t: Term, pos: number[]): Term => {
  if (isVar(parent) || parent.args.length === 0 || pos.length === 0) {
    return cloneTerm(parent);
  }

  const copy = cloneTerm(parent);
  let q = copy;

  for (let i = 0; i < pos.length - 1; i++) {
    q = q.args[pos[i]] as Fun;
    if (isVar(q)) return copy;
  }

  q.args[last(pos)] = t;
  return copy;
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

export const freshPrefixedSymb = (prefix: string, symbs: Set<Symb>): Symb => {
  for (const i of range(0, Infinity)) {
    if (!symbs.has(`${prefix}${i}`)) {
      return `${prefix}${i}`;
    }
  }
};

export const replaceSubstrings = (str: string, substrings: { [key: string]: string }): string => {
  let replaced = str;

  for (const [symb, replacement] of Object.entries(substrings)) {
    replaced = replaced.replace(new RegExp(replacement, 'g'), symb);
  }

  return replaced;
};

// query variables are free
export const stringifyQueryVars = (q: Term): Term => {
  if (isFun(q)) {
    return replaceVars(q, vars(q).map(v => `"${v}"`));
  }

  return q;
};

// maps every key of a given array to a value to build a dictionary
export const associate = <K extends string | number | symbol, V>(
  keys: K[],
  vals: (key: K) => V
): Record<K, V> => {
  const dict = {} as Record<K, V>;

  for (const key of keys) {
    dict[key] = vals(key);
  }

  return dict;
};