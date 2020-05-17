"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocess = void 0;
const Utils_1 = require("../../Compiler/Utils");
const Source_1 = require("../Source");
const Types_1 = require("../../Types");
async function preprocess(source, passes, info = {}) {
    const src = source instanceof Source_1.Source ? source : new Source_1.Source(source);
    const passedPasses = [];
    for (const pass of passes) {
        passedPasses.push(pass);
        const errors = await pass(src, passedPasses, info);
        if (Utils_1.isSomething(errors))
            return Types_1.Error(errors);
    }
    return Types_1.Ok(src.asString());
}
exports.preprocess = preprocess;
