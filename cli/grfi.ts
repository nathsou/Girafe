// Girafe interpreter using decision trees

import { readFileSync } from "fs";
import * as readline from 'readline';
import { showTerm } from "../src/Compiler/Utils";
import { normalizeQueryWith } from "../src/Editor/Normalizers";
import { arithmeticExternals } from "../src/Externals/Arithmetic";
import { metaExternals } from "../src/Externals/Meta";
import { parseTerm } from "../src/Parser/Parser";
import { NativeExternals } from "../src/Externals/Externals";
import { Term } from "../src/Parser/Types";

const [src, query] = process.argv.slice(2);

const externals: NativeExternals = {
    ...arithmeticExternals('native'),
    ...metaExternals(console.log)('native')
};

let source = '';

const updateSource = (path: string): void => {
    source = readFileSync(path).toString();
};

const normalize = async (query: Term): Promise<Term> => {
    const res = await normalizeQueryWith('decision-trees')(
        query,
        source,
        externals,
        async path => {
            return new Promise(resolve => {
                const contents = readFileSync(`./examples/${path}`).toString();
                resolve(contents);
            });
        }
    );

    if (res) {
        return res.normalForm;
    } else {
        console.log("Transpilation failed");
    }
};

const repl = (): void => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const next = (): void => {
        rl.question('> ', async (q: string) => {
            switch (q) {
                case 'quit':
                    return;
                case 'clear':
                    console.clear();
                    readline.clearLine(process.stdin, 0);
                    next();
                    break;
                case 'reload':
                    updateSource(src);
                    next();
                    break;
                case '':
                case undefined:
                    next();
                    break;
            }

            const queryTerm = parseTerm(q);

            if (queryTerm) {
                const nf = await normalize(queryTerm);
                console.log(showTerm(nf));
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
        updateSource(src);
        if (query !== undefined) {
            const q = parseTerm(query);

            if (q) {
                const nf = await normalize(q);
                console.log(showTerm(nf));
            } else {
                console.log(`Could not parse query: "${query}"`);
            }
        } else {
            repl();
        }
    } else {
        console.log("usage: grfi [src.grf] [query]");
    }
})();