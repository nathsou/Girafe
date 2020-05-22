import { DecisionTree, evaluate } from "../../Compiler/DecisionTrees/DecisionTree";
import { clauseMatrixOf, compileClauseMatrix } from "../../Compiler/DecisionTrees/DecisionTreeCompiler";
import { collectTRSArities } from "../../Compiler/Passes/Lazify";
import { arity, genVars, isVar, Maybe, zip } from "../../Compiler/Utils";
import { Substitution, Symb, Term, TRS } from "../../Parser/Types";

export class DecisionTreeMatcher {

    private rules: Map<Symb, DecisionTree>;

    constructor(trs: TRS) {
        this.rules = new Map();
        const sig = new Set(...collectTRSArities(trs).keys());

        for (const [name, rules] of trs) {
            const m = clauseMatrixOf(rules);
            const varNames = genVars(arity(rules));

            const dt = compileClauseMatrix(
                varNames,
                m,
                sig
            );

            this.rules.set(name, dt);
        }
    }

    public match(term: Term): Maybe<Term> {
        if (isVar(term)) return;
        const dt = this.rules.get(term.name);
        const subst: Substitution = {};
        for (const [v, t] of zip(genVars(term.args.length), term.args)) {
            subst[v] = t;
        }

        return evaluate(subst, dt);
    }


}