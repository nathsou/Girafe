"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderBySpecificity = exports.lessSpecific = exports.orderBy = exports.ruleOrder = void 0;
const Types_1 = require("../../Types");
const Utils_1 = require("../Utils");
exports.ruleOrder = (order, rule1, rule2) => (order(Utils_1.lhs(rule1), Utils_1.lhs(rule2)) ? 1 : -1);
exports.orderBy = (order) => {
    return (trs) => {
        const reordered = Utils_1.emptyTRS();
        for (const [name, rules] of trs.entries()) {
            reordered.set(name, rules.sort((a, b) => exports.ruleOrder(order, a, b)));
        }
        return Types_1.Ok(reordered);
    };
};
exports.lessSpecific = (s, t) => {
    if (Utils_1.isVar(s) && Utils_1.isFun(t))
        return true;
    if (Utils_1.isFun(s) && Utils_1.isVar(t))
        return false;
    if (Utils_1.isFun(s) && Utils_1.isFun(t)) {
        if (s.args.length !== t.args.length) {
            return s.args.length < t.args.length;
        }
        for (const [a, b] of Utils_1.zip(s.args, t.args)) {
            if (exports.lessSpecific(a, b))
                return true;
        }
        return s.name > t.name;
    }
    return false;
};
exports.orderBySpecificity = exports.orderBy(exports.lessSpecific);
