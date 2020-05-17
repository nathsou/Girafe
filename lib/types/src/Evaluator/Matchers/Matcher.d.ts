import { Unificator } from "../Unificator";
import { Substitution, Term } from "../../Parser/Types";
import { Maybe } from "../../Compiler/Utils";
export declare type Matcher = (term: Term, unificator: Unificator) => Maybe<Substitution>;
