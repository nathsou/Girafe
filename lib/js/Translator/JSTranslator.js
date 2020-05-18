"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSTranslator = void 0;
const DecisionTreeTranslator_1 = require("../Compiler/DecisionTrees/DecisionTreeTranslator");
const Utils_1 = require("../Compiler/Utils");
const Types_1 = require("../Types");
const translateTerm = (term) => {
    if (Utils_1.isVar(term))
        return term;
    return `{ name: "${term.name}", args: [${term.args.map(translateTerm).join(', ')}] }`;
};
class JSTranslator extends DecisionTreeTranslator_1.DecisionTreeTranslator {
    constructor(trs, externals) {
        super(trs, externals);
    }
    accessSubterm(parent, childIndex) {
        return `${parent}.args[${childIndex}]`;
    }
    init() {
        this.header.push(`function isFun(term) {
                return typeof term === "object";
            }`, `function isVar(term) {
                return typeof term === "string";
            }`, `function showTerm(term) {
                if (isVar(term)) return term;
                if (term.args.length === 0) return term.name;
                return term.name + '(' +  term.args.map(showTerm).join(', ') + ')';
            }`);
    }
    callTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(Utils_1.fun(term.name, ...term.args.map(t => this.callTerm(t))));
        }
        const args = `${term.args.map((t) => this.callTerm(t)).join(', ')}`;
        return `${term.name}(${args})`;
    }
    translateDecisionTree(name, dt, varNames) {
        const translateOccurence = (occ) => {
            const val = Types_1.either(occ.value, translateOccurence, Utils_1.showTerm);
            if (occ.index !== undefined)
                return `${val}.args[${occ.index}]`;
            return val;
        };
        const translate = (tree) => {
            switch (tree.type) {
                case 'fail':
                    return 'throw new Error("Failed");';
                case 'leaf':
                    return `return ${this.callTerm(tree.action)};`;
                case 'switch':
                    const tests = [];
                    for (const [ctor, A] of tree.tests) {
                        if (ctor === '_') {
                            tests.push(`default:
                                ${translate(A)}
                            `);
                        }
                        else {
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
    rename(name) {
        const symbolMap = {
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
            .map(c => { var _a; return (_a = symbolMap[c]) !== null && _a !== void 0 ? _a : c; })
            .join('');
        return `grf_${noSymbols}`;
    }
    translateTerm(term) {
        return translateTerm(term);
    }
}
exports.JSTranslator = JSTranslator;
