import { DecisionTree } from "../Compiler/DecisionTrees/DecisionTree";
import { DecisionTreeTranslator } from "../Compiler/DecisionTrees/DecisionTreeTranslator";
import { Externals, Term, TRS } from "../Parser/Types";
export declare class JSTranslator<Exts extends string> extends DecisionTreeTranslator<'js', Exts> {
    constructor(trs: TRS, externals: Externals<'js', Exts>);
    protected init(): void;
    private callTerm;
    translateDecisionTree(name: string, dt: DecisionTree, varNames: string[]): string;
    rename(name: string): string;
    translateTerm(term: Term): string;
}
