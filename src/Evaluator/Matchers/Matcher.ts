import { Unificator } from "../Unificator";
import { Substitution, Term, Rule } from "../../Parser/Types";
import { Maybe } from "../../Compiler/Utils";

export type Matcher = (term: Term, unificator: Unificator) => Maybe<{ sigma: Substitution, rule: Rule }>;