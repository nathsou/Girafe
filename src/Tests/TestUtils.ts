import { gen, randomElement } from "../Parser/Utils";
import { specialCharacters } from "../Parser/Lexer/SpecialChars";
import { Symb, Var, Fun, Term, Rule, Substitution, mapKeys, mapHas, mapGet } from "../Parser/Types";
import { vars, substitute } from "../Compiler/Utils";

export const digits = [...gen(10, i => `${i}`)];
export const lowerCaseLetters = [...gen(26, i => String.fromCharCode(97 + i))];
export const upperCaseLetters = [...gen(26, i => String.fromCharCode(65 + i))];

export const alphaNum = [
    ...lowerCaseLetters,
    ...upperCaseLetters,
    ...digits
];

export const symbChars = [
    ...upperCaseLetters,
    ...digits,
    ...specialCharacters
];

export const allowedChars = [
    ...lowerCaseLetters,
    ...symbChars
];

export const randomSymb = (eps = 0.1): Symb => {
    let symb = randomElement(symbChars);
    while (Math.random() > eps) {
        symb += randomElement(allowedChars);
    }

    if (symb.includes('->')) return randomSymb(eps);
    return symb;
};

export const randomVar = (eps = 0.1): Var => {
    let name = randomElement(lowerCaseLetters);
    while (Math.random() > eps) {
        name += randomElement(alphaNum);
    }

    return name;
};

export const randomFun = (eps = 0.1, varProb = 0.5, maxArgs = 5, maxDepth = 3): Fun => {
    return {
        name: randomSymb(eps),
        args: [...gen(
            Math.floor(Math.random() * maxArgs),
            () => randomTerm(eps, varProb, maxArgs, maxDepth - 1)
        )]
    };
};

export const randomTerm = (eps = 0.1, varProb = 0.5, maxArgs = 10, maxDepth = 3): Term => {
    if (maxDepth === 0 || Math.random() < varProb) return randomVar(eps);
    return randomFun(eps, varProb, maxArgs, maxDepth);
};

export const randomRule = (eps = 0.1): Rule => {
    return [randomFun(eps), randomTerm(eps)];
};

export const randomTRS = (eps = 0.1): Rule[] => {
    return [...gen(
        Math.floor(Math.random() * 20),
        () => randomRule(eps)
    )];
};

export const randomSubstitution = (term: Term, eps = 0.1, mutateProb = 0.5): Substitution => {
    const sigma: Substitution = {};

    for (const v of vars(term)) {
        if (Math.random() < mutateProb) {
            sigma[v] = randomVar(eps);
        }
    }

    return sigma;
};

export const mutateTerm = (term: Term, eps = 0.1, mutateProb = 0.5): [Term, Substitution] => {
    const sigma = randomSubstitution(term, eps, mutateProb);
    return [substitute(term, sigma), sigma];
};

export const substIn = (a: Substitution, b: Substitution): boolean => {
    for (const varName of mapKeys(a)) {
        if (mapGet(a, varName) !== varName && !mapHas(b, varName)) return false;
    }

    return true;
};

export const substsEq = (a: Substitution, b: Substitution): boolean => {
    return substIn(a, b) && substIn(b, a);
};