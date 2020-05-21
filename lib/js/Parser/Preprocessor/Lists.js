"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
exports.consLists = (source) => __awaiter(void 0, void 0, void 0, function* () {
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
});
