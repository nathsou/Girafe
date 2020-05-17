import { Unificator } from "../Evaluator/Unificator";
import { Substitution, Term } from "../Parser/Types";
import { Maybe } from "./Utils";
export declare type Matcher = (term: Term, unificator: Unificator) => Maybe<Substitution>;
