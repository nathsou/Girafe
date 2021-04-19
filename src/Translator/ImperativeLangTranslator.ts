import { DecisionTree, isOccurence } from "../Compiler/DecisionTrees/DecisionTree";
import { OccTerm, _ } from "../Compiler/DecisionTrees/DecisionTreeCompiler";
import { DecisionTreeTranslator } from "../Compiler/DecisionTrees/DecisionTreeTranslator";
import { fun, isVar, zip } from "../Compiler/Utils";
import { Externals, Targets } from "../Externals/Externals";
import { Dict, dictHas, Symb, Term, TRS, Var } from "../Parser/Types";
import { map } from "../Parser/Utils";
import { isNat, nullaryVarName, SourceCode } from './Translator';

export type Ast =
    ConstVarDecl |
    VariableUse |
    NatExpr |
    FunTermUse |
    FunctionCall |
    FunctionDecl |
    Block |
    SwitchStatement |
    ReturnStatement |
    AssignmentStatement |
    ContinueStatement |
    SubtermAccess |
    StringExpr |
    SubtermAccess |
    RawSourceCode |
    TermName |
    InfiniteLoop

type RawSourceCode = {
    type: 'raw',
    value: SourceCode
};

type SwitchCase = DefaultSwitchCase | NormalSwitchCase;

type SubtermAccess = {
    type: 'subterm_access',
    parent: Ast,
    childIndex: number
};

type DefaultSwitchCase = {
    type: 'default',
    body: Ast
};

type NormalSwitchCase = {
    type: 'case',
    test: Ast,
    body: Ast
};

export type SwitchStatement = {
    type: 'switch',
    testedValue: Ast,
    cases: SwitchCase[]
};

export type InfiniteLoop = {
    type: 'infinite_loop',
    body: Ast
};

export type FunTermUse = {
    type: 'fun',
    name: Symb,
    args: Ast[]
};

export type NatExpr = {
    type: 'nat',
    value: string
};

// returns the name of a fun or the name of a variable
export type TermName = {
    type: 'term_name',
    term: Ast
};

export type StringExpr = {
    type: 'string',
    value: string
};

export type VariableUse = {
    type: 'var',
    name: string
};

export type ReturnStatement = {
    type: 'return',
    value: Ast
};

export type ContinueStatement = {
    type: 'continue'
};

export type ConstVarDecl = {
    type: 'const_decl',
    name: string,
    value: SourceCode
};

export type FunctionDecl = {
    type: 'function_decl',
    name: string,
    argNames: Var[],
    body: Ast
};

export type FunctionCall = {
    type: 'function_call',
    funName: string,
    args: Ast[]
};

export type AssignmentStatement = {
    type: 'assign',
    lhs: SourceCode,
    rhs: SourceCode
};

export type Block = {
    type: 'block',
    statements: Ast[]
};

// Terms are extented to include function calls for defined terms
// free / undefined terms are represented by ordinary terms
type FunCall = { funName: string, args: ExtendedTerm[] };
type ExtendedTerm = FunCall | Term;

function isFunCall(val: unknown): val is FunCall {
    return typeof val === 'object' && dictHas(val as Dict<unknown>, 'funName');
}

