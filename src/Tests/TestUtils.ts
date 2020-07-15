import { isFunLeftLinear } from "../Compiler/Passes/Checks";
import { substitute, vars, occurs } from "../Compiler/Utils";
import { specialCharacters } from "../Parser/Lexer/SpecialChars";
import { Fun, dictGet, dictHas, dictKeys, Rule, Substitution, Symb, Term, Var } from "../Parser/Types";
import { gen } from "../Parser/Utils";

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

export const randomSymb = (rnd: RandomGenerator, eps = 0.1): Symb => {
    let symb = randomElem(rnd, symbChars);
    while (rnd() > eps) {
        symb += randomElem(rnd, allowedChars);
    }

    if (symb.includes('->')) return randomSymb(rnd, eps);
    return symb;
};

export const randomInt = (rnd: RandomGenerator, from: number, to: number): number => {
    return Math.floor(from + (rnd() * (to - from)));
};

export function randomElem<T>(rnd: RandomGenerator, vals: T[]): T {
    return vals[randomInt(rnd, 0, vals.length)];
}

export const randomVar = (rnd: RandomGenerator, eps = 0.1): Var => {
    let name = randomElem(rnd, lowerCaseLetters);
    while (rnd() > eps) {
        name += randomElem(rnd, alphaNum);
    }

    return name;
};

export const randomFun = (
    rnd: RandomGenerator,
    eps = 0.1,
    varProb = 0.5,
    maxArgs = 5,
    maxDepth = 3
): Fun => {
    return {
        name: randomSymb(rnd, eps),
        args: [...gen(
            randomInt(rnd, 0, maxArgs),
            () => randomTerm(rnd, eps, varProb, maxArgs, maxDepth - 1)
        )]
    };
};

export const randomLeftLinearFun = (
    rnd: RandomGenerator,
    eps = 0.1,
    varProb = 0.5,
    maxArgs = 5,
    maxDepth = 3
): Fun => {
    const args = [...gen(
        randomInt(rnd, 0, maxArgs),
        () => randomLeftLinearTerm(rnd, eps, varProb, maxArgs, maxDepth - 1)
    )];

    const term: Fun = {
        name: randomSymb(rnd, eps),
        args
    };

    // ensure the term is left linear
    if (!isFunLeftLinear(term)) {
        return randomLeftLinearFun(rnd, eps, varProb, maxArgs, maxDepth);
    }

    return term;
};

export const randomTerm = (rnd: RandomGenerator, eps = 0.1, varProb = 0.5, maxArgs = 10, maxDepth = 3): Term => {
    if (maxDepth === 0 || rnd() < varProb) return randomVar(rnd, eps);
    return randomFun(rnd, eps, varProb, maxArgs, maxDepth);
};

export const randomLeftLinearTerm = (
    rnd: RandomGenerator,
    eps = 0.1,
    varProb = 0.5,
    maxArgs = 10,
    maxDepth = 3
): Term => {
    if (maxDepth === 0 || rnd() < varProb) return randomVar(rnd, eps);
    return randomLeftLinearFun(rnd, eps, varProb, maxArgs, maxDepth);
};

export const randomRule = (rnd: RandomGenerator, eps = 0.1): Rule => {
    return [randomFun(rnd, eps), randomTerm(rnd, eps)];
};

export const randomLeftLinenarRule = (rnd: RandomGenerator, eps = 0.1): Rule => {
    return [randomLeftLinearFun(rnd, eps), randomTerm(rnd, eps)];
};

export const randomTRS = (rnd: RandomGenerator, eps = 0.1, maxRules = 20): Rule[] => {
    return [...gen(
        randomInt(rnd, 0, maxRules),
        () => randomRule(rnd, eps)
    )];
};

export const randomLeftLinearTRS = (rnd: RandomGenerator, eps = 0.1, maxRules = 20): Rule[] => {
    return [...gen(
        randomInt(rnd, 0, maxRules),
        () => randomLeftLinenarRule(rnd, eps)
    )];
};

export const randomSubstitution = (
    rnd: RandomGenerator,
    term: Term,
    eps = 0.1,
    mutateProb = 0.5
): Substitution => {
    const sigma: Substitution = {};

    for (const v of vars(term)) {
        if (rnd() < mutateProb) {
            const randTerm = randomTerm(rnd, eps);
            if (!occurs(v, randTerm)) {
                sigma[v] = randTerm;
            }
        }
    }

    return sigma;
};

export const mutateTerm = (
    rnd: RandomGenerator,
    term: Term,
    eps = 0.1,
    mutateProb = 0.5
): [Term, Substitution] => {
    const sigma = randomSubstitution(rnd, term, eps, mutateProb);
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

// a pseudo random generator generating numbers in the range 0 to 1
export type RandomGenerator = () => number;
export const defaultPRNG: RandomGenerator = Math.random;

export const prng = (seed: number): RandomGenerator => {
    const a = 1588635695;
    const c = 12345;
    const m = 4294967291;

    return (): number => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
};

const seed = randomInt(Math.random, 1000, 1000000);
// console.info(`seed: ${seed}`);
export const testRNG = prng(seed);