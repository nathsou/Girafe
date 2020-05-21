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
exports.convertStrings = void 0;
const Lists_1 = require("../../Externals/Lists");
const Utils_1 = require("../../Compiler/Utils");
const intListOfString = (str) => {
    return Lists_1.listOf(str.split('').map(c => Utils_1.fun(`${c.charCodeAt(0)}`)));
};
exports.convertStrings = (source) => __awaiter(void 0, void 0, void 0, function* () {
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
});
