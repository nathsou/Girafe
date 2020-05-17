"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headMatcher = void 0;
const Utils_1 = require("../../Compiler/Utils");
// A matcher checking all the rules corresponding to the term's head symbol 
exports.headMatcher = (trs) => {
    return (term, unificator) => {
        var _a;
        if (Utils_1.isVar(term))
            return;
        for (const [lhs, _] of ((_a = trs.get(term.name)) !== null && _a !== void 0 ? _a : [])) {
            const sigma = unificator(term, lhs);
            if (sigma)
                return sigma;
        }
    };
};
