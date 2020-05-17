"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const Arithmetic_1 = require("../Externals/Arithmetic");
const HaskellTranslator_1 = require("./HaskellTranslator");
const OCamlTranslator_1 = require("./OCamlTranslator");
const JSTranslator_1 = require("./JSTranslator");
function translate(trs, target) {
    let translator;
    switch (target) {
        case 'ocaml':
            translator = new OCamlTranslator_1.OCamlTranslator(trs, Arithmetic_1.ocamlArithmeticExternals);
            break;
        case 'haskell':
            translator = new HaskellTranslator_1.HaskellTranslator(trs, Arithmetic_1.haskellArithmeticExternals);
        case 'js':
            translator = new JSTranslator_1.JSTranslator(trs, Arithmetic_1.jsArithmeticExternals);
    }
    return translator.translate();
}
exports.translate = translate;
