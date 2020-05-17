"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImports = exports.specialCharacters = void 0;
const Types_1 = require("../../Types");
const Preprocessor_1 = require("./Preprocessor");
exports.specialCharacters = [
    ".",
    "-",
    "~",
    "+",
    "*",
    "&",
    "|",
    "^",
    "%",
    "°",
    "$",
    "@",
    "#",
    ";",
    ":",
    "_",
    "=",
    "'",
    ">",
    "<",
];
// import "arith.grf" (+, -, *, %, >)
const symb = `[${exports.specialCharacters.map((c) => `\\${c}`).join("")}a-zA-Z0-9]+`;
const pattern = `^\\s*(import)\\s*\\"(${symb})\\"\\s*(\\(((\\s*${symb}\\,)*\\s*${symb})\\))?$`;
exports.handleImports = (fileReader) => {
    return async (src, passes, info) => {
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
                    const contents = await fileReader(path);
                    const preprocessed = await Preprocessor_1.preprocess(contents, passes, info);
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
    };
};
