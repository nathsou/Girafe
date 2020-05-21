"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consLists = void 0;
const Utils_1 = require("../../Compiler/Utils");
const Lists_1 = require("../../Externals/Lists");
// const parseListShorthand = (line: string): string => {
//     const lists: string[] = [];
//     for (const [char, i] of indexed(line.split(''))) {
//         if (char === '[') {
//         }
//     }
// };
exports.consLists = async (source) => {
    for (let [line, idx] of source.linesReversed()) {
        let matched = false;
        for (const [list] of line.matchAll(/(\[([^\,]+\,)*[^\,]+\])|(\[\])/g)) {
            const elems = list
                .substr(1, list.length - 2)
                .split(',')
                .map(s => s.trim().trimEnd())
                .filter(s => s !== '');
            const consed = Utils_1.showTerm(Lists_1.stringListOf(elems));
            line = line.replace(list, consed);
            matched = true;
        }
        if (matched) {
            source.updateLines(idx, line);
        }
    }
};
