import { collectTRSArities } from "../../Compiler/Passes/Lazify";
import { Externals, Fun, Rule, Substitution, Symb, Targets, Term, TRS, Var } from "../../Parser/Types";
import { indexed } from "../../Parser/Utils";
import { Translator } from "../../Translator/Translator";
import { Arities } from "../Passes/Lazify";
import { fst, genVars, isVar, ruleArity, substitute } from "../Utils";
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

    abstract accessSubterm(parent: string, childIndex: number): string;

    translateRules(name: string, rules: Rule[]): string {

        const renameVars = (t: Term, sigma: Substitution, i = 0, j = 0, parent?: string): void => {
            const name = parent ? this.accessSubterm(parent, j) : `v${(i + 1)}`;
            if (isVar(t)) {
                sigma[t] = name;
                return;
            }

            t.args.forEach((s, idx) => {
                renameVars(s, sigma, i + idx, idx, name);
            });
        };

        const newVars: Var[] = genVars(ruleArity(fst(rules)));

        const rules_: Rule[] = rules.map(([lhs, rhs]) => {
            const sigma: Substitution = {};

            for (const [t, i] of indexed(lhs.args)) {
                renameVars(t, sigma, i);
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