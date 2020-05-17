import { Symb, Term } from "../../Parser/Types";
import { AnyPat, Occcurence } from "./DecisionTreeCompiler";
export declare type Leaf = {
    type: 'leaf';
    action: Term;
};
export declare type Fail = {
    type: 'fail';
};
export declare type Switch = {
    type: 'switch';
    occurence: Occcurence;
    tests: Array<[(Symb | AnyPat), DecisionTree]>;
};
export declare type DecisionTree = Leaf | Fail | Switch;
export declare const makeLeaf: (action: Term) => Leaf;
export declare const makeFail: () => Fail;
export declare const makeSwitch: (occurence: Occcurence, tests: Switch['tests']) => Switch;
export declare const showDecisionTree: (tree: DecisionTree) => string;
