import { Externals } from "../../Externals/Externals";
import { Term, TRS } from "../../Parser/Types";
import { AsyncNormalizer } from "../Normalizer";
import { JSNormalizer } from "./JSNormalizer";

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
    externals: Externals<'js', Exts>
): AsyncNormalizer => {
    return (query: Term) => new JSNormalizer<Exts>(
        trs,
        externals,
        webWorkerExecutor
    ).normalize(query);
};