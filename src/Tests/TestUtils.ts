import { isFunLeftLinear } from "../Compiler/Passes/Checks";
import { substitute, vars, occurs } from "../Compiler/Utils";
import { specialCharacters } from "../Parser/Lexer/SpecialChars";
import { Fun, dictGet, dictHas, dictKeys, Rule, Substitution, Symb, Term, Var } from "../Parser/Types";
import { gen, randomElement, randomInt } from "../Parser/Utils";

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

export const randomLeftLinearFun = (eps = 0.1, varProb = 0.5, maxArgs = 5, maxDepth = 3): Fun => {
    const args = [...gen(
        randomInt(0, maxArgs),
        () => randomLeftLinearTerm(eps, varProb, maxArgs, maxDepth - 1)
    )];

    const term: Fun = {
        name: randomSymb(eps),
        args
    };

    // ensure the term is left linear
    if (!isFunLeftLinear(term)) {
        return randomLeftLinearFun(eps, varProb, maxArgs, maxDepth);
    }

    return term;
};

export const randomTerm = (eps = 0.1, varProb = 0.5, maxArgs = 10, maxDepth = 3): Term => {
    if (maxDepth === 0 || Math.random() < varProb) return randomVar(eps);
    return randomFun(eps, varProb, maxArgs, maxDepth);
};

export const randomLeftLinearTerm = (eps = 0.1, varProb = 0.5, maxArgs = 10, maxDepth = 3): Term => {
    if (maxDepth === 0 || Math.random() < varProb) return randomVar(eps);
    return randomLeftLinearFun(eps, varProb, maxArgs, maxDepth);
};

export const randomRule = (eps = 0.1): Rule => {
    return [randomFun(eps), randomTerm(eps)];
};

export const randomLeftLinenarRule = (eps = 0.1): Rule => {
    return [randomLeftLinearFun(eps), randomTerm(eps)];
};

export const randomTRS = (eps = 0.1): Rule[] => {
    return [...gen(
        Math.floor(Math.random() * 20),
        () => randomRule(eps)
    )];
};

export const randomLeftLinearTRS = (eps = 0.1): Rule[] => {
    return [...gen(
        Math.floor(Math.random() * 20),
        () => randomLeftLinenarRule(eps)
    )];
};

export const randomSubstitution = (term: Term, eps = 0.1, mutateProb = 0.5): Substitution => {
    const sigma: Substitution = {};

    for (const v of vars(term)) {
        if (Math.random() < mutateProb) {
            const randTerm = randomTerm(eps);
            if (!occurs(v, randTerm)) {
                sigma[v] = randTerm;
            }
        }
    }

    return sigma;
};

export const mutateTerm = (term: Term, eps = 0.1, mutateProb = 0.5): [Term, Substitution] => {
    const sigma = randomSubstitution(term, eps, mutateProb);
    return [substitute(term, sigma), sigma];
};

export const substIn = (a: Substitution, b: Substitution): boolean => {
    for (const varName of dictKeys(a)) {
        if (dictGet(a, varName) !== varName && !dictHas(b, varName)) return false;
    }

    return true;
};

export const substsEq = (a: Substitution, b: Substitution): boolean => {
    return substIn(a, b) && substIn(b, a);
};