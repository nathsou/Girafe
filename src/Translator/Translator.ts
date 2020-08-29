import { isVar, fun, Maybe } from "../Compiler/Utils";
import {
	Externals,
	Fun,
	Rule,
	Symb,
	Targets,
	Term,
	TRS,
	dictHas,
	Var,
} from "../Parser/Types";
import { SpecialCharacters } from "../Parser/Lexer/SpecialChars";
import { mapString } from "../Parser/Utils";
import { parseTerm } from "../Parser/Parser";

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

export abstract class Translator<Target extends Targets, Exts extends string> {
	protected header: string[] = [];
	protected externals: Externals<Target, Exts>;
	protected trs: TRS;
	protected definedSymbols: Set<Symb>;
	protected reservedKeywords: Set<string>;

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
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	protected init(): void { }

	protected setReservedKeywords(kw: Set<string>): void {
		this.reservedKeywords = kw;
	}

	public withSpecialChars(name: string): string {
		let withSymbols = name;
		for (const [symb, replacement] of Object.entries(symbolMap)) {
			withSymbols = withSymbols.replace(new RegExp(replacement, 'g'), symb);
		}

		return withSymbols;
	}

	public withPrefix(name: Symb): Symb {
		return `grf_${name}`;
	}

	public withoutPrefix(str: string): string {
		return str.replace(new RegExp('grf_', 'g'), '');
	}

	public withoutSpecialChars(name: string): string {
		const noSymbols = mapString(name, c => symbolMap[c] ?? c);
		return this.withPrefix(noSymbols);
	}

	public parseRenamedTerm(term: string): Maybe<Term> {
		return parseTerm(this.withoutPrefix(this.withSpecialChars(term)));
	}

	// abstract call(name: Symb, args: Term[]): string;
	abstract translateTerm(term: Term): string;
	abstract translateRules(name: string, rules: Rule[]): string;

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

	private generateExternals(): string {
		const exts: string[] = [];
		for (const [name, gen] of Object.entries<(name: string) => string>(this.externals)) {
			exts.push(gen(this.withoutSpecialChars("@" + name)));
		}

		return exts.join("\n");
	}

	private generateRules(): string {
		const res = [];
		for (const [name, rules] of this.trs) {
			res.push(this.translateRules(
				this.withoutSpecialChars(name),
				rules.map(r => this.renameRule(r)),
			));
		}

		return res.join("\n");
	}

	public translate(): string {
		return [
			this.header.join("\n"),
			this.generateExternals(),
			this.generateRules(),
		].join("\n");
	}
}