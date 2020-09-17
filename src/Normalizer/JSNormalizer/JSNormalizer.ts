import { defined, fun, stringifyQueryVars } from "../../Compiler/Utils";
import { Externals } from "../../Externals/Externals";
import { parseTerm } from "../../Parser/Parser";
import { dictHas, Term, TRS } from "../../Parser/Types";
import { JSTranslator } from "../../Translator/JSTranslator";
import { OneShotNormalizer } from "./../Normalizer";

export class JSNormalizer<Exts extends string> implements OneShotNormalizer {
    constructor(
        private trs: TRS,
        private externals: Externals<'js', Exts>,
        private executor: (jsSource: string, outExpr: string) => Promise<string>,
    ) {
        this.trs = trs;
        if (!dictHas(externals, 'show')) {
            throw new Error('@show must be included in the externals to use the JSNormalizer');
        }
        this.externals = externals;
    }

    private getOutputExpr(query: Term, jst: JSTranslator<Exts>): string {
        return jst.callTerm(jst.renameTerm(stringifyQueryVars(fun('@show', query))));
    }

    public async normalize(query: Term): Promise<Term> {
        const jst = new JSTranslator(this.trs, this.externals);
        const source = jst.translate();
        const out = await this.executor(source, this.getOutputExpr(query, jst));
        return defined(parseTerm(out));
    }

    public async normalizeRaw(query: Term): Promise<string> {
        const jst = new JSTranslator(this.trs, this.externals);
        const source = jst.translate();
        const out = await this.executor(source, this.getOutputExpr(query, jst));
        return out;
    }
}