import { Externals, Rule, Targets, TRS, Var } from "../../Parser/Types";
import { Translator } from "../../Translator/Translator";
import { DecisionTree } from "./DecisionTree";
export declare abstract class DecisionTreeTranslator<Target extends Targets, Exts extends string> extends Translator<Target, Exts> {
    private arities;
    private signature;
    constructor(trs: TRS, externals: Externals<Target, Exts>);
    abstract translateDecisionTree(name: string, dt: DecisionTree, varNames: Var[]): string;
    translateRules(name: string, rules: Rule[]): string;
}
