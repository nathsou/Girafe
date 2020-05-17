import { Fun, Rule, Term, TRS, Symb } from "../../Parser/Types";
import { CompilerPass, CompilationResult } from "./CompilerPass";
import { arity, genVars, mostGeneralFun, fun, addRules, head, decons } from "../Utils";
import { Ok } from "../../Types";

const appSymb = 'App';

const Arity = (name: Symb, ar: number): Rule => [fun('Arity', fun(name)), fun(`${ar}`)];
const App = (name: Symb, arg: Term) => fun(appSymb, fun(name), arg);

export const currify: CompilerPass = (trs: TRS): CompilationResult => {
    const newRules: Rule[] = [];

    for (const [name, rules] of trs.entries()) {
        const ar = arity(rules);
        const names = genVars(ar);

        if (ar > 0) {
            const curriedRule: Rule = [
                curryFun({ name, args: names }),
                mostGeneralFun(name, ar)
            ];

            newRules.push(curriedRule, Arity(name, ar));
        }
    }

    addRules(trs, ...newRules);

    return Ok(trs);
};

export const curryFun = ({ name, args }: Fun): Fun => (
    curryFunAux(name, [...args].reverse())
);

const curryFunAux = (name: string, args: Term[]): Fun => {
    if (args.length === 0) return App(name, 'x');
    if (args.length === 1) return App(name, head(args));

    const [h, tl] = decons(args);
    return {
        name: appSymb,
        args: [curryFunAux(name, tl), h]
    };
};