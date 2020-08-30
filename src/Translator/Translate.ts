import { ArithmeticExternals, arithmeticExternals } from "../Externals/Arithmetic";
import { TRS } from "../Parser/Types";
import { HaskellTranslator } from "./HaskellTranslator";
import { OCamlTranslator } from "./OCamlTranslator";
import { Translator } from "./Translator";
import { JSTranslator } from "./JSTranslator";
import { Targets } from "../Externals/Externals";

export function translate<Target extends Targets>(trs: TRS, target: Target): string {
    let translator: Translator<Target, ArithmeticExternals>;

    switch (target) {
        case 'ocaml':
            translator = new OCamlTranslator(
                trs,
                arithmeticExternals(target)
            );
            break;
        case 'haskell':
            translator = new HaskellTranslator(
                trs,
                arithmeticExternals(target)
            );
            break;
        case 'js':
            translator = new JSTranslator(
                trs,
                arithmeticExternals(target)
            );
            break;
    }

    return translator.translate();
}