// a translator for imperative programming languages like c
export abstract class ImperativeLangTranslator<Target extends Targets, Exts extends string>
    extends DecisionTreeTranslator<Target, Exts> {

    protected natOf: (nat: string) => string;

    constructor(
        trs: TRS,
        externals: Externals<Target, Exts>,
        natOf = (nat: string) => `${nat}`
    ) {
        super(trs, externals);
        this.natOf = natOf;
    }

    protected abstract translateAst(ast: Ast): SourceCode;

    protected declareNullary(varName: string, symb: string): SourceCode {
        return this.translateAst({
            type: 'const_decl',
            name: varName,
            value: this.translateTerm({ name: symb, args: [] }, false)
        });
    }

    translateTerm(term: Term, useNullaryVars = false): SourceCode {
        if (isVar(term)) {
            return this.translateAst({
                type: 'var',
                name: term
            });
        }

        if (useNullaryVars && term.args.length === 0) {
            if (isNat(term.name)) {
                return this.translateAst({
                    type: 'nat',
                    value: this.natOf(term.name)
                });
            }

            return this.translateAst({
                type: 'var',
                name: nullaryVarName(term.name)
            });
        }

        return this.translateAst({
            type: 'fun',
            name: term.name,
            args: term.args.map(a => this.astOfTerm(a))
        });
    }

    accessSubterm(parent: SourceCode, childIndex: number): SourceCode {
        return this.translateAst({
            type: 'subterm_access',
            parent: { type: 'raw', value: parent },
            childIndex
        });
    }

    public translateExtendedTerm(t: ExtendedTerm): SourceCode {
        if (typeof t === 'string') return t;

        if (isFunCall(t)) {
            return this.translateAst({
                type: 'function_call',
                funName: t.funName,
                args: t.args.map(s => this.astOfExtendedTerm(s))
            });
        }

        return this.translateTerm(t, true);
    }

    private translateOccurence(occ: OccTerm, varNames: string[]): SourceCode {
        if (isOccurence(occ)) {
            if (occ.pos.length === 0) return varNames[occ.index];
            return occ.pos.reduce((p, i) => this.accessSubterm(p, i), varNames[occ.index]);
        }

        if (occ.args.length === 0) return occ.name;
        return `${occ.name} (${occ.args.map(o => this.translateOccurence(o, varNames)).join(', ')})`;
    }

    private callOccurence(occ: OccTerm, varNames: string[]): ExtendedTerm {
        if (isOccurence(occ)) return this.translateOccurence(occ, varNames);

        // if this is a free constructor simply output a term
        if (!this.isDefined(occ.name)) {
            return this.translateTerm(
                fun(occ.name,
                    ...occ.args.map(t => this.translateExtendedTerm(this.callOccurence(t, varNames)))
                ),
                true
            );
        }

        // otherwise call the corresponding js function
        const args = occ.args.map(t => this.translateExtendedTerm(this.callOccurence(t, varNames)));
        return { funName: occ.name, args };
    }

    private astOfTerm(t: Term): Ast {
        if (isVar(t)) return { type: 'var', name: t };
        return {
            type: 'fun',
            name: t.name,
            args: t.args.map(s => this.astOfTerm(s))
        };
    }

    private astOfExtendedTerm(t: ExtendedTerm): Ast {
        if (isFunCall(t)) {
            return {
                type: 'function_call',
                funName: t.funName,
                args: t.args.map(s => this.astOfExtendedTerm(s))
            };
        }

        return this.astOfTerm(t);
    }

    private astOfOccurence(occ: OccTerm, varNames: string[]): Ast {
        return { type: 'raw', value: this.translateOccurence(occ, varNames) };
    }

    private compileDecisionTree = (name: string, dt: DecisionTree, varNames: string[]): Ast => {
        let hasTailRecursiveCall = false;

        const translate = (tree: DecisionTree): Ast => {
            switch (tree.type) {
                case 'fail':
                    // pattern matching failed
                    // return a free instance of the term with its arguments
                    return {
                        type: 'return',
                        value: this.astOfTerm(fun(name, ...varNames))
                    };

                case 'leaf':
                    const ret = this.callOccurence(tree.action, varNames);

                    // check if this is a tail recursive call
                    if (isFunCall(ret) && ret.funName === name) {
                        // create temporary variables to store updated arguments
                        // since they might require the original arguments values
                        // which should therefore not be updated right away
                        const newArgs = ret.args.map(a => this.translateExtendedTerm(a));
                        const updateArgs: Iterable<ConstVarDecl> = map(
                            zip(varNames, newArgs),
                            ([v, newVal]) => ({
                                type: 'const_decl',
                                name: `${v}_`,
                                value: newVal
                            })
                        );

                        // copy the updated arguments back
                        const copyArgs: AssignmentStatement[] = varNames.map(v => ({
                            type: 'assign',
                            lhs: v,
                            rhs: `${v}_`
                        }));

                        hasTailRecursiveCall = true;

                        return {
                            type: 'block',
                            statements: [
                                ...updateArgs,
                                ...copyArgs,
                                { type: 'continue' }
                            ]
                        };
                    } else {
                        return {
                            type: 'return',
                            value: this.astOfExtendedTerm(ret)
                        };
                    }

                case 'switch':
                    const cases: SwitchCase[] = [];

                    for (const [ctor, A] of tree.tests) {
                        if (ctor === _) {
                            cases.push({
                                type: 'default',
                                body: translate(A)
                            })
                        } else {
                            cases.push({
                                type: 'case',
                                test: isNat(ctor) ?
                                    { type: 'nat', value: this.natOf(ctor) } :
                                    { type: 'string', value: ctor },
                                body: translate(A)
                            });
                        }
                    }

                    const occ = this.astOfOccurence(tree.occurence, varNames);

                    return {
                        type: 'switch',
                        testedValue: {
                            type: 'term_name',
                            term: occ
                        },
                        cases
                    };
            }
        };

        const tree = translate(dt);

        // if the function is tail recursive, wrap the body inside a while loop
        const body: Ast = hasTailRecursiveCall ?
            { type: 'infinite_loop', body: tree } :
            tree;

        return {
            type: 'function_decl',
            name,
            argNames: varNames,
            body
        };
    };

    translateDecisionTree(name: string, dt: DecisionTree, varNames: Var[]): SourceCode {
        return this.translateAst(this.compileDecisionTree(name, dt, varNames));
    }

    public callTerm(term: Term): SourceCode {
        if (isVar(term)) return term;
        if (isNat(term.name)) return this.natOf(term.name);

        // if this is a free constructor simply output a term
        if (!this.isDefined(term.name)) {
            return this.translateTerm(
                fun(term.name,
                    ...term.args.map(t => this.callTerm(t))
                )
            );
        }

        // otherwise call the corresponding js function
        const args: Ast[] = term.args.map(t => ({ type: 'raw', value: this.callTerm(t) }));

        return this.translateAst({
            type: 'function_call',
            funName: term.name,
            args: args
        });
    }
}