import { Externals, Term, TRS } from "../Parser/Types";
import { JSTranslator, stringifyJSExpr } from "../Translator/JSTranslator";
import { OneShotNormalizer } from "./Normalizer";
import { parseTerm } from "../Parser/Parser";

export class WebWorkerNormalizer<Exts extends string> implements OneShotNormalizer {
    private trs: TRS;
    private externals: Externals<'js', Exts>;

    constructor(trs: TRS, externals: Externals<'js', Exts>) {
        this.trs = trs;
        this.externals = externals;
    }

    private getWorkerTask(query: Term, jst: JSTranslator<Exts>): string {
        return `
        const __res = ${stringifyJSExpr(jst.callTerm(jst.renameTerm(query)))};

        self.onmessage = () => { postMessage(showTerm(__res)); };`;
    }

    public normalize(query: Term): Promise<Term> {
        const jst = new JSTranslator(this.trs, this.externals);
        const source = jst.translate();
        const sourceWithQuery = `${source}\n${this.getWorkerTask(query, jst)}`;
        const blob = new Blob([sourceWithQuery], { type: 'application/javascript' });
        const uri = URL.createObjectURL(blob);
        const worker = new Worker(uri);

        return new Promise<Term>(resolve => {
            worker.onmessage = (msg: MessageEvent) => {
                resolve(parseTerm(msg.data as string) as Term);
            };

            worker.postMessage(null);
        });
    }
}