import { defined, stringifyQueryVars } from "../../Compiler/Utils";
import { Externals } from "../../Externals/Externals";
import { Term, TRS } from "../../Parser/Types";
import { JSTranslator, makeBigNat } from "../../Translator/JSTranslator";
import { OneShotNormalizer } from "./../Normalizer";

export class JSNormalizer<Exts extends string> implements OneShotNormalizer {
    constructor(
        private trs: TRS,
        private externals: Externals<'js', Exts>,
        private executor: (jsSource: string, outExpr: string) => Promise<string>,
        private nat = makeBigNat
    ) {
        this.trs = trs;
        this.externals = externals;
    }

    private getOutputExpr(query: Term, jst: JSTranslator<Exts>): string {
        return `showTerm(${jst.translateJSExpr(jst.callTerm(jst.renameTerm(stringifyQueryVars(query))))})`;
    }

    public async normalize(query: Term): Promise<Term> {
        const jst = new JSTranslator(this.trs, this.externals, this.nat);
        const source = jst.translate();
        const out = await this.executor(source, this.getOutputExpr(query, jst));
        return defined(jst.parseRenamedTerm(out));
    }
}