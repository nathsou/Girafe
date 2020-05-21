"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertStrings = void 0;
const Lists_1 = require("../../Externals/Lists");
const Utils_1 = require("../../Compiler/Utils");
const intListOfString = (str) => {
    return Lists_1.listOf(str.split('').map(c => Utils_1.fun(`${c.charCodeAt(0)}`)));
};
exports.convertStrings = async (source) => {
    for (let [line, idx] of source.linesReversed()) {
        let matched = false;
        for (const [quotedStr, str] of line.matchAll(/"([^\"]*)"/g)) {
            const asList = Utils_1.showTerm(intListOfString(str));
            line = line.replace(quotedStr, asList);
            matched = true;
        }
        if (matched) {
            source.updateLines(idx, line);
        }
    }
};
