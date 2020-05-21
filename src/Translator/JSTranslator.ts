import { DecisionTree } from "../Compiler/DecisionTrees/DecisionTree";
import { DecisionTreeTranslator } from "../Compiler/DecisionTrees/DecisionTreeTranslator";
import { isVar, showTerm, fun } from "../Compiler/Utils";
import { Externals, Term, TRS } from "../Parser/Types";
import { either } from "../Types";
import { Occcurence } from "../Compiler/DecisionTrees/DecisionTreeCompiler";
import { SpecialCharacters } from "../Parser/Lexer/SpecialChars";

const translateTerm = (term: Term): string => {
    if (isVar(term)) return term;
    return `{ name: "${term.name}", args: [${term.args.map(translateTerm).join(', ')}] }`;
};

export class JSTranslator<Exts extends string>
    extends DecisionTreeTranslator<'js', Exts> {

    constructor(trs: TRS, externals: Externals<'js', Exts>) {
        super(trs, externals);
    }

    accessSubterm(parent: string, childIndex: number): string {
        return `${parent}.args[${childIndex}]`;
    }

    protected init() {
        this.header.push(
            `function isFun(term) {
                return typeof term === "object";
            }`,
            `function isVar(term) {
                return typeof term === "string";
            }`,
            `function showTerm(term) {
                if (isVar(term)) return term;
                if (term.args.length === 0) return term.name;
                return term.name + '(' +  term.args.map(showTerm).join(', ') + ')';
            }`
        );
    }

    private callTerm(term: Term): string {
        if (isVar(term)) return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(
                fun(term.name, ...term.args.map(t => this.callTerm(t)))
            );
        }

        const args = `${term.args.map((t) => this.callTerm(t)).join(', ')}`;
        return `${term.name}(${args})`;
    }

    translateDecisionTree(name: string, dt: DecisionTree, varNames: string[]): string {
        const translateOccurence = (occ: Occcurence): string => {
            const val = either(occ.value, translateOccurence, showTerm);
            if (occ.index !== undefined) return `${val}.args[${occ.index}]`;
            return val;
        };

        const translate = (tree: DecisionTree): string => {
            switch (tree.type) {
                case 'fail':
                    return `return ${translateTerm(fun(name, ...varNames))};`;
                case 'leaf':
                    return `return ${this.callTerm(tree.action)};`;
                case 'switch':
                    const tests: string[] = [];

                    for (const [ctor, A] of tree.tests) {
                        if (ctor === '_') {
                            tests.push(`default:
                                ${translate(A)}
                            `);
                        } else {
                            tests.push(`case "${ctor}":
                                ${translate(A)}
                            `);
                        }
                    }

                    const occName = translateOccurence(tree.occurence);

                    return `switch (isFun(${occName}) ? ${occName}.name : null) {
                        ${tests.join('\n')}
                    }`;
            }
        };

        return `function ${name}(${varNames.join(', ')}) {
            ${translate(dt)}
        }`;
    }

    rename(name: string): string {
        const symbolMap: { [key in SpecialCharacters]: string } = {
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
            ">": '_gtr_',
            "<": '_lss_'
        };

        const noSymbols = name
            .split('')
            .map(c => symbolMap[c] ?? c)
            .join('');

        return `grf_${noSymbols}`;
    }

    translateTerm(term: Term): string {
        return translateTerm(term);
    }

}