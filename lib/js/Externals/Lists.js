"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listExternals = exports.listOf = void 0;
const Utils_1 = require("../Compiler/Utils");
const Arithmetic_1 = require("./Arithmetic");
const Utils_2 = require("../Parser/Utils");
exports.listOf = (elems) => {
    if (elems.length === 0)
        return Arithmetic_1.symb('Nil');
    const [h, tl] = Utils_1.decons(elems);
    return Utils_1.fun(':', h, exports.listOf(tl));
};
const splitHead = (t) => {
    const n = t.args[0];
    if (Utils_1.isFun(n)) {
        return exports.listOf(Utils_2.mapMut(n.name.split(''), Arithmetic_1.symb));
    }
    return t;
};
exports.listExternals = {
    'splitHead': splitHead
};
