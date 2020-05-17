import { PrepocessorPass } from "./Preprocessor";
import { Source } from "../Source";

export const removeComments: PrepocessorPass = async (source: Source) => {
    for (const [line, idx] of source.linesReversed()) {
        const matches = /(\/{2}.*)$/.exec(line);
        if (matches) {
            const [comment] = matches;
            if (comment.length === line.length) {
                source.removeLines(idx, 1);
            } else {
                source.updateLines(idx, line.replace(comment, ''));
            }
        }
    }
};