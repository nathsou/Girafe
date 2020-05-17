import { Externals, Rule, Symb, Targets, Term, TRS } from "../Parser/Types";
export declare type SpecialCharacters = "." | "-" | "~" | "+" | "*" | "&" | "|" | "/" | "\\" | "^" | "%" | "°" | "$" | "@" | "#" | ";" | ":" | "_" | "=" | "'" | ">" | "<";
export declare abstract class Translator<Target extends Targets, Exts extends string> {
    protected header: string[];
    protected externals: Externals<Target, Exts>;
    protected trs: TRS;
    protected definedSymbols: Set<Symb>;
    constructor(trs: TRS, externals: Externals<Target, Exts>);
    protected init(): void;
    abstract rename(name: Symb): Symb;
    abstract translateTerm(term: Term): string;
    abstract translateRules(name: string, rules: Rule[]): string;
    protected isDefined(f: Symb): boolean;
    private renameTerm;
    private renameFun;
    private renameRule;
    private generateExternals;
    private generateRules;
    translate(): string;
}
