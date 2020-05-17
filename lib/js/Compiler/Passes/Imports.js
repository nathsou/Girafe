"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnd = exports.useIf = exports.use = exports.Eq = exports.And = exports.If = exports.False = exports.True = exports.falseSymb = exports.trueSymb = exports.andSymb = exports.ifSymb = exports.eqSymb = void 0;
const Utils_1 = require("../Utils");
exports.eqSymb = '@equ';
exports.ifSymb = 'if';
exports.andSymb = 'and';
exports.trueSymb = 'True';
exports.falseSymb = 'False';
exports.True = () => Utils_1.fun(exports.trueSymb);
exports.False = () => Utils_1.fun(exports.falseSymb);
exports.If = (cond, thenExp, elseExp) => {
    return Utils_1.fun(exports.ifSymb, cond, thenExp, elseExp);
};
exports.And = (a, b) => {
    return Utils_1.fun(exports.andSymb, a, b);
};
exports.Eq = (a, b) => {
    return Utils_1.fun(exports.eqSymb, a, b);
};
exports.use = (trs, rules) => {
    Utils_1.addRules(trs, ...rules);
};
exports.useIf = (trs) => {
    const ifRules = [
        [exports.If(exports.True(), 'a', 'b'), 'a'],
        [exports.If(exports.False(), 'a', 'b'), 'b']
    ];
    exports.use(trs, ifRules);
};
exports.useAnd = (trs) => {
    const andRules = [
        [exports.And(exports.False(), exports.False()), exports.False()],
        [exports.And(exports.False(), exports.True()), exports.False()],
        [exports.And(exports.True(), exports.False()), exports.False()],
        [exports.And(exports.True(), exports.True()), exports.True()]
    ];
    exports.use(trs, andRules);
};
