import { Term, Substitution } from "../Parser/Types";
import { Maybe } from "../Compiler/Utils";
export declare type Unificator = (s: Term, t: Term) => Maybe<Substitution>;
