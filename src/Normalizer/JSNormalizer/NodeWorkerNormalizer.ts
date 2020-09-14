import { Externals } from "../../Externals/Externals";
import { TRS, Term } from "../../Parser/Types";
import { JSNormalizer } from "./JSNormalizer";
import { AsyncNormalizer } from "../Normalizer";
import { makeBigNat } from "../../Translator/JSTranslator";

declare const __non_webpack_require__: (name: string) => any;

const nodeWorkerExecutor = async (source: string, outputExpr: string): Promise<string> => {
    const sourceWithQuery = [
        source,
        "const { parentPort } = require('worker_threads');",
        `parentPort.once('message', () => { parentPort.postMessage(${outputExpr}); });`
    ].join('\n');

    const req = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : require;

    const { Worker } = req('worker_threads');
    const worker = new Worker(sourceWithQuery, { eval: true });

    return new Promise<string>((resolve, reject) => {
        worker.on('message', out => {
            resolve(out);
        });

        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });

        worker.postMessage(null);
    });
};

export const nodeWorkerNormalizer = <Exts extends string>(
    trs: TRS,
    externals: Externals<'js', Exts>,
    nat = makeBigNat
): AsyncNormalizer => {
    return (query: Term) => new JSNormalizer<Exts>(
        trs,
        externals,
        nodeWorkerExecutor,
        nat
    ).normalize(query);
};

export const nodeWorkerRawNormalizer = <Exts extends string>(
    trs: TRS,
    externals: Externals<'js', Exts>,
    nat = makeBigNat
): (query: Term) => Promise<string> => {
    return (query: Term) => new JSNormalizer<Exts>(
        trs,
        externals,
        nodeWorkerExecutor,
        nat
    ).normalizeRaw(query);
};