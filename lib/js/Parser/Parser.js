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
exports.parse = exports.parseTerm = exports.parseRules = exports.parseRule = exports.renameVars = void 0;
const Utils_1 = require("../Compiler/Utils");
const Types_1 = require("../Types");
const Preprocessor_1 = require("./Preprocessor/Preprocessor");
const Source_1 = require("./Source");
const TRSParser_1 = require("./TRSParser");
function renameVars(t) {
    if (Utils_1.isVar(t))
        return `$${t}`;
    return {
        name: t.name,
        args: t.args.map(s => renameVars(s))
    };
}
exports.renameVars = renameVars;
exports.parseRule = (str) => {
    const err = TRSParser_1.TRSParser.getInstance().tokenize(str);
    if (err)
        return;
    const rule = TRSParser_1.TRSParser.getInstance().parseRule();
    if (Types_1.isError(rule))
        return;
    return Types_1.unwrap(rule);
};
exports.parseRules = (src) => {
    const rules = TRSParser_1.TRSParser.getInstance().parse(src);
    const trs = Types_1.mapEither(rules, Utils_1.mapify);
    if (Types_1.isError(trs))
        return;
    return Types_1.unwrap(trs);
};
exports.parseTerm = (str) => {
    const err = TRSParser_1.TRSParser.getInstance().tokenize(str);
    if (err)
        return;
    const term = TRSParser_1.TRSParser.getInstance().parseTerm();
    if (Types_1.isError(term))
        return;
    return Types_1.unwrap(term);
};
function parse(source, ...preprocessors) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = {};
        const src = new Source_1.Source(source);
        const preprocessedSource = yield Preprocessor_1.preprocess(src, preprocessors, info);
        if (Types_1.isError(preprocessedSource)) {
            return preprocessedSource;
        }
        const rules = TRSParser_1.TRSParser.getInstance().parse(Types_1.unwrap(preprocessedSource));
        if (Types_1.isError(rules))
            return Types_1.Err([Types_1.unwrap(rules)].map(err => {
                return Object.assign(Object.assign({}, err), { position: {
                        line: src.originalLineNumber(err.position.line),
                        col: err.position.col
                    } });
            }));
        if (rules) {
            return Types_1.Ok({ trs: Utils_1.mapify(Types_1.unwrap(rules)), info: info });
        }
    });
}
exports.parse = parse;
