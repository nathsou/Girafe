import { arity, fun, genVars, hasMostGeneralRule, isVar } from "../Compiler/Utils";
import { Rule, Term } from "../Parser/Types";
import { isNat, nullaryVarName, Translator } from "./Translator";

const nat = (n: string) => `(Nat ${n})`;

export class HaskellTranslator<Exts extends string>
	extends Translator<'haskell', Exts> {

	private static reservedKeywords = new Set<string>([
		'case', 'class', 'data', 'deriving', 'do', 'else', 'if',
		'import', 'in', 'infix', 'infixl', 'infixr', 'instance',
		'let', 'of', 'module', 'newtype', 'then', 'type', 'where'
	]);

	protected init() {
		this.setReservedKeywords(HaskellTranslator.reservedKeywords);
		this.header = [
			"import Data.List (intercalate, map)",

			"data Term = Var String | Fun String [Term] | Nat Int deriving (Eq)"
		];
	}

	protected declareNullary(varName: string, symb: string): string {
		return `${varName} = Fun "${symb}" []`;
	}

	translateTerm(term: Term, useNullaryVars = false): string {
		if (isVar(term)) return this.renameVar(term);
		if (isNat(term.name)) return nat(term.name);
		if (useNullaryVars && term.args.length === 0 && this.nullaries.has(term.name)) {
			return nullaryVarName(term.name);
		}

		return `(Fun "${term.name}" [${term.args.map(t => this.translateTerm(t)).join(", ")
			}])`;
	}

	public callTerm(term: Term): string {
		if (isVar(term)) return term;
		if (!this.isDefined(term.name)) {
			return this.translateTerm(
				fun(term.name, ...term.args.map(t => this.callTerm(t))),
				true
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
			res.push(`${name} ${args.join(' ')} = ${this.translateTerm(fun(name, ...args), true)}`);
		}

		return res.join('\n');
	}
}