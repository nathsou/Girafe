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
exports.handleImports = void 0;
const Types_1 = require("../../Types");
const Preprocessor_1 = require("./Preprocessor");
const SpecialChars_1 = require("../Lexer/SpecialChars");
// import "arith.grf" (+, -, *, %, >)
const symb = `[${SpecialChars_1.specialCharacters.map((c) => `\\${c}`).join("")}a-zA-Z0-9]+`;
const pattern = `^\\s*(import)\\s*\\"(${symb})\\"\\s*(\\(((\\s*${symb}\\,)*\\s*${symb})\\))?$`;
exports.handleImports = (fileReader) => {
    return (src, passes, info) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!info.importPass) {
            info.importPass = {
                includedPaths: new Map(),
            };
        }
        for (const [line, idx] of src.linesReversed()) {
            const matches = new RegExp(pattern).exec(line);
            if (matches) {
                const path = matches[2];
                if (!info.importPass.includedPaths.has(path)) {
                    const namedImports = (_b = (_a = matches[4]) === null || _a === void 0 ? void 0 : _a.split(",").map((s) => s.trim())) !== null && _b !== void 0 ? _b : [];
                    info.importPass.includedPaths.set(path, namedImports);
                    const contents = yield fileReader(path);
                    const preprocessed = yield Preprocessor_1.preprocess(contents, passes, info);
                    if (Types_1.isError(preprocessed)) {
                        return Types_1.unwrap(preprocessed);
                    }
                    src.removeLines(idx, 1);
                    src.insert(idx, Types_1.unwrap(preprocessed));
                }
                else {
                    src.removeLines(idx, 1);
                }
            }
        }
    });
};
