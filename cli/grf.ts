import { arithmeticExternals } from "../src/Externals/Arithmetic";
import { mergeExternals } from "../src/Externals/Externals";
import { metaExternals } from "../src/Externals/Meta";
import { interpret } from './grfi';
import { compile } from './grfc';

(async () => {
    const argsCount = process.argv.length - 2;
    const externals = () => mergeExternals(arithmeticExternals, metaExternals());

    switch (argsCount) {
        case 1:
        case 2: {
            const [src, query] = process.argv.slice(2);
            await interpret(externals(), src, query);
            break;
        }
        case 3: {
            const [src, outFile, target] = process.argv.slice(2);
            await compile(externals(), src, outFile, target);
            break;
        }
        default:
            console.log('usage:');
            console.log('(interpret) grf src.grf [query] out ocaml/haskell/js/girafe');
            console.log('(compile)   grf src.grf out ocaml/haskell/js/girafe');
            break;
    }
})();