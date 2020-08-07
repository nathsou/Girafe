/* eslint-disable no-case-declarations */
import { DecisionTree, isOccurence } from "../Compiler/DecisionTrees/DecisionTree";
import { OccTerm, _ } from "../Compiler/DecisionTrees/DecisionTreeCompiler";
import { DecisionTreeTranslator } from "../Compiler/DecisionTrees/DecisionTreeTranslator";
import { fun, isVar, zip } from "../Compiler/Utils";
import { repeatString } from "../Normalizer/Matchers/ClosureMatcher/Closure";
import { SpecialCharacters } from "../Parser/Lexer/SpecialChars";
import { dictHas, Externals, Term, TRS, Dict } from "../Parser/Types";
import { map, mapString } from "../Parser/Utils";

const translateTerm = (term: Term): string => {
    if (isVar(term)) return term;
    return `{ name: "${term.name}", args: [${term.args.map(translateTerm).join(', ')}] }`;
};

type FunCall = { funName: string, args: JSExpr[] };
type JSExpr = string | FunCall | Term;

const stringifyJSExpr = (exp: JSExpr): string => {
    if (typeof exp === 'string') return exp;

    if (isFunCall(exp)) {
        return `${exp.funName}(${exp.args.map(stringifyJSExpr).join(', ')})`;
    }

    return translateTerm(exp);
};

function isFunCall(val: unknown): val is FunCall {
    return typeof val === 'object' && dictHas(val as Dict<unknown>, 'funName');
}

export const symbolMap: { [key in SpecialCharacters]: string } = {
    '.': '_dot_',
    '-': '_minus_',
    '~': '_tilde_',
    '+': '_plus_',
    '*': '_star_',
    '&': '_ampersand_',
    '|': '_pipe_',
    '/': '_slash_',
    '\\': '_backslash_',
    '^': '_caret_',
    '%': '_percent_',
    '°': '_num_',
    '$': '_dollar_',
    '@': '_at_',
    '#': '_hash_',
    ';': '_semicolon_',
    ':': '_colon_',
    '_': '_',
    '=': '_eq_',
    "'": '_prime_',
    '>': '_gtr_',
    '<': '_lss_',
    '!': '_exclamation_mark_'
};

const tabs = (count: number): string => repeatString('   ', count);

const ident = (tabCount: number, ...lines: string[]): string => {
    const ident = tabs(tabCount);
    return lines.map(l => `${ident}${l}`).join('\n');
};

const format = (...lines: string[]): string => {
    let tabCount = 0;
    const idented: string[] = [];

    for (const line of lines) {
        if (line.endsWith('{')) {
            idented.push(ident(tabCount, line));
            tabCount++;
            continue;
        } else if (line.endsWith('}')) {
            tabCount--;
        }

        idented.push(ident(tabCount, line));
    }

    return idented.join('\n');
};

export class JSTranslator<Exts extends string>
    extends DecisionTreeTranslator<'js', Exts> {

    constructor(trs: TRS, externals: Externals<'js', Exts>) {
        super(trs, externals);
    }

    accessSubterm(parent: string, childIndex: number): string {
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
                'function showTerm(term) {',
                'if (isVar(term)) return term;',
                'if (term.args.length === 0) return term.name;',
                "return term.name + '(' +  term.args.map(showTerm).join(', ') + ')';",
                '}'
            )
        );
    }

    private callTerm(occ: OccTerm, varNames: string[]): JSExpr {
        if (isOccurence(occ)) return this.translateOccurence(occ, varNames);

        // if this is a free constructor simply output a term
        if (!this.isDefined(occ.name)) {
            return translateTerm(
                fun(occ.name,
                    ...occ.args.map(t => stringifyJSExpr(this.callTerm(t, varNames)))
                )
            );
        }

        // otherwise call the corresponding js function
        const args = occ.args.map(t => stringifyJSExpr(this.callTerm(t, varNames)));
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

    translateDecisionTree(name: string, dt: DecisionTree, varNames: string[]): string {
        let hasTailRecursiveLeaf = false;

        const translate = (tree: DecisionTree): string => {
            switch (tree.type) {
                case 'fail':
                    return 'return ' + translateTerm(fun(name, ...varNames)) + ';';
                case 'leaf':
                    const ret = this.callTerm(tree.action, varNames);

                    // check if this is a tail recursive call
                    if (isFunCall(ret) && ret.funName === name) {
                        const newArgs = ret.args.map(stringifyJSExpr);
                        const updateArgs = map(
                            zip(varNames, newArgs),
                            ([v, newVal]) => `const ${v}_ = ${newVal};`
                        );

                        const copyArgs = varNames.map(v => `${v} = ${v}_;`);

                        hasTailRecursiveLeaf = true;

                        return ident(1,
                            '{',
                            ...updateArgs,
                            ...copyArgs,
                            'continue;',
                            '}'
                        );
                    }

                    return `return ${stringifyJSExpr(ret)};`;
                case 'switch':
                    const cases: string[] = [];

                    for (const [ctor, A] of tree.tests) {
                        cases.push(ident(0,
                            (ctor === _ ? 'default:' : 'case "' + ctor + '":'),
                            ident(1, translate(A))
                        ));
                    }

                    const occName = this.translateOccurence(tree.occurence, varNames);

                    return ident(1,
                        'switch (isFun(' + occName + ') ? ' + occName + '.name : null) {',
                        ident(1, cases.join('\n')),
                        '}'
                    );
            }
        };

        const tree = translate(dt);

        const body = hasTailRecursiveLeaf ?
            `while(true) {\n ${tree} \n}` :
            tree;

        return ident(0,
            'function ' + name + '(' + varNames.join(', ') + ') {',
            body,
            '}'
        );
    }

    rename(name: string): string {
        const noSymbols = mapString(name, c => symbolMap[c] ?? c);

        return `grf_${noSymbols}`;
    }

    translateTerm(term: Term): string {
        return translateTerm(term);
    }

}