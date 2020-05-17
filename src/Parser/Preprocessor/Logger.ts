import { PrepocessorPass } from "./Preprocessor";
import { Source } from "../Source";

export const log: PrepocessorPass = async (src: Source) => {
    console.log(src);
    console.log(src.asString());
};