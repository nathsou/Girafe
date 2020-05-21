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
exports.preprocess = void 0;
const Utils_1 = require("../../Compiler/Utils");
const Source_1 = require("../Source");
const Types_1 = require("../../Types");
function preprocess(source, passes, info = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const src = source instanceof Source_1.Source ? source : new Source_1.Source(source);
        const passedPasses = [];
        for (const pass of passes) {
            passedPasses.push(pass);
            const errors = yield pass(src, passedPasses, info);
            if (Utils_1.isSomething(errors))
                return Types_1.Err(errors);
        }
        return Types_1.Ok(src.asString());
    });
}
exports.preprocess = preprocess;
