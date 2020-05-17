import { Rule, Symb, Term } from "../Parser/Types";
import { Translator } from "./Translator";
export declare class OCamlTranslator<Exts extends string> extends Translator<'ocaml', Exts> {
    private firstRule;
    protected init(): void;
    rename(name: Symb): Symb;
    translateTerm(term: Term): string;
    private callTerm;
    translateRules(name: string, rules: Rule[]): string;
}
