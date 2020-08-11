import { DecisionTree, evaluate } from "../Compiler/DecisionTrees/DecisionTree";
import { clauseMatrixOf, compileClauseMatrix } from "../Compiler/DecisionTrees/DecisionTreeCompiler";
import { collectTRSArities } from "../Compiler/Passes/Lazify";
import { arity, isVar, Maybe } from "../Compiler/Utils";
import { JSExternals, Symb, Term, TRS } from "../Parser/Types";
import { buildNormalizer, Normalizer, StepNormalizer } from "./Normalizer";

export class DecisionTreeNormalizer implements StepNormalizer {
    private rules: Map<Symb, DecisionTree>;

    constructor(trs: TRS) {
        this.rules = new Map();
        const sig = new Set(collectTRSArities(trs).keys());

        // Compile each rule into its own decision tree
        for (const [name, rules] of trs) {
            const m = clauseMatrixOf(rules);
            const dt = compileClauseMatrix(arity(rules), m, sig);
            this.rules.set(name, dt);
        }
    }

    public oneStepReduce(term: Term): Maybe<Term> {
        if (isVar(term)) return term;
        const dt = this.rules.get(term.name);

        if (dt) {
            return evaluate(term.args, dt);
        }
    }

    public asNormalizer<Exts extends string>(
        externals: JSExternals<Exts>
    ): Normalizer {
        return buildNormalizer(this, externals);
    }

}