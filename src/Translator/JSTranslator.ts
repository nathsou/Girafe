/* eslint-disable no-case-declarations */
import { DecisionTree, isOccurence } from "../Compiler/DecisionTrees/DecisionTree";
import { OccTerm, _ } from "../Compiler/DecisionTrees/DecisionTreeCompiler";
import { DecisionTreeTranslator } from "../Compiler/DecisionTrees/DecisionTreeTranslator";
import { collectTRSArities } from "../Compiler/Passes/Lazify";
import { fun, isVar, zip } from "../Compiler/Utils";
import { Externals } from "../Externals/Externals";
import { Dict, dictHas, Term, TRS } from "../Parser/Types";
import { map, mapString, setMap, format, indent } from "../Parser/Utils";
import { symbolMap } from "./Translator";

const nullarySymbolsPrefix = 'symb_';
const natRegex = /^[0-9]+$/;

const isNat = (str: string): boolean => natRegex.test(str);
export const makeBigNat = (nat: string): string => `${nat}n`;
export const makeNat = (nat: string): string => `${nat}`;

export const nullaryVarName = (f: string): string => {
    return `${nullarySymbolsPrefix}${mapString(f, c => symbolMap[c] ?? c)}`;
};

type FunCall = { funName: string, args: JSExpr[] };
type JSExpr = string | FunCall | Term;

function isFunCall(val: unknown): val is FunCall {
    return typeof val === 'object' && dictHas(val as Dict<unknown>, 'funName');
}

