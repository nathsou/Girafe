import { Symb, Term, TRS } from "../../Parser/Types";
import { CompilerPass } from "./CompilerPass";
export declare type LazinessAnnotations = Map<Symb, boolean[]>;
export declare type Arities = Map<Symb, number>;
export declare const lazify: CompilerPass;
export declare const collectTRSArities: (trs: TRS) => Arities;
export declare const collectArity: (t: Term, arities: Arities) => void;
