import { readFileSync, writeFileSync } from "fs";
import { defaultPasses } from "../src/Compiler/Utils";
import { compileRules } from "../src/Evaluator/Unification";
import { Targets } from "../src/Parser/Types";
import { translate } from "../src/Translator/Translate";

const src = process.argv[2];
const outFile = process.argv[3];
const target = process.argv[4];
const targets = new Set(['haskell', 'ocaml', 'js']);

const transpile = async (path: string, target: Targets): Promise<string> => {
  const source = readFileSync(path).toString();
  const trs = await compileRules(
    source,
    defaultPasses,
    async (path) => {
      return new Promise((resolve, reject) => {
        const contents = readFileSync(`./TRSs/${path}`).toString();
        resolve(contents);
      });
    },
  );

  if (trs) {
    return translate(trs, target);
  } else {
    console.log("Transpilation failed");
  }
};

(async () => {
  if (src) {
    const targetName = target ?? 'js';
    if (!targets.has(targetName)) {
      console.error(`invalid target: ${targetName}`);
      return;
    }
    const out = await transpile(src, targetName as Targets);
    if (outFile) {
      writeFileSync(outFile, out);
    } else {
      console.log(out);
    }
  } else {
    console.log("usage: grfc [src.grf] [out] [ocaml/haskell/js]");
  }
})();
