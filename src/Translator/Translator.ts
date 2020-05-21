import { isVar, fun } from "../Compiler/Utils";
import {
  Externals,
  Fun,
  Rule,
  Symb,
  Targets,
  Term,
  TRS,
  mapHas,
} from "../Parser/Types";

export abstract class Translator<Target extends Targets, Exts extends string> {
  protected header: string[] = [];
  protected externals: Externals<Target, Exts>;
  protected trs: TRS;
  protected definedSymbols: Set<Symb>;

  constructor(trs: TRS, externals: Externals<Target, Exts>) {
    this.trs = trs;
    this.externals = externals;
    this.definedSymbols = new Set(
      [...trs.keys(), ...Object.keys(externals).map((s) => `@${s}`)]
        .map((f) => this.rename(f)),
    );

    this.init();
  }

  protected init() { }

  abstract rename(name: Symb): Symb;
  // abstract call(name: Symb, args: Term[]): string;
  abstract translateTerm(term: Term): string;
  abstract translateRules(name: string, rules: Rule[]): string;

  protected isDefined(f: Symb): boolean {
    return this.trs.has(f) || this.definedSymbols.has(f) ||
      mapHas(this.externals, f.substr(1));
  }

  private renameTerm(term: Term): Term {
    if (isVar(term)) return term;
    if (!this.isDefined(term.name)) {
      return fun(term.name, ...term.args.map(t => this.renameTerm(t)));
    }
    return this.renameFun(term);
  }

  private renameFun(term: Fun): Fun {
    return {
      name: this.rename(term.name),
      args: term.args.map((t) => this.renameTerm(t)),
    };
  }

  private renameRule([lhs, rhs]: Rule): Rule {
    return [this.renameFun(lhs), this.renameTerm(rhs)];
  }

  private generateExternals(): string {
    const exts: string[] = [];
    for (
      const [name, gen] of Object.entries<(name: string) => string>(
        this.externals,
      )
    ) {
      exts.push(gen(this.rename("@" + name)));
    }

    return exts.join("\n");
  }

  private generateRules(): string {
    const res = [];
    for (const [name, rules] of this.trs) {
      res.push(this.translateRules(
        this.rename(name),
        rules.map((r) => this.renameRule(r)),
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