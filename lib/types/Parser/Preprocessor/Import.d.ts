import { PrepocessorPass } from "./Preprocessor";
import { Symb } from "../Types";
export declare type FileReader = (path: string) => Promise<string>;
export declare type ImportInfos = {
    importPass: {
        includedPaths: Map<string, Symb[]>;
    };
};
export declare const handleImports: (fileReader: FileReader) => PrepocessorPass<ImportInfos>;
