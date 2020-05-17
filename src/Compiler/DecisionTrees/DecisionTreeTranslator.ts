import { collectTRSArities } from "../../Compiler/Passes/Lazify";
import { Externals, Fun, Rule, Substitution, Symb, Targets, TRS, Var } from "../../Parser/Types";
import { Translator } from "../../Translator/Translator";
import { Arities } from "../Passes/Lazify";
import { fst, genVars, isVar, ruleArity, substitute, unusedRuleVars, zip } from "../Utils";
import { DecisionTree } from "./DecisionTree";
import { clauseMatrixOf, compileClauseMatrix, occurencesOf } from "./DecisionTreeCompiler";

export abstract class DecisionTreeTranslator<Target extends Targets, Exts extends string>
    extends Translator<Target, Exts> {

    private arities: Arities;
    private signature: Set<Symb>;

    constructor(
        trs: TRS,
        externals: Externals<Target, Exts>
    ) {
        super(trs, externals);

        this.arities = collectTRSArities(trs);
        this.signature = new Set(this.arities.keys());
    }

    abstract translateDecisionTree(name: string, dt: DecisionTree, varNames: Var[]): string;

    translateRules(name: string, rules: Rule[]): string {
        const newVars: Var[] = genVars(ruleArity(fst(rules)));

        const rules_: Rule[] = rules.map(([lhs, rhs]) => {
            const sigma: Substitution = {};
            const unusedVars = unusedRuleVars([lhs, rhs]);

            for (const [a, b] of zip(lhs.args, newVars)) {
                if (isVar(a)) {
                    sigma[a] = unusedVars.has(a) ? `_${b}` : b;
                }
            }

            return [
                substitute(lhs, sigma) as Fun,
                substitute(rhs, sigma)
            ];
        });

        const m = clauseMatrixOf(rules_);
        const occs = occurencesOf(...newVars);
        const dt = compileClauseMatrix(
            occs,
            m,
            this.signature
        );

        return this.translateDecisionTree(name, dt, newVars);
    }

}