import { Symb, Term } from "../../Parser/Types";
import { either } from "../../Types";
import { showTerm } from "../Utils";
import { AnyPat, Occcurence } from "./DecisionTreeCompiler";

export type Leaf = { type: 'leaf', action: Term };
export type Fail = { type: 'fail' };

export type Switch = {
    type: 'switch',
    occurence: Occcurence,
    tests: Array<[(Symb | AnyPat), DecisionTree]>
};

export type DecisionTree = Leaf | Fail | Switch;

export const makeLeaf = (action: Term): Leaf => ({ type: 'leaf', action });
export const makeFail = (): Fail => ({ type: 'fail' });
export const makeSwitch = (occurence: Occcurence, tests: Switch['tests']): Switch => {
    return {
        type: 'switch',
        occurence,
        tests
    };
};

const showOccurence = (occ: Occcurence): string => {
    const val = either(occ.value, showOccurence, showTerm);
    if (occ.index !== undefined) return `${val}[${occ.index}]`;
    return val;
};

export const showDecisionTree = (tree: DecisionTree): string => {
    switch (tree.type) {
        case 'fail':
            return 'fail;';
        case 'leaf':
            return `return ${showTerm(tree.action)};`;
        case 'switch':
            const tests: string[] = [];

            for (const [ctor, A] of tree.tests) {
                if (ctor === '_') {
                    tests.push(`default:
                        ${showDecisionTree(A)}
                    `);
                } else {
                    tests.push(`case "${ctor}":
                        ${showDecisionTree(A)}
                    `);
                }
            }

            return `switch (${showOccurence(tree.occurence)}) {
                ${tests.join('\n')}
            }`;
    }
};