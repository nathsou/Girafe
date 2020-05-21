import { isError, unwrap } from "../../Types";
import { Source } from "../Source";
import { PrepocessorPass, preprocess } from "./Preprocessor";
import { Symb } from "../Types";
import { specialCharacters } from "../Lexer/SpecialChars";

export type FileReader = (path: string) => Promise<string>;

// import "arith.grf" (+, -, *, %, >)

const symb = `[${specialCharacters.map((c) => `\\${c}`).join("")}a-zA-Z0-9]+`;
const pattern =
  `^\\s*(import)\\s*\\"(${symb})\\"\\s*(\\(((\\s*${symb}\\,)*\\s*${symb})\\))?$`;

export type ImportInfos = {
  importPass: {
    includedPaths: Map<string, Symb[]>;
  };
};

export const handleImports = (
  fileReader: FileReader,
): PrepocessorPass<ImportInfos> => {
  return async (
    src: Source,
    passes: PrepocessorPass<ImportInfos>[],
    info: ImportInfos,
  ) => {
    if (!info.importPass) {
      info.importPass = {
        includedPaths: new Map(),
      };
    }

    for (const [line, idx] of src.linesReversed()) {
      const matches = new RegExp(pattern).exec(line);
      if (matches) {
        const path = matches[2];
        if (!info.importPass.includedPaths.has(path)) {
          const namedImports = matches[4]?.split(",").map((s) => s.trim()) ?? [];
          info.importPass.includedPaths.set(path, namedImports);
          const contents = await fileReader(path);
          const preprocessed = await preprocess(contents, passes, info);

          if (isError(preprocessed)) {
            return unwrap(preprocessed);
          }

          src.removeLines(idx, 1);
          src.insert(idx, unwrap(preprocessed));
        } else {
          src.removeLines(idx, 1);
        }
      }
    }
  };
};
