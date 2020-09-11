import { buildFueledNormalizer, StepNormalizer } from "../../Normalizer/Normalizer";
import { ruleBasedUnify } from "../../Normalizer/RuleBasedUnify";
import { undirectedUnify } from "../../Normalizer/UndirectedUnify";
import { Rule, Symb, Term, TRS } from "../../Parser/Types";
import { Ok } from "../../Types";
import { hasDuplicates, isSomething, isVar, mapify, Maybe, rules, substitute, vars } from "../Utils";
import { CompilationResult, CompilerPass } from "./CompilerPass";

// requires 'uniqueVarNames' to be used before running this pass
export const normalizeRhs: (
    maxSteps: number,
    allowDuplication?: boolean,
    exceptions?: Set<Symb>
) => CompilerPass = (steps, allowDuplication = false, exceptions = new Set()) => {

    return (trs: TRS): CompilationResult => {
        const newRules: Rule[] = [];

        const stepNorm: StepNormalizer = {
            oneStepReduce: (q: Term): Maybe<Term> => {
                if (isVar(q)) return q;
                if (q.name.startsWith('@') || exceptions.has(q.name)) {
                    return q;
                }

                if (!trs.has(q.name)) return;
                const matchingRules = trs.get(q.name)
                    .filter(([lhs, _]) => isSomething(undirectedUnify(lhs, q)));


                // only normalize if there's exactly one rule that can possibly match
                if (matchingRules.length === 1) {
                    const [lhs, rhs] = matchingRules[0];

                    if (allowDuplication || !hasDuplicates(vars(rhs))) {
                        const sigma = ruleBasedUnify(lhs, q);
                        if (sigma) {
                            const s = substitute(rhs, sigma);
                            return s;
                        }
                    }
                }

                return q;
            }
        };

        const norm = buildFueledNormalizer(stepNorm, steps, {}, false);

        for (const [lhs, rhs] of rules(trs)) {
            newRules.push([lhs, norm(rhs)]);
        }

        return Ok(mapify(newRules));
    };
};