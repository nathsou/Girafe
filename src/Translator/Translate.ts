import { ArithmeticExternals, haskellArithmeticExternals, ocamlArithmeticExternals, jsArithmeticExternals } from "../Externals/Arithmetic";
import { Targets, TRS } from "../Parser/Types";
import { HaskellTranslator } from "./HaskellTranslator";
import { OCamlTranslator } from "./OCamlTranslator";
import { Translator } from "./Translator";
import { JSTranslator } from "./JSTranslator";

export function translate<Target extends Targets>(trs: TRS, target: Target): string {
    let translator: Translator<Target, ArithmeticExternals>;

    switch (target) {
        case 'ocaml':
            translator = new OCamlTranslator(
                trs,
                ocamlArithmeticExternals
            );
            break;
        case 'haskell':
            translator = new HaskellTranslator(
                trs,
                haskellArithmeticExternals
            );
        case 'js':
            translator = new JSTranslator(
                trs,
                jsArithmeticExternals
            );
    }

    return translator.translate();
}