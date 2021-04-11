import { format } from "../Parser/Utils";
import { Ast, ImperativeLangTranslator } from "./ImperativeLangTranslator";
import { SourceCode, isNat } from "./Translator";

export const bigNatOf = (nat: string): string => `${nat}n`;
export const natOf = (nat: string): string => `${nat}`;

export class JSTranslator<Exts extends string> extends ImperativeLangTranslator<'js', Exts> {
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
                'return t === "number" || t === "bigint";',
                '}'
            )
        );
    }

    protected translateAst(ast: Ast): SourceCode {
        const tr = this.translateAst.bind(this);

        switch (ast.type) {
            case 'var':
                return ast.name;
            case 'assign':
                return `${ast.lhs} = ${ast.rhs};`;
            case 'block':
                return `{
                    ${ast.statements.map(s => tr(s)).join('\n')}
                }`;
            case 'const_decl':
                return `const ${ast.name} = ${ast.value};`;
            case 'continue':
                return 'continue;';
            case 'fun':
                if (isNat(ast.name)) return this.natOf(ast.name);
                return `{ name: "${ast.name}", args: [${ast.args.map(a => tr(a)).join(', ')}] }`;
            case 'function_call':
                return `${ast.funName}(${ast.args.map(a => tr(a)).join(', ')})`;
            case 'function_decl':
                return `function ${ast.name}(${ast.argNames.join(', ')}) {
                    ${tr(ast.body)}
                }`;
            case 'infinite_loop':
                return `while (true) {
                    ${tr(ast.body)}
                }`;
            case 'nat':
                return ast.value;
            case 'raw':
                return ast.value;
            case 'return':
                return `return ${tr(ast.value)};`;
            case 'string':
                return `"${ast.value}"`;
            case 'subterm_access':
                return `${tr(ast.parent)}.args[${ast.childIndex}]`;
            case 'switch':
                return `switch (${tr(ast.testedValue)}) {
                    ${ast.cases.map(c => {
                    if (c.type === 'case') {
                        return `case ${tr(c.test)}:
                                ${tr(c.body)}
                            `;
                    } else {
                        return `default: 
                            ${tr(c.body)}
                        `;
                    }
                }).join('\n')}
                }`;
            case 'term_name':
                const t = tr(ast.term);
                return `${t}.name || ${t}`;
        }
    }

}