import { Symb, Term, Fun } from "../../Parser/Types";
export declare const factorOutTree: (α: Symb, M: Term[]) => Fun[];
export declare const prependTree: (α: string | Fun, terms: Fun[]) => Fun[];
export declare const repeatTree: (α: Symb, n: number) => Fun;
export declare const closureTree: (M: Fun[], arities: Map<Symb, number>) => Fun[];
