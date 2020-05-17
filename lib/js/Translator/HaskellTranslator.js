"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HaskellTranslator = void 0;
const Utils_1 = require("../Compiler/Utils");
const Translator_1 = require("./Translator");
class HaskellTranslator extends Translator_1.Translator {
    constructor(trs, externals) {
        super(trs, externals);
        this.header = [
            "import Data.List (intercalate, map)",
            "data Term = Var String | Fun String [Term]",
            `instance Show Term where
            show (Var x) = x
            show (Fun f []) = f
            show (Fun f ts) = f ++ "(" ++ (intercalate ", " (map show ts)) ++ ")"
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
        return `(Fun "${term.name}" [${term.args.map((t) => this.translateTerm(t)).join(", ")}])`;
    }
    callTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(Utils_1.fun(term.name, ...term.args.map(t => this.callTerm(t))));
        }
        const args = `${term.args.map((t) => this.callTerm(t)).join(" ")}`;
        return `(${term.name} ${args})`;
    }
    translateRules(name, rules) {
        const res = [];
        for (const [lhs, rhs] of rules) {
            const args = `${lhs.args.map((t) => this.translateTerm(t)).join(" ")}`;
            res.push(`${name} ${args} = ${this.callTerm(rhs)}`);
        }
        return res.join("\n");
    }
}
exports.HaskellTranslator = HaskellTranslator;
