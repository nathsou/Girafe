import { DecisionTree, evaluate } from "../Compiler/DecisionTrees/DecisionTree";
import { clauseMatrixOf, compileClauseMatrix } from "../Compiler/DecisionTrees/DecisionTreeCompiler";
import { collectTRSArities } from "../Compiler/Passes/Lazify";
import { arity, isVar, Maybe } from "../Compiler/Utils";
import { Symb, Term, TRS } from "../Parser/Types";
import { buildNormalizer, Normalizer, StepNormalizer, buildFueledNormalizer } from "./Normalizer";
import { NativeExternals } from "../Externals/Externals";

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
        externals: NativeExternals<Exts>
    ): Normalizer {
        return buildNormalizer(this, externals);
    }

    public asFueledNormalizer<Exts extends string>(
        maxSteps: number,
        externals: NativeExternals<Exts>
    ): Normalizer {
        return buildFueledNormalizer(this, maxSteps, externals);
    }

}