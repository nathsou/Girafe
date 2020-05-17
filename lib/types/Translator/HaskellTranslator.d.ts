import { Externals, Rule, Symb, Term, TRS } from "../Parser/Types";
import { Translator } from "./Translator";
export declare class HaskellTranslator<Exts extends string> extends Translator<"haskell", Exts> {
    constructor(trs: TRS, externals: Externals<"haskell", Exts>);
    rename(name: Symb): Symb;
    translateTerm(term: Term): string;
    private callTerm;
    translateRules(name: string, rules: Rule[]): string;
}
