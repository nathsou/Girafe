"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curryFun = exports.currify = void 0;
const Utils_1 = require("./Utils");
const Types_1 = require("../Types");
const appSymb = 'App';
const Arity = (name, ar) => [Utils_1.fun('Arity', Utils_1.fun(name)), Utils_1.fun(`${ar}`)];
const App = (name, arg) => Utils_1.fun(appSymb, Utils_1.fun(name), arg);
exports.currify = (trs) => {
    const newRules = [];
    for (const [name, rules] of trs.entries()) {
        const ar = Utils_1.arity(rules);
        const names = Utils_1.genVars(ar);
        if (ar > 0) {
            const curriedRule = [
                exports.curryFun({ name, args: names }),
                Utils_1.mostGeneralFun(name, ar)
            ];
            newRules.push(curriedRule, Arity(name, ar));
        }
    }
    Utils_1.addRules(trs, ...newRules);
    return Types_1.Ok(trs);
};
exports.curryFun = ({ name, args }) => (curryFunAux(name, [...args].reverse()));
const curryFunAux = (name, args) => {
    if (args.length === 0)
        return App(name, 'x');
    if (args.length === 1)
        return App(name, Utils_1.head(args));
    const [h, tl] = Utils_1.decons(args);
    return {
        name: appSymb,
        args: [curryFunAux(name, tl), h]
    };
};
