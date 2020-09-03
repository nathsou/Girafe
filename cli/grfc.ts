import { readFileSync, writeFileSync } from "fs";
import { defaultPasses } from "../src/Compiler/Utils";
import { compileRules } from "../src/Normalizer/Unification";
import { translate } from "../src/Translator/Translate";
import { Targets, supportedTargets, mergeExternals } from "../src/Externals/Externals";
import { arithmeticExternals } from "../src/Externals/Arithmetic";
import { metaExternals } from "../src/Externals/Meta";

const src = process.argv[2];
const outFile = process.argv[3];
const target = process.argv[4];

const transpile = async (path: string, target: Targets): Promise<string> => {
  const source = readFileSync(path).toString();
  const trs = await compileRules(
    source,
    defaultPasses,
    async path => {
      return new Promise(resolve => {
        const contents = readFileSync(`./examples/${path}`).toString();
        resolve(contents);
      });
    },
  );

  if (trs) {
    const externals = mergeExternals(arithmeticExternals, metaExternals());
    return translate(trs, target, externals);
  } else {
    console.log("Transpilation failed");
  }
};

(async () => {
  if (src) {
    const targetName = target as Targets;
    if (!supportedTargets.includes(targetName)) {
      console.error(`invalid target: ${targetName}, available targets are: [${supportedTargets.join(', ')}]`);
      return;
    }
    const out = await transpile(src, targetName);
    if (outFile) {
      writeFileSync(outFile, out);
    } else {
      console.log(out);
    }
  } else {
    console.log("usage: grfc [src.grf] [out] [ocaml/haskell/js]");
  }
})();
