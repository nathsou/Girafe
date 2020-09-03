import { arity, fun, genVars, hasMostGeneralRule, isVar, substitute, unusedRuleVars, zip } from "../Compiler/Utils";
import { Fun, Rule, Substitution, Term } from "../Parser/Types";
import { Translator } from "./Translator";

export class OCamlTranslator<Exts extends string>
    extends Translator<'ocaml', Exts> {

    private static reservedKeywords = new Set<string>([
        'and', 'as', 'assert', 'asr', 'begin', 'class', 'constrain', 'do', 'done', 'downto', 'else',
        'end', 'exception', 'external', 'false', 'for', 'fun', 'function', 'functor', 'if',
        'in', 'include', 'inherit', 'initializer', 'land', 'lazy', 'let', 'lor',
        'lsl', 'lsr', 'lxor', 'match', 'method', 'mod', 'module', 'mutable', 'new', 'nonrec',
        'object', 'of', 'open', 'or', 'private', 'rec', 'sig', 'struct', 'then', 'to', 'true',
        'try', 'type', 'val', 'virtual', 'when', 'while', 'with'
    ]);

    private firstRule = true;

    protected init(): void {
        this.setReservedKeywords(OCamlTranslator.reservedKeywords);
        this.header = [
            "type term = Var of string | Fun of string * term list;;",

            "let funOf name args = Fun (name, args);;",
            "let varOf name = Var (name);;",

            `let rec show_term t =
                match t with
                | Var x -> x
                | Fun (f, []) -> f
                | Fun (f, ts) -> f ^ "(" ^ (String.concat ", " (List.map show_term ts)) ^ ")";;
        `,
        ];
    }

    translateTerm(term: Term): string {
        if (isVar(term)) return this.renameVar(term);
        return `(Fun ("${term.name}", [${
            term.args.map(t => this.translateTerm(t)).join("; ")
            }]))`;
    }

    private callTerm(term: Term): string {
        if (isVar(term)) return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(
                fun(term.name, ...term.args.map(t => this.callTerm(t)))
            );
        }

        const args = `(${term.args.map(t => this.callTerm(t)).join(', ')})`;
        return `(${term.name} ${args})`;
    }

    translateRules(name: string, rules: Rule[]): string {
        const newVars = genVars(arity(rules)).map(v => `${v}_${name}`);
        const args = `(${newVars.join(', ')})`;

        // make all functions mutually recursive
        const res: string[] = [
            `${this.firstRule ? 'let rec' : 'and'} ${name} ${args} =
                match ${args} with
            `.trim()
        ];

        this.firstRule = false;

        for (const [lhs_, rhs_] of rules) {
            const sigma: Substitution = {};
            const unusedVars = unusedRuleVars([lhs_, rhs_]);

            for (const [a, b] of zip(lhs_.args, newVars)) {
                if (isVar(a)) {
                    sigma[a] = unusedVars.has(a) ? '_' : b;
                }
            }

            const [lhs, rhs] = [
                substitute(lhs_, sigma) as Fun,
                substitute(rhs_, sigma)
            ];

            const args = `(${lhs.args.map(t => this.translateTerm(t)).join(', ')})`;
            res.push(`| ${args} -> ${this.callTerm(rhs)}`.trim());
        }

        if (!hasMostGeneralRule(rules)) {
            res.push(`| _ -> ${this.translateTerm(fun(name, ...newVars))}`);
        }

        return res.join("\n");
    }
}
