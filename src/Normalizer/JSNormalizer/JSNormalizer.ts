import { replaceVars } from "../../Compiler/Passes/LeftLinearize";
import { isFun, vars, defined } from "../../Compiler/Utils";
import { Externals } from "../../Externals/Externals";
import { Term, TRS } from "../../Parser/Types";
import { JSTranslator, stringifyJSExpr } from "../../Translator/JSTranslator";
import { OneShotNormalizer } from "./../Normalizer";

// query variables are free
const stringifyQueryVars = (t: Term): Term => {
    if (isFun(t)) {
        return replaceVars(t, vars(t).map(v => `"${v}"`));
    }

    return t;
};

export class JSNormalizer<Exts extends string> implements OneShotNormalizer {
    constructor(
        private trs: TRS,
        private externals: Externals<'js', Exts>,
        private executor: (jsSource: string, outExpr: string) => Promise<string>
    ) {
        this.trs = trs;
        this.externals = externals;
    }

    private getOutputExpr(query: Term, jst: JSTranslator<Exts>): string {
        return `showTerm(${stringifyJSExpr(jst.callTerm(jst.renameTerm(stringifyQueryVars(query))))})`;
    }

    public async normalize(query: Term): Promise<Term> {
        const jst = new JSTranslator(this.trs, this.externals);
        const source = jst.translate();
        const out = await this.executor(source, this.getOutputExpr(query, jst));
        return defined(jst.parseRenamedTerm(out));
    }
}