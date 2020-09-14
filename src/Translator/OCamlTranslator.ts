import { arity, fun, genVars, hasMostGeneralRule, isVar, substitute, unusedRuleVars, zip } from "../Compiler/Utils";
import { Fun, Rule, Substitution, Term } from "../Parser/Types";
import { isNat, Translator, nullaryVarName } from "./Translator";

const nat = (n: string) => `(Nat ${n})`;

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
            "type term = Var of string | Fun of string * term list | Nat of int;;",

            "let funOf name args = Fun (name, args);;",
            "let varOf name = Var (name);;",
        ];
    }

    translateTerm(term: Term, useNullaryVars = false): string {
        if (isVar(term)) return this.renameVar(term);
        if (isNat(term.name)) return nat(term.name);
        if (useNullaryVars && term.args.length === 0 && this.nullaries.has(term.name)) {
            return nullaryVarName(term.name);
        }

        return `(Fun("${term.name}", [${term.args.map(t => this.translateTerm(t)).join("; ")
            }]))`;
    }

    public callTerm(term: Term): string {
        if (isVar(term)) return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(
                fun(term.name, ...term.args.map(t => this.callTerm(t)))
            );
        }

        const args = `(${term.args.map(t => this.callTerm(t)).join(', ')})`;
        return `(${term.name} ${args})`;
    }

    protected declareNullary(varName: string, symb: string): string {
        return `let ${varName} = Fun("${symb}", []);; `;
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
            res.push(`| ${args} -> ${this.callTerm(rhs)} `.trim());
        }

        if (!hasMostGeneralRule(rules)) {
            res.push(`| _ -> ${this.translateTerm(fun(name, ...newVars), true)} `);
        }

        return res.join("\n");
    }
}
