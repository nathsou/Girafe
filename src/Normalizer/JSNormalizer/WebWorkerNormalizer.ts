import { Externals } from "../../Externals/Externals";
import { TRS, Term } from "../../Parser/Types";
import { JSNormalizer } from "./JSNormalizer";
import { AsyncNormalizer } from "../Normalizer";
import { makeBigNat } from "../../Translator/JSTranslator";

const webWorkerExecutor = (source: string, outputExpr: string): Promise<string> => {
    const sourceWithQuery = [
        source,
        `self.onmessage = () => { postMessage(${outputExpr}); };`
    ].join('\n');

    const blob = new Blob([sourceWithQuery], { type: 'application/javascript' });
    const uri = URL.createObjectURL(blob);
    const worker = new Worker(uri);

    return new Promise<string>(resolve => {
        worker.onmessage = (msg: MessageEvent) => {
            resolve(msg.data as string);
        };

        worker.postMessage(null);
    });
};

export const webWorkerNormalizer = <Exts extends string>(
    trs: TRS,
    externals: Externals<'js', Exts>,
    makeNat = makeBigNat
): AsyncNormalizer => {
    return (query: Term) => new JSNormalizer<Exts>(
        trs,
        externals,
        webWorkerExecutor,
        makeNat
    ).normalize(query);
};