import { fun, isVar, Maybe, replaceSubstrings } from "../Compiler/Utils";
import { SpecialCharacters } from "../Parser/Lexer/SpecialChars";
import { parseTerm } from "../Parser/Parser";
import {
	dictHas, Fun,
	Rule,
	Symb,
	Term,
	TRS,
	Var
} from "../Parser/Types";
import { mapString, setMap } from "../Parser/Utils";
import { Targets, Externals } from "../Externals/Externals";
import { collectTRSArities } from "../Compiler/Passes/Lazify";

export type SourceCode = string;

export const symbolMap: { [key in SpecialCharacters]: string } = {
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
	'>': '_gtr_',
	'<': '_lss_',
	'!': '_exclamation_mark_'
};

export const isNat = (str: string): boolean => natRegex.test(str);
export const nullarySymbolsPrefix = 'symb_';
const natRegex = /^[0-9]+$/;

export const nullaryVarName = (f: string): string => {
	return `${nullarySymbolsPrefix}${mapString(f, c => symbolMap[c] ?? c)}`;
};

export abstract class Translator<Target extends Targets, Exts extends string> {
	protected header: string[] = [];
	protected externals: Externals<Target, Exts>;
	protected trs: TRS;
	protected definedSymbols: Set<Symb>;
	protected reservedKeywords: Set<string>;
	protected nullaries: Set<string>;

	constructor(
		trs: TRS,
		externals: Externals<Target, Exts>,
		reservedKeywords = new Set<string>()
	) {
		this.trs = trs;
		this.externals = externals;
		this.reservedKeywords = reservedKeywords;
		this.definedSymbols = new Set(
			[...trs.keys(), ...Object.keys(externals).map(s => `@${s}`)]
				.map(f => this.withoutSpecialChars(f)),
		);

		this.init();
		this.declareNullarySymbols();
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	protected init(): void { }

	protected declareNullarySymbols() {
		this.nullaries = new Set();

		if (['equ', 'gtr', 'geq', 'lss', 'leq'].some(f => dictHas(this.externals, f))) {
			this.nullaries.add('True');
			this.nullaries.add('False');
		}

		const symbs = collectTRSArities(this.trs);

		for (const [symb, ar] of symbs) {
			if (ar === 0 && !isNat(symb)) {
				this.nullaries.add(symb);
			}
		}

		const decl = setMap(this.nullaries, f => this.declareNullary(nullaryVarName(f), f));

		this.header.push(...decl);
	}

	protected abstract declareNullary(varName: string, symb: string): SourceCode;

	protected setReservedKeywords(kw: Set<string>): void {
		this.reservedKeywords = kw;
	}

	public withSpecialChars(str: string): string {
		return replaceSubstrings(str, symbolMap);
	}

	private withPrefix(name: Symb): Symb {
		return `grf_${name}`;
	}

	private withoutPrefix(str: string): string {
		return str.replace(new RegExp('grf_', 'g'), '');
	}

	private withoutSpecialChars(name: string): string {
		const noSymbols = mapString(name, c => symbolMap[c] ?? c);
		return this.withPrefix(noSymbols);
	}

	public parseRenamedTerm(term: string): Maybe<Term> {
		return parseTerm(this.withoutPrefix(this.withSpecialChars(term)));
	}

	// abstract call(name: Symb, args: Term[]): string;
	abstract translateTerm(term: Term, useNullaryVars?: boolean): SourceCode;
	abstract translateRules(name: string, rules: Rule[]): SourceCode;

	public isDefined(f: Symb): boolean {
		return this.trs.has(f) || this.definedSymbols.has(f) ||
			dictHas(this.externals, f.substr(1));
	}

	protected renameVar(v: Var): Var {
		if (this.reservedKeywords.has(v)) {
			return `_${v}`;
		}

		return v;
	}

	public renameTerm(term: Term): Term {
		if (isVar(term)) return this.renameVar(term);
		if (!this.isDefined(term.name)) {
			return fun(term.name, ...term.args.map(t => this.renameTerm(t)));
		}
		return this.renameFun(term);
	}

	private renameFun(term: Fun): Fun {
		return {
			name: this.withoutSpecialChars(term.name),
			args: term.args.map(t => this.renameTerm(t)),
		};
	}

	private renameRule([lhs, rhs]: Rule): Rule {
		return [this.renameFun(lhs), this.renameTerm(rhs)];
	}

	private generateExternals(): SourceCode {
		const exts: SourceCode[] = [];
		for (const [name, gen] of Object.entries<(name: string) => SourceCode>(this.externals)) {
			exts.push(gen(this.withoutSpecialChars("@" + name)));
		}

		return exts.join("\n");
	}

	private generateRules(): SourceCode {
		const res = [];
		for (const [name, rules] of this.trs) {
			res.push(this.translateRules(
				this.withoutSpecialChars(name),
				rules.map(r => this.renameRule(r)),
			));
		}

		return res.join("\n");
	}

	public translate(): SourceCode {
		return [
			this.header.join("\n"),
			this.generateExternals(),
			this.generateRules(),
		].join("\n");
	}
}