import { PrepocessorPass } from "./Preprocessor";
import { Source } from "../Source";
import { listOf } from "../../Externals/Lists";
import { Term } from "../Types";
import { fun, showTerm } from "../../Compiler/Utils";

const intListOfString = (str: string): Term => {
    return listOf(str.split('').map(c => fun(`${c.charCodeAt(0)}`)));
};

export const convertStrings: PrepocessorPass = async (source: Source) => {
    for (let [line, idx] of source.linesReversed()) {
        let matched = false;
        for (const [quotedStr, str] of line.matchAll(/"([^\"]*)"/g)) {
            const asList = showTerm(intListOfString(str));
            line = line.replace(quotedStr, asList);
            matched = true;
        }

        if (matched) {
            source.updateLines(idx, line);
        }
    }
};