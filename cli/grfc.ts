import { readFile, writeFile } from "fs/promises";
import { defaultPasses, showTRS } from "../src/Compiler/Utils";
import { ExternalsFactory, supportedTargets, Targets } from "../src/Externals/Externals";
import { compileRules } from "../src/Normalizer/Unification";
import { translate } from "../src/Translator/Translate";

const transpile = async (
  externals: ExternalsFactory<string>,
  path: string,
  target: Targets | 'girafe'
): Promise<string> => {
  const source = (await readFile(path)).toString();
  const trs = await compileRules(
    source,
    defaultPasses(externals('native'))
  );

  if (trs) {
    if (target === 'girafe') {
      return showTRS(trs);
    } else {
      return translate(trs, target, externals);
    }
  } else {
    console.log('Transpilation failed');
  }
};

export const compile = async (
  externals: ExternalsFactory<string>,
  src: string,
  outFile: string,
  target: string
): Promise<void> => {
  const targetName = target as Targets;
  const targets = [...supportedTargets, 'girafe'];

  if (targets.includes(targetName)) {
    const out = await transpile(externals, src, targetName);

    if (outFile !== undefined) {
      await writeFile(outFile, out);
    } else {
      console.log(out);
    }
  } else {
    console.error(`invalid target: ${targetName}, available targets are: [${targets.join(', ')}]`);
    process.exit(0);
  }
};