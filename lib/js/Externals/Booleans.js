"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boolExternals = void 0;
const Imports_1 = require("../Compiler/Imports");
const Utils_1 = require("../Compiler/Utils");
const equ = (t) => {
    const [a, b] = t.args;
    return Utils_1.termsEq(a, b) ? Imports_1.True() : Imports_1.False();
};
exports.boolExternals = {
    'equ': t => equ(t)
};
