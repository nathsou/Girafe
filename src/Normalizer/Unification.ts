import { compile, CompilerPass } from "../Compiler/Passes/CompilerPass";
import { isSomething, Maybe, rhs, substitute } from "../Compiler/Utils";
import { parse } from "../Parser/Parser";
import { removeComments } from "../Parser/Preprocessor/RemoveComments";
import { Fun, Term, TRS } from "../Parser/Types";
import { isError, Right_, unwrap } from "../Types";
import { Matcher } from "./Matchers/Matcher";
import { StepNormalizer } from "./Normalizer";
import { ruleBasedUnify } from "./RuleBasedUnify";
import { Unificator } from "./Unificator";

export const match: Unificator = (s, t) => ruleBasedUnify(t, s);
export const matches = (s: Term, t: Term): boolean => isSomething(match(s, t));

function logErrors<E = string>(errors: Right_<E[]>): void {
  for (const err of unwrap(errors)) {
    console.error(err);
  }
}

export async function compileRules(
  src: string,
  passes: CompilerPass[]
): Promise<Maybe<TRS>> {
  const rules = await parse(
    src,
    removeComments
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

export const oneStepReducer = (matcher: Matcher) => (term: Fun): Maybe<Term> => {
  const matched = matcher(term, match);
  if (matched) {
    return substitute(rhs(matched.rule), matched.sigma);
  }
};

export const unificationNormalizer = (matcher: Matcher): StepNormalizer => ({
  oneStepReduce: oneStepReducer(matcher)
});