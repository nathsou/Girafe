import { Unificator } from "../Unificator";
import { Substitution, Term } from "../../Parser/Types";
import { Maybe } from "../../Compiler/Utils";

export type Matcher = (term: Term, unificator: Unificator) => Maybe<Substitution>;