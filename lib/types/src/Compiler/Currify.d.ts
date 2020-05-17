import { Fun } from "../Parser/Types";
import { CompilerPass } from "./CompilerPass";
export declare const currify: CompilerPass;
export declare const curryFun: ({ name, args }: Fun) => Fun;
