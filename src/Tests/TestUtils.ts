import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { isFunLeftLinear } from "../Compiler/Passes/Checks";
import { Arities } from "../Compiler/Passes/Lazify";
import { defined, mapify, Maybe, occurs, stringifyQueryVars, substitute, vars } from "../Compiler/Utils";
import { Externals } from "../Externals/Externals";
import { AsyncNormalizer } from "../Normalizer/Normalizer";
import { specialCharacters } from "../Parser/Lexer/SpecialChars";
import { parseRule, parseTerm, parseRules } from "../Parser/Parser";
import { dictGet, dictHas, dictKeys, Fun, Rule, Substitution, Symb, Term, TRS, Var } from "../Parser/Types";
import { gen } from "../Parser/Utils";
import { HaskellTranslator } from "../Translator/HaskellTranslator";
import { OCamlTranslator } from '../Translator/OCamlTranslator';
import { defaultLowerCaseSymbols } from '../Parser/Lexer/Lexer';

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

export const parseTRS = (rules: string[]): TRS => mapify(rules.map(rule => defined(parseRule(rule))));

export const parseTRSFromFile = (path: string) => defined(parseRules(readFileSync(path, 'utf-8')));

export const parseTermPairs = (pairs: Array<[string, string]>): Array<[Term, Term]> => {
    return pairs.map(([input, output]) => [defined(parseTerm(input)), defined(parseTerm(output))]);
};

export const randomSymb = (rnd: RandomGenerator, eps = 0.1): Symb => {
    let symb = randomElem(rnd, symbChars);
    while (rnd() > eps) {
        symb += randomElem(rnd, allowedChars);
    }

    if (symb === '_' || symb.includes('->')) return randomSymb(rnd, eps);
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

    if (defaultLowerCaseSymbols.includes(name)) {
        return randomVar(rnd, eps);
    }

    return name;
};

export const randomFun = (
    rnd: RandomGenerator,
    arities: Arities,
    eps = 0.1,
    varProb = 0.5,
    maxArgs = 5,
    maxDepth = 3
): Fun => {
    const name = randomSymb(rnd, eps);
    const t = {
        name,
        args: [...gen(
            arities.get(name) ?? randomInt(rnd, 0, maxArgs),
            () => randomTerm(rnd, arities, eps, varProb, maxArgs, maxDepth - 1)
        )]
    };

    arities.set(t.name, t.args.length);
    return t;
};

export const randomLeftLinearFun = (
    rnd: RandomGenerator,
    arities: Arities,
    eps = 0.1,
    varProb = 0.5,
    maxArgs = 5,
    maxDepth = 3
): Fun => {
    const name = randomSymb(rnd, eps);
    const args = [...gen(
        arities.get(name) ?? randomInt(rnd, 0, maxArgs),
        () => randomLeftLinearTerm(rnd, eps, arities, varProb, maxArgs, maxDepth - 1)
    )];

    const term: Fun = { name, args };

    // ensure the term is left linear
    if (!isFunLeftLinear(term)) {
        return randomLeftLinearFun(rnd, arities, eps, varProb, maxArgs, maxDepth);
    }

    arities.set(name, args.length);

    return term;
};

export const randomTerm = (
    rnd: RandomGenerator,
    arities: Arities,
    eps = 0.1,
    varProb = 0.5,
    maxArgs = 10,
    maxDepth = 3
): Term => {
    if (maxDepth === 0 || rnd() < varProb) return randomVar(rnd, eps);
    return randomFun(rnd, arities, eps, varProb, maxArgs, maxDepth);
};

export const randomLeftLinearTerm = (
    rnd: RandomGenerator,
    eps = 0.1,
    arities: Arities,
    varProb = 0.5,
    maxArgs = 10,
    maxDepth = 3
): Term => {
    if (maxDepth === 0 || rnd() < varProb) return randomVar(rnd, eps);
    return randomLeftLinearFun(rnd, arities, eps, varProb, maxArgs, maxDepth);
};

export const randomRule = (rnd: RandomGenerator, eps = 0.1, arities: Arities): Rule => {
    return [randomFun(rnd, arities, eps), randomTerm(rnd, arities, eps)];
};

export const randomLeftLinenarRule = (rnd: RandomGenerator, eps = 0.1, arities: Arities): Rule => {
    return [randomLeftLinearFun(rnd, arities, eps), randomTerm(rnd, arities, eps)];
};

export const randomTRS = (rnd: RandomGenerator, arities: Arities, eps = 0.1, maxRules = 20): Rule[] => {
    return [...gen(
        randomInt(rnd, 0, maxRules),
        () => randomRule(rnd, eps, arities)
    )];
};

export const randomLeftLinearTRS = (rnd: RandomGenerator, arities: Arities, eps = 0.1, maxRules = 20): Rule[] => {
    return [...gen(
        randomInt(rnd, 0, maxRules),
        () => randomLeftLinenarRule(rnd, eps, arities)
    )];
};

export const randomSubstitution = (
    rnd: RandomGenerator,
    term: Term,
    arities: Arities,
    eps = 0.1,
    mutateProb = 0.5
): Substitution => {
    const sigma: Substitution = {};

    for (const v of vars(term)) {
        if (rnd() < mutateProb) {
            const randTerm = randomTerm(rnd, arities, eps);
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
    arities: Arities,
    eps = 0.1,
    mutateProb = 0.5,
): [Term, Substitution] => {
    const sigma = randomSubstitution(rnd, term, arities, eps, mutateProb);
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

declare const JEST_PRNG_SEED: number;

export const testPrng = prng(JEST_PRNG_SEED);

const externalNormalizer = (
    prog: string,
    args: string[],
    ext: string,
    sourceWithQuery: (query: Term) => string,
    parseRenamedTerm: (out: string) => Maybe<Term>
): AsyncNormalizer => {
    const tmpFile = `grf_tmp_${prog}.${ext}`;

    return (query: Term) => {
        // create a tempory file with the source program
        writeFileSync(tmpFile, sourceWithQuery(query), 'utf-8');

        // run the compiler on this file
        return new Promise<Term>((resolve, reject) => {
            const instance = spawn(prog, [...args, tmpFile]);

            let out = '';
            let err = '';

            instance.stdout.on('data', (data: Buffer) => {
                out += data.toString('utf-8');
            });

            instance.stderr.on('data', (data: Buffer) => {
                err += data.toString('utf-8');
            });

            instance.on('close', () => {
                // remove the temporary file
                unlinkSync(tmpFile);

                if (err !== '') {
                    reject(err);
                } else {
                    resolve(defined(parseRenamedTerm(out)));
                }
            });
        });
    };
};

export const ghcNormalizer = (trs: TRS, externals: Externals<'haskell'>): AsyncNormalizer => {
    const hst = new HaskellTranslator(trs, externals);
    const source = hst.translate();

    return externalNormalizer(
        'runghc',
        [],
        'hs',
        query => [
            source,
            `main = putStr (show ${hst.callTerm(hst.renameTerm(stringifyQueryVars(query)))})`
        ].join('\n'),
        out => hst.parseRenamedTerm(out)
    );
};

export const ocamlNormalizer = (trs: TRS, externals: Externals<'ocaml'>): AsyncNormalizer => {
    const ost = new OCamlTranslator(trs, externals);
    const source = ost.translate();

    return externalNormalizer(
        'ocaml',
        ['-w', '-26'], // disable "unused variable" warnings
        'ml',
        query => [
            source,
            `in print_string (show_term ${ost.callTerm(ost.renameTerm(stringifyQueryVars(query)))});;`
        ].join('\n'),
        out => ost.parseRenamedTerm(out)
    );
};