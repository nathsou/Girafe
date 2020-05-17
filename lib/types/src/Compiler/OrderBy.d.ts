import { Rule, Term } from "../Parser/Types";
import { CompilerPass } from "./CompilerPass";
export declare type TotalOrder = (s: Term, t: Term) => boolean;
export declare const ruleOrder: (order: TotalOrder, rule1: Rule, rule2: Rule) => number;
export declare const orderBy: (order: TotalOrder) => CompilerPass;
export declare const lessSpecific: TotalOrder;
export declare const orderBySpecificity: CompilerPass;
