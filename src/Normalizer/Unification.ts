import { compile } from "../Compiler/Passes/CompilerPass";
import { defaultPasses, isSomething, Maybe, rhs, substitute } from "../Compiler/Utils";
import { parse } from "../Parser/Parser";
import { FileReader, handleImports, ImportInfos } from "../Parser/Preprocessor/Import";
import { consLists } from "../Parser/Preprocessor/Lists";
import { removeComments } from "../Parser/Preprocessor/RemoveComments";
import { convertStrings } from "../Parser/Preprocessor/Strings";
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
  passes = defaultPasses,
  fileReader: FileReader,
): Promise<Maybe<TRS>> {
  const rules = await parse<ImportInfos>(
    src,
    removeComments,
    handleImports(fileReader),
    convertStrings,
    consLists,
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

export const oneStepReducer = (matcher: Matcher) => (term: Fun): Maybe<Term> => {
  const matched = matcher(term, match);
  if (matched) {
    return substitute(rhs(matched.rule), matched.sigma);
  }
};

export const unificationNormalizer = (matcher: Matcher): StepNormalizer => ({
  oneStepReduce: oneStepReducer(matcher)
});

// export const reduce = (
//   term: Term,
//   externals: JSExternals<string> = {},
//   matcher: Matcher,
// ): Term => {
//   if (isVar(term)) return term;
//   let reduced: { term: Term; changed: boolean } = { term, changed: true };

//   while (reduced.changed) {
//     if (isVar(reduced.term)) return reduced.term;
//     mapMut(reduced.term.args, (s) => reduce(s, externals, matcher));
//     reduced = oneStepReduce(reduced.term, externals, matcher);
//   }

//   return reduced.term;
// };
