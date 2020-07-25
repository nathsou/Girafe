import { matches } from "../../Unification";
import { parseTerm } from "../../../Parser/Parser";
import { Fun, Rule, Symb, Term, TRS } from "../../../Parser/Types";
import { join, once, pop, reverse, setMap, traverseNames, unionMut, } from "../../../Parser/Utils";
import { Arities, collectArity } from "../../../Compiler/Passes/Lazify";
import { fun, isEmpty, isFun, isNothing, isSomething, isVar, lhs, Maybe, zip, } from "../../../Compiler/Utils";
import { StringClosureMatcher } from "./StringClosureMatcher";

type SuffixSet = Set<string>;
type Closure = Set<string>;

export const ε = '';
export const ω = 'ω';

export const factorOut = (α: Symb, M: SuffixSet): SuffixSet => {
  const factored = new Set<string>();

  for (const suffix of M) {
    if (suffix.substr(0, α.length) === α) {
      factored.add(suffix.substr(α.length));
    }
  }

  return factored;
};

export const prepend = (α: string, M: SuffixSet): SuffixSet => (
  setMap(M, s => `${α}${s}`)
);

export const repeatString = (α: string, n: number): string => {
  if (n < 1) return ε;
  let seq = α;

  while (2 * seq.length <= n) {
    seq += seq;
  }

  seq += seq.slice(0, n - seq.length);

  return seq;
};

export const closure = (M: SuffixSet, arities: Map<Symb, number>): Closure => {
  if ((M.size === 1 && M.has(ε)) || isEmpty(M)) return M;

  const Mα = (α: string): SuffixSet => {
    const M_α = factorOut(α, M);
    if (α === ω) return M_α;
    if (isEmpty(M_α)) return new Set<string>();
    const arity = arities.get(α);
    return unionMut(M_α, prepend(repeatString(ω, arity), factorOut(ω, M)));
  };

  const M_ = new Set<string>();

  for (const α of join(arities.keys(), once(ω))) {
    unionMut(M_, prepend(α, closure(Mα(α), arities)));
  }

  return M_;
};

export const stringify = (t: Maybe<Term>): string => {
  if (isNothing(t)) return "";
  if (isVar(t)) return ω;
  return `${t.name}${t.args.map(s => stringify(s)).join("")}`;
};

export const collectArities = (terms: Maybe<Term>[]): Arities => {
  const arities = new Map<Symb, number>();

  for (const t of terms) {
    if (t) {
      collectArity(t, arities);
    }
  }

  return arities;
};

export const collectTermSymbols = (t: Term, symbols: Set<Symb>): void => {
  if (isFun(t)) {
    symbols.add(t.name);
    t.args.forEach(s => collectTermSymbols(s, symbols));
  }
};

export const collectSymbols = (terms: Maybe<Term>[]): Set<Symb> => {
  const symbols = new Set<Symb>();

  for (const t of terms) {
    if (t) {
      collectTermSymbols(t, symbols);
    }
  }

  return symbols;
};

export function genSymbolSplitter(
  symbols: string[],
): (str: string) => Maybe<string[]> {
  const maxLen = Math.max(...symbols.map(l => l.length));
  const alphabetSet = new Set(symbols);

  return (str: string): string[] => {
    const letters: string[] = [];
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

      if (!found) return;
    }

    return letters;
  };
}

const replaceVars = (t: Term): Term => {
  if (isVar(t)) return ω;
  return fun(t.name, ...t.args.map(s => replaceVars(s)));
};

export const termToNames = (term: Term): string[] => {
  return [...traverseNames(term)];
};

export const makePatterns = (...patterns: string[]): Fun[] => {
  return patterns
    .map(s => parseTerm(s))
    .filter(t => isSomething(t) && isFun(t))
    .map(replaceVars) as Fun[];
};

export const symbs = (term: string): string[] => {
  const [t] = makePatterns(term);
  return termToNames(t);
};

export const unstringify = (
  str: string,
  splitter: (str: string) => Maybe<string[]>,
  arities: Arities,
): Maybe<Term> => {
  if (str === ω) return ω;
  const symbols = splitter(str);
  if (isSomething(symbols)) {
    return unstringifyAux(symbols, arities);
  }
};

const unstringifyAux = (
  symbols: string[],
  arities: Arities,
): Maybe<Term> => {
  if (isEmpty(symbols)) return;

  const stack: Term[] = [];

  for (const f of reverse(symbols)) {
    if (f === ω) {
      stack.push(ω);
    } else {
      const ar = arities.get(f) ?? 0;
      const subterm = fun(f, ...pop(stack, ar).filter(isSomething));
      stack.push(subterm);
    }
  }

  return stack[0];
};

export type RuleMatcher = (query: Term) => Maybe<Rule[]>;

export const buildMatcher = (trs: TRS): RuleMatcher => {
  const rules = [...trs.values()].flat();
  const patterns = rules.map(lhs);
  const patternsStr = patterns.map(stringify);
  const M = new Set(patternsStr);
  const arities = collectArities(patterns);
  const M_ = closure(M, arities);

  const matcher = new StringClosureMatcher<Rule[]>();
  const symbols = [...arities.keys(), ω];
  const splitSymbols = genSymbolSplitter(symbols);

  for (const pat_ of M_) {
    const letters = splitSymbols(pat_);
    if (letters) {
      const pat = unstringify(pat_, splitSymbols, arities);
      if (isNothing(pat)) continue;
      const P_s = [];
      for (const [pattern, rule] of zip(patterns, rules)) {
        if (matches(pat, pattern)) {
          P_s.push(rule);
        }
      }

      matcher.insert(letters, P_s);
    }
  }

  return (query: Term): Maybe<Rule[]> => {
    return matcher.lookupTerm(query, arities);
  };
};
