import { showTerm } from "../../Compiler/Utils";
import { stringListOf } from "../../Externals/Lists";
import { Source } from "../Source";
import { PrepocessorPass } from "./Preprocessor";

export const consLists: PrepocessorPass = async (source: Source) => {
    // eslint-disable-next-line prefer-const
    for (let [line, idx] of source.linesReversed()) {
        let matched = false;
        for (const [list] of line.matchAll(/(\[([^,]+,)*[^,]+\])|(\[\])/g)) {
            const elems = list
                .substr(1, list.length - 2)
                .split(',')
                .map(s => s.trim().trimEnd())
                .filter(s => s !== '');

            const consed = showTerm(stringListOf(elems));
            line = line.replace(list, consed);
            matched = true;
        }

        if (matched) {
            source.updateLines(idx, line);
        }
    }
};