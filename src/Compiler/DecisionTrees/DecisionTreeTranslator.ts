import { collectTRSArities } from "../../Compiler/Passes/Lazify";
import { Fun, Rule, Substitution, Symb, Term, TRS, Var } from "../../Parser/Types";
import { indexed } from "../../Parser/Utils";
import { SourceCode, Translator } from "../../Translator/Translator";
import { Arities } from "../Passes/Lazify";
import { arity, genVars, isVar, substitute } from "../Utils";
import { DecisionTree } from "./DecisionTree";
import { clauseMatrixOf, compileClauseMatrix } from "./DecisionTreeCompiler";
import { Externals, Targets } from "../../Externals/Externals";

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

    abstract translateDecisionTree(name: string, dt: DecisionTree, varNames: Var[]): SourceCode;

    abstract accessSubterm(parent: string, childIndex: number): SourceCode;

    protected collectVarNames(
        t: Term,
        sigma: Substitution,
        newVars: Var[],
        offset = 0,
        depth = 0,
        parent?: string
    ): void {
        const name = parent ? this.accessSubterm(parent, depth) : newVars[offset];
        if (isVar(t)) {
            sigma[t] = name;
            return;
        }

        t.args.forEach((s, idx) => {
            this.collectVarNames(s, sigma, newVars, offset + idx, idx, name);
        });
    }

    // Rules are compiled to decision trees and then translated to source code
    public translateRules(name: string, rules: Rule[]): SourceCode {
        const newVars: Var[] = genVars(arity(rules));
        const rules_: Rule[] = rules.map(([lhs, rhs]) => {
            const sigma: Substitution = {};
            for (const [t, i] of indexed(lhs.args)) {
                this.collectVarNames(t, sigma, newVars, i);
            }

            return [
                substitute(lhs, sigma) as Fun,
                substitute(rhs, sigma)
            ];
        });

        const m = clauseMatrixOf(rules_);
        const dt = compileClauseMatrix(
            arity(rules),
            m,
            this.signature
        );

        return this.translateDecisionTree(name, dt, newVars);
    }

}