import { fun, isVar } from "../Compiler/Utils";
import { Externals, Rule, Symb, Term, TRS } from "../Parser/Types";
import { mapString } from "../Parser/Utils";
import { symbolMap } from "./JSTranslator";
import { Translator } from "./Translator";

export class HaskellTranslator<Exts extends string>
  extends Translator<'haskell', Exts> {

  constructor(trs: TRS, externals: Externals<'haskell', Exts>) {
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

  rename(name: Symb): Symb {
    const noSymbols = mapString(name, c => symbolMap[c] ?? c);
    return `grf_${noSymbols}`;
  }

  translateTerm(term: Term): string {
    if (isVar(term)) return term;
    return `(Fun "${term.name}" [${
      term.args.map((t) => this.translateTerm(t)).join(", ")
      }])`;
  }

  private callTerm(term: Term): string {
    if (isVar(term)) return term;
    if (!this.isDefined(term.name)) {
      return this.translateTerm(
        fun(term.name, ...term.args.map(t => this.callTerm(t)))
      );
    }

    const args = `${term.args.map((t) => this.callTerm(t)).join(' ')}`;
    return `(${term.name} ${args})`;
  }

  translateRules(name: string, rules: Rule[]): string {
    const res: string[] = [];
    for (const [lhs, rhs] of rules) {
      const args = `${lhs.args.map((t) => this.translateTerm(t)).join(' ')}`;
      res.push(`${name} ${args} = ${this.callTerm(rhs)}`);
    }

    return res.join('\n');
  }
}