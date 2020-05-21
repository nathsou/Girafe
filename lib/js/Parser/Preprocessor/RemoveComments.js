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
exports.removeComments = void 0;
exports.removeComments = (source) => __awaiter(void 0, void 0, void 0, function* () {
    for (const [line, idx] of source.linesReversed()) {
        const matches = /(\/{2}.*)$/.exec(line);
        if (matches) {
            const [comment] = matches;
            if (comment.length === line.length) {
                source.removeLines(idx, 1);
            }
            else {
                source.updateLines(idx, line.replace(comment, ''));
            }
        }
    }
});
