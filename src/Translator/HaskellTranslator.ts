import { arity, fun, genVars, hasMostGeneralRule, isVar } from "../Compiler/Utils";
import { Externals } from "../Externals/Externals";
import { Rule, Term, TRS } from "../Parser/Types";
import { Translator } from "./Translator";

export class HaskellTranslator<Exts extends string>
	extends Translator<'haskell', Exts> {

	private static reservedKeywords = new Set<string>([
		'case', 'class', 'data', 'deriving', 'do', 'else', 'if',
		'import', 'in', 'infix', 'infixl', 'infixr', 'instance',
		'let', 'of', 'module', 'newtype', 'then', 'type', 'where'
	]);

	constructor(trs: TRS, externals: Externals<'haskell', Exts>) {
		super(trs, externals, HaskellTranslator.reservedKeywords);

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

	translateTerm(term: Term): string {
		if (isVar(term)) return this.renameVar(term);
		return `(Fun "${term.name}" [${
			term.args.map(t => this.translateTerm(t)).join(", ")
			}])`;
	}

	private callTerm(term: Term): string {
		if (isVar(term)) return term;
		if (!this.isDefined(term.name)) {
			return this.translateTerm(
				fun(term.name, ...term.args.map(t => this.callTerm(t)))
			);
		}

		const args = `${term.args.map(t => this.callTerm(t)).join(' ')}`;
		return `(${term.name} ${args})`;
	}

	translateRules(name: string, rules: Rule[]): string {
		const res: string[] = [];
		for (const [lhs, rhs] of rules) {
			const args = `${lhs.args.map(t => this.translateTerm(t)).join(' ')}`;
			res.push(`${name} ${args} = ${this.callTerm(rhs)}`);
		}

		if (!hasMostGeneralRule(rules)) {
			const args = genVars(arity(rules));
			res.push(`${name} ${args.join(' ')} = ${this.translateTerm(fun(name, ...args))}`);
		}

		return res.join('\n');
	}
}