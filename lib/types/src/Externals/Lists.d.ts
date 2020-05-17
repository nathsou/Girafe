import { Term, JSExternals } from "../Parser/Types";
export declare const listOf: (elems: Term[]) => Term;
export declare type ListExternals = 'splitHead';
export declare const listExternals: JSExternals<ListExternals>;
