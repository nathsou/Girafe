// Girafe interpreter using decision trees

import { readFile } from "fs/promises";
import * as readline from 'readline';
import { showTerm } from "../src/Compiler/Utils";
import { normalizeQueryWith } from "../src/Normalizer/Normalizers";
import { ExternalsFactory } from "../src/Externals/Externals";
import { parseTerm } from "../src/Parser/Parser";
import { Term } from "../src/Parser/Types";

const createREPL = (externals: ExternalsFactory<string>) => {
    let source = '';

    const updateSource = async (path: string): Promise<void> => {
        source = (await readFile(path)).toString();
    };

    const normalize = async (query: Term): Promise<Term> => {
        const res = await normalizeQueryWith('decision-trees')(
            query,
            source,
            externals
        );

        if (res) {
            return res.normalForm;
        } else {
            console.log("Transpilation failed");
        }
    };

    const repl = (src: string): void => {
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

    return { repl, updateSource, normalize };
};

export const interpret = async (
    externals: ExternalsFactory<string>,
    src: string,
    query?: string
): Promise<void> => {
    const { updateSource, normalize, repl } = createREPL(externals);
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
        repl(src);
    }
};