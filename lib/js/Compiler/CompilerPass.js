"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.compile = void 0;
const Types_1 = require("../Types");
const Utils_1 = require("./Utils");
exports.compile = (trs, ...passes) => {
    if (passes.length === 0)
        return Types_1.Ok(trs);
    for (const pass of passes) {
        const res = pass(trs);
        if (Types_1.isError(res)) {
            return res;
        }
        trs = Types_1.unwrap(res);
    }
    return Types_1.Ok(trs);
};
function log(trs) {
    console.log(Utils_1.showTRS(trs));
    return Types_1.Ok(trs);
}
exports.log = log;
