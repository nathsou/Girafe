"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeComments = void 0;
exports.removeComments = async (source) => {
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
};
