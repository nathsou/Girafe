import { arity, fun, genVars, hasMostGeneralRule, isVar, substitute, unusedRuleVars, vars, zip } from "../Compiler/Utils";
import { Fun, Rule, Substitution, Symb, Term } from "../Parser/Types";
import { SpecialCharacters, Translator } from "./Translator";

export class OCamlTranslator<Exts extends string>
    extends Translator<'ocaml', Exts> {

    private firstRule = true;

    protected init() {
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

    rename(name: Symb): Symb {
        const symbolMap: { [key in SpecialCharacters]: string } = {
            '.': '_dot_',
            '-': '_minus_',
            '~': '_tilde_',
            '+': '_plus_',
            '*': '_star_',
            '&': '_ampersand_',
            '|': '_pipe_',
            '/': '_slash_',
            '\\': '_backslash_',
            '^': '_caret_',
            '%': '_percent_',
            '°': '_num_',
            '$': '_dollar_',
            '@': '_at_',
            '#': '_hash_',
            ';': '_semicolon_',
            ':': '_colon_',
            '_': '_',
            '=': '_eq_',
            "'": '_prime_',
            ">": '_gtr_',
            "<": '_lss_'
        };

        const noSymbols = name
            .split('')
            .map(c => symbolMap[c] ?? c)
            .join('');

        return `grf_${noSymbols}`;
    }

    translateTerm(term: Term): string {
        if (isVar(term)) return term;
        return `(Fun ("${term.name}", [${
            term.args.map((t) => this.translateTerm(t)).join("; ")
            }]))`;
    }

    private callTerm(term: Term): string {
        if (isVar(term)) return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(
                fun(term.name, ...term.args.map(t => this.callTerm(t)))
            );
        }

        const args = `${term.args.map((t) => this.callTerm(t)).join(" ")}`;
        return `(${term.name} ${args})`;
    }

    translateRules(name: string, rules: Rule[]): string {
        const newVars = genVars(arity(rules));
        const res: string[] = [
            `${this.firstRule ? 'let rec' : 'and'} ${name} ${newVars.join(' ')} =
                match ${newVars.join(', ')} with
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

            const args = `${lhs.args.map(t => this.translateTerm(t)).join(', ')}`;
            res.push(`| ${args} -> ${this.callTerm(rhs)}`.trim());
        }

        if (!hasMostGeneralRule(rules)) {
            res.push(`| _ -> ${this.translateTerm(fun(name, ...newVars))}`);
        }

        return res.join("\n");
    }
}
