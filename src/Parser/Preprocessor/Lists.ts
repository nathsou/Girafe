import { showTerm } from "../../Compiler/Utils";
import { stringListOf } from "../../Externals/Lists";
import { Source } from "../Source";
import { PrepocessorPass } from "./Preprocessor";

// const parseListShorthand = (line: string): string => {

//     const lists: string[] = [];

//     for (const [char, i] of indexed(line.split(''))) {
//         if (char === '[') {

//         }
//     }
// };

export const consLists: PrepocessorPass = async (source: Source) => {
    for (let [line, idx] of source.linesReversed()) {
        let matched = false;
        for (const [list] of line.matchAll(/(\[([^\,]+\,)*[^\,]+\])|(\[\])/g)) {
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