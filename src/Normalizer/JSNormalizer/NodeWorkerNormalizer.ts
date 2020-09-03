import { Externals } from "../../Externals/Externals";
import { TRS, Term } from "../../Parser/Types";
import { JSNormalizer } from "./JSNormalizer";
import { Worker } from 'worker_threads';
import { AsyncNormalizer } from "../Normalizer";

const nodeWorkerExecutor = (source: string, outputExpr: string): Promise<string> => {
    const sourceWithQuery = [
        source,
        "const { parentPort } = require('worker_threads');",
        `parentPort.once('message', () => { parentPort.postMessage(${outputExpr}); });`
    ].join('\n');

    const worker = new Worker(sourceWithQuery, { eval: true });

    return new Promise<string>(resolve => {
        worker.on('message', out => {
            resolve(out);
        });

        worker.postMessage(null);
    });
};

export const nodeWorkerNormalizer = <Exts extends string>(
    trs: TRS,
    externals: Externals<'js', Exts>
): AsyncNormalizer => {
    return (query: Term) => new JSNormalizer<Exts>(trs, externals, nodeWorkerExecutor).normalize(query);
};