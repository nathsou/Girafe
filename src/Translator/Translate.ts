import { ArithmeticExternals } from "../Externals/Arithmetic";
import { ExternalsFactory, Targets } from "../Externals/Externals";
import { TRS } from "../Parser/Types";
import { HaskellTranslator } from "./HaskellTranslator";
import { JSTranslator } from "./JSTranslator";
import { OCamlTranslator } from "./OCamlTranslator";
import { Translator } from "./Translator";

export function translate<Target extends Targets>(
    trs: TRS,
    target: Target,
    externals: ExternalsFactory<string>
): string {
    let translator: Translator<Target, ArithmeticExternals>;

    switch (target) {
        case 'ocaml':
            translator = new OCamlTranslator(
                trs,
                externals(target)
            );
            break;
        case 'haskell':
            translator = new HaskellTranslator(
                trs,
                externals(target)
            );
            break;
        case 'js':
            translator = new JSTranslator(
                trs,
                externals(target)
            );
            break;
    }

    return translator.translate();
}