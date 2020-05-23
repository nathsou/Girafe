import { DecisionTree, isOccurence } from "../Compiler/DecisionTrees/DecisionTree";
import { OccTerm, _ } from "../Compiler/DecisionTrees/DecisionTreeCompiler";
import { DecisionTreeTranslator } from "../Compiler/DecisionTrees/DecisionTreeTranslator";
import { fun, isVar } from "../Compiler/Utils";
import { repeatString } from "../Normalizer/Matchers/StringMatcher/Closure";
import { SpecialCharacters } from "../Parser/Lexer/SpecialChars";
import { Externals, Term, TRS } from "../Parser/Types";
import { mapString } from "../Parser/Utils";

const translateTerm = (term: Term): string => {
    if (isVar(term)) return term;
    return `{ name: "${term.name}", args: [${term.args.map(translateTerm).join(', ')}] }`;
};

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
    ">": '_gtr_',
    "<": '_lss_'
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

    protected init() {
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

    private callTerm(occ: OccTerm, varNames: string[]): string {
        if (isOccurence(occ)) return this.translateOccurence(occ, varNames);
        if (!this.isDefined(occ.name)) {
            return this.translateTerm(
                fun(occ.name, ...occ.args.map(t => this.callTerm(t, varNames)))
            );
        }

        const args = `${occ.args.map(t => this.callTerm(t, varNames)).join(', ')}`;
        return `${occ.name}(${args})`;
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
        const translate = (tree: DecisionTree): string => {
            switch (tree.type) {
                case 'fail':
                    return 'return ' + translateTerm(fun(name, ...varNames)) + ';';
                case 'leaf':
                    return 'return ' + this.callTerm(tree.action, varNames) + ';';
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

        return ident(0,
            'function ' + name + '(' + varNames.join(', ') + ') {',
            translate(dt),
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