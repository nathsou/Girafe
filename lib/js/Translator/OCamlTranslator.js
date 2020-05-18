"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCamlTranslator = void 0;
const Utils_1 = require("../Compiler/Utils");
const Translator_1 = require("./Translator");
class OCamlTranslator extends Translator_1.Translator {
    constructor() {
        super(...arguments);
        this.firstRule = true;
    }
    init() {
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
    rename(name) {
        const symbolMap = {
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
            .map(c => { var _a; return (_a = symbolMap[c]) !== null && _a !== void 0 ? _a : c; })
            .join('');
        return `grf_${noSymbols}`;
    }
    translateTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        return `(Fun ("${term.name}", [${term.args.map((t) => this.translateTerm(t)).join("; ")}]))`;
    }
    callTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(Utils_1.fun(term.name, ...term.args.map(t => this.callTerm(t))));
        }
        const args = `(${term.args.map((t) => this.callTerm(t)).join(', ')})`;
        return `(${term.name} ${args})`;
    }
    translateRules(name, rules) {
        const newVars = Utils_1.genVars(Utils_1.arity(rules));
        const args = `(${newVars.join(', ')})`;
        const res = [
            `${this.firstRule ? 'let rec' : 'and'} ${name} ${args} =
                match (${newVars.join(', ')}) with
            `.trim()
        ];
        this.firstRule = false;
        for (const [lhs_, rhs_] of rules) {
            const sigma = {};
            const unusedVars = Utils_1.unusedRuleVars([lhs_, rhs_]);
            for (const [a, b] of Utils_1.zip(lhs_.args, newVars)) {
                if (Utils_1.isVar(a)) {
                    sigma[a] = unusedVars.has(a) ? '_' : b;
                }
            }
            const [lhs, rhs] = [
                Utils_1.substitute(lhs_, sigma),
                Utils_1.substitute(rhs_, sigma)
            ];
            const args = `(${lhs.args.map(t => this.translateTerm(t)).join(', ')})`;
            res.push(`| ${args} -> ${this.callTerm(rhs)}`.trim());
        }
        if (!Utils_1.hasMostGeneralRule(rules)) {
            res.push(`| _ -> ${this.translateTerm(Utils_1.fun(name, ...newVars))}`);
        }
        return res.join("\n");
    }
}
exports.OCamlTranslator = OCamlTranslator;