export class JSTranslator<Exts extends string>
    extends DecisionTreeTranslator<'js', Exts> {

    private nullaries: Set<string>;
    private nat: (nat: string) => string;

    constructor(
        trs: TRS,
        externals: Externals<'js', Exts>,
        nat = makeBigNat
    ) {
        super(trs, externals);
        this.nat = nat;
        this.declareNullarySymbols();
    }

    private declareNullarySymbols() {
        this.nullaries = new Set();

        if (['equ', 'gtr', 'geq', 'lss', 'leq'].some(f => dictHas(this.externals, f))) {
            this.nullaries.add('True');
            this.nullaries.add('False');
        }

        const symbs = collectTRSArities(this.trs);

        for (const [symb, ar] of symbs) {
            if (ar === 0 && !isNat(symb)) {
                this.nullaries.add(symb);
            }
        }

        const decl = setMap(this.nullaries, f => `const ${nullaryVarName(f)} = { name: "${f}", args: [] };`);

        this.header.unshift(...decl);
    }

    public accessSubterm(parent: string, childIndex: number): string {
        return `${parent}.args[${childIndex}]`;
    }

    protected init(): void {
        this.header.push(
            format(
                'function isFun(term) {',
                'return typeof term === "object";',
                '}'
            ),
            format(
                'function isVar(term) {',
                'return typeof term === "string";',
                '}'
            ),
            format(
                'function isNat(term) {',
                'const t = typeof term;',
                'return t === "number" || t === "bigint"',
                '}'
            ),
            `function showTerm(term) {
                if (isVar(term)) return term;
                if (isNat(term)) return term.toString();
                if (term.args.length === 0) return term.name;
                
                const terms = [term];
                const stack = [];
                const symbols = [];
                
                // flatten the terms onto a stack
                while (terms.length > 0) {
                    const t = terms.pop();
                
                    if (isVar(t) || isNat(t)) {
                        stack.push(t.toString());
                    } else if (t.args.length === 0) {
                        stack.push(t.name);
                    } else {
                        for (let i = t.args.length - 1; i >= 0; i--) {
                            terms.push(t.args[i]);
                        }
                    
                        terms.push(t.name);
                        symbols.push([t.name, t.args.length]);
                    }
                }
                
                const argsStack = [];
                
                // assemble constructors back when all arguments have been stringified
                for (let i = stack.length - 1; i >= 0; i--) {
                    const t = stack[i];
                    if (symbols.length === 0) break;
                    const [f, ar] = symbols[symbols.length - 1];
                
                    if (t === f) {
                        const args = [];
                        for (let k = 0; k < ar; k++) {
                            args.push(argsStack.pop());
                        }
                
                        argsStack.push(f + '(' + args.join(', ') + ')');
                        symbols.pop();
                    } else {
                        argsStack.push(t);
                    }
                }
                
                return argsStack[0];
            }`
        );
    }

    public callTerm(term: Term): JSExpr {
        if (isVar(term)) return term;

        // if this is a free constructor simply output a term
        if (!this.isDefined(term.name)) {
            return this.translateTerm(
                fun(term.name,
                    ...term.args.map(t => this.translateJSExpr(this.callTerm(t)))
                )
            );
        }

        // otherwise call the corresponding js function
        const args = term.args.map(t => this.translateJSExpr(this.callTerm(t)));
        return { funName: term.name, args };
    }

    private callOccTerm(occ: OccTerm, varNames: string[]): JSExpr {
        if (isOccurence(occ)) return this.translateOccurence(occ, varNames);

        // if this is a free constructor simply output a term
        if (!this.isDefined(occ.name)) {
            return this.translateTerm(
                fun(occ.name,
                    ...occ.args.map(t => this.translateJSExpr(this.callOccTerm(t, varNames)))
                )
            );
        }

        // otherwise call the corresponding js function
        const args = occ.args.map(t => this.translateJSExpr(this.callOccTerm(t, varNames)));
        return { funName: occ.name, args };
    }

    private translateOccurence(occ: OccTerm, varNames: string[]): string {
        if (isOccurence(occ)) {
            if (occ.pos.length === 0) return varNames[occ.index];
            return occ.pos.reduce((p, i) => `${p}.args[${i}]`, varNames[occ.index]);
        }

        if (occ.args.length === 0) return occ.name;
        return `${occ.name} (${occ.args.map(o => this.translateOccurence(o, varNames)).join(', ')})`;
    }

    public translateDecisionTree(name: string, dt: DecisionTree, varNames: string[]): string {
        let hasTailRecursiveLeaf = false;

        const translate = (tree: DecisionTree): string => {
            switch (tree.type) {
                case 'fail':
                    return 'return ' + this.translateTerm(fun(name, ...varNames)) + ';';
                case 'leaf':
                    const ret = this.callOccTerm(tree.action, varNames);

                    // check if this is a tail recursive call
                    if (isFunCall(ret) && ret.funName === name) {
                        const newArgs = ret.args.map(this.translateJSExpr);
                        const updateArgs = map(
                            zip(varNames, newArgs),
                            ([v, newVal]) => `const ${v}_ = ${newVal};`
                        );

                        const copyArgs = varNames.map(v => `${v} = ${v}_;`);

                        hasTailRecursiveLeaf = true;

                        return indent(1,
                            '{',
                            ...updateArgs,
                            ...copyArgs,
                            'continue;',
                            '}'
                        );
                    }

                    return `return ${this.translateJSExpr(ret)};`;
                case 'switch':
                    const cases: string[] = [];

                    for (const [ctor, A] of tree.tests) {
                        cases.push(indent(0,
                            (ctor === _ ? 'default:' : `case ${isNat(ctor) ? this.nat(ctor) : `"${ctor}"`}:`),
                            indent(1, translate(A))
                        ));
                    }

                    const occName = this.translateOccurence(tree.occurence, varNames);

                    return indent(1,
                        `switch (isFun(${occName}) ? ${occName}.name : ${occName}) {`,
                        indent(1, cases.join('\n')),
                        '}'
                    );
            }
        };

        const tree = translate(dt);

        const body = hasTailRecursiveLeaf ?
            `while(true) {\n ${tree} \n}` :
            tree;

        return indent(0,
            'function ' + name + '(' + varNames.join(', ') + ') {',
            body,
            '}'
        );
    }

    public translateTerm(term: Term): string {
        if (isVar(term)) return term;
        if (isNat(term.name)) return this.nat(term.name);
        if (term.args.length === 0 && this.nullaries.has(term.name)) {
            return nullaryVarName(term.name);
        }

        return `{ name: "${term.name}", args: [${term.args.map(this.translateTerm).join(', ')}] }`;
    }

    public translateJSExpr(expr: JSExpr): string {
        if (typeof expr === 'string') return expr;

        if (isFunCall(expr)) {
            return `${expr.funName}(${expr.args.map(this.translateJSExpr).join(', ')})`;
        }

        return this.translateTerm(expr);
    }

}