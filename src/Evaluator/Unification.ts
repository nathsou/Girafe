import { compile } from "../Compiler/Passes/CompilerPass";
import { defaultPasses, isSomething, isVar, Maybe, substitute } from "../Compiler/Utils";
import { isParserError, parse, parseTerm } from "../Parser/Parser";
import { FileReader, handleImports, ImportInfos } from "../Parser/Preprocessor/Import";
import { removeComments } from "../Parser/Preprocessor/RemoveComments";
import { Fun, JSExternals, mapHas, Term, TRS } from "../Parser/Types";
import { mapMut } from "../Parser/Utils";
import { isError, Right_, unwrap } from "../Types";
import { TermMatcher } from "./Matchers/TermMatcher/TermMatcher";
import { ruleBasedUnify } from "./RuleBasedUnify";
import { Unificator } from "./Unificator";

export const match: Unificator = ruleBasedUnify;
export const matches = (s: Term, t: Term): boolean => isSomething(match(s, t));

function logErrors<E = string>(errors: Right_<E[]>): void {
  for (const err of unwrap(errors)) {
    if (isParserError(err)) {
      console.error(
        `[Parser error on line ${err.originalLine}]: \n${err.message}`,
      );
    } else {
      console.error(err);
    }
  }
}

export async function compileRules(
  src: string,
  passes = defaultPasses,
  fileReader: FileReader,
): Promise<Maybe<TRS>> {
  const rules = await parse<ImportInfos>(
    src,
    removeComments,
    handleImports(fileReader),
    // log
  );

  if (isError(rules)) {
    logErrors(rules);
    return;
  }

  const trs = compile(unwrap(rules).trs, ...passes);

  if (isError(trs)) {
    logErrors(trs);
    return;
  }

  return unwrap(trs);
}

export const oneStepReduce = (
  term: Fun,
  externals: JSExternals<string> = {},
  matcher: TermMatcher,
): { term: Term; changed: boolean } => {
  // externals
  if (term.name.charAt(0) === "@") {
    const f = term.name.substr(1);
    if (mapHas(externals, f)) {
      const newTerm = externals[f](term);
      return { term: newTerm, changed: newTerm !== term };
    } else {
      throw new Error(`Unknown external function: "${f}"`);
    }
  }

  const rules = matcher.lookup(term);

  if (rules) {
    for (const [lhs, rhs] of rules) {
      const sigma = match(term, lhs);
      if (sigma) {
        return { term: substitute(rhs, sigma), changed: true };
      }
    }
  }

  return { term, changed: false };
};

export const reduce = (
  term: Term,
  externals: JSExternals<string> = {},
  matcher: TermMatcher,
): Term => {
  if (isVar(term)) return term;
  let reduced: { term: Term; changed: boolean } = { term, changed: true };

  while (reduced.changed) {
    if (isVar(reduced.term)) return reduced.term;
    mapMut(reduced.term.args, (s) => reduce(s, externals, matcher));
    reduced = oneStepReduce(reduced.term, externals, matcher);
  }

  return reduced.term;
};

export const parseTRS = parseTerm;
