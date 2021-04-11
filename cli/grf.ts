import { arithmeticExternals } from "../src/Externals/Arithmetic";
import { mergeExternals } from "../src/Externals/Externals";
import { metaExternals } from "../src/Externals/Meta";
import { interpret } from './grfi';
import { compile } from './grfc';

(async () => {
    const argsCount = process.argv.length - 2;
    const externals = () => mergeExternals(arithmeticExternals, metaExternals());

    if (argsCount === 1 || argsCount === 2) {
        const [src, query] = process.argv.slice(2);
        await interpret(externals(), src, query);
    } else if (argsCount === 3) {
        const [src, outFile, target] = process.argv.slice(2);
        await compile(externals(), src, outFile, target);
    } else {
        console.log('usage:');
        console.log('(interpret) grf src.grf [query] out ocaml/haskell/js/girafe');
        console.log('(compile)   grf src.grf out ocaml/haskell/js/girafe');
    }
})();