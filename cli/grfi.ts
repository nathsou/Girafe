// Girafe interpreter using decision trees

import { readFileSync } from "fs";
import { compileRules } from "../src/Normalizer/Unification";
import { defaultPasses, showTerm } from "../src/Compiler/Utils";
import { DecisionTreeNormalizer } from "../src/Normalizer/DecisionTreeNormalizer";
import { arithmeticExternals } from "../src/Externals/Arithmetic";
import { Normalizer } from "../src/Normalizer/Normalizer";
import { parseTerm } from "../src/Parser/Parser";
import * as readline from 'readline';

const [src, query] = process.argv.slice(2);

const buildNormalizer = async (path: string): Promise<Normalizer> => {
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
        return new DecisionTreeNormalizer(trs)
            .asNormalizer(arithmeticExternals);
    } else {
        console.log("Transpilation failed");
    }
};

interface Context {
    history: string[],
    historyIndex: number
}

const repl = (norm: Normalizer, ctx: Context = { history: [], historyIndex: 0 }): void => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const next = (): void => {
        rl.question('> ', (q: string) => {
            switch (q) {
                case 'quit':
                    return;
                case 'clear':
                    console.clear();
                    readline.clearLine(process.stdin, 0);
                    next();
                    break;
                case 'reload':
                    buildNormalizer(src).then(updatedNorm => {
                        norm = updatedNorm;
                    });
                    break;
                case '':
                case undefined:
                    next();
                    break;
            }

            const queryTerm = parseTerm(q);
            ctx.historyIndex = 0;

            if (queryTerm) {
                ctx.history.push(q);
                console.log(showTerm(norm(queryTerm)));
            } else {
                console.log(`Could not parse query: "${q}"`);
            }
            next();
        });
    };

    next();
};

(async () => {
    if (src !== undefined) {
        const norm = await buildNormalizer(src);

        if (query !== undefined) {
            const q = parseTerm(query);

            if (q) {
                console.log(showTerm(norm(q)));
            } else {
                console.log(`Could not parse query: "${query}"`);
            }
        } else {
            repl(norm);
        }
    } else {
        console.log("usage: grfi [src.grf] [query]");
    }
})();