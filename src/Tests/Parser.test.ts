import { showRule, showTerm } from '../Compiler/Utils';
import { Lexer } from '../Parser/Lexer/Lexer';
import { specialCharacters } from '../Parser/Lexer/SpecialChars';
import { TRSParser } from '../Parser/TRSParser';
import { Fun, Rule, Symb, Term, Var } from '../Parser/Types';
import { gen, randomElement } from '../Parser/Utils';
import { isOk, unwrap, isError } from '../Types';

const digits = [...gen(10, i => `${i}`)];
const lowerCaseLetters = [...gen(26, i => String.fromCharCode(97 + i))];
const upperCaseLetters = [...gen(26, i => String.fromCharCode(65 + i))];

const alphaNum = [
    ...lowerCaseLetters,
    ...upperCaseLetters,
    ...digits
];

const symbChars = [
    ...upperCaseLetters,
    ...digits,
    ...specialCharacters
];

const allowedChars = [
    ...lowerCaseLetters,
    ...symbChars
];

const randomSymb = (eps = 0.1): Symb => {
    let symb = randomElement(symbChars);
    while (Math.random() > eps) {
        symb += randomElement(allowedChars);
    }

    if (symb.includes('->')) return randomSymb(eps);
    return symb;
};

const randomVar = (eps = 0.1): Var => {
    let name = randomElement(lowerCaseLetters);
    while (Math.random() > eps) {
        name += randomElement(alphaNum);
    }

    return name;
};

const randomFun = (eps = 0.1, varProb = 0.5, maxArgs = 5, maxDepth = 3): Fun => {
    return {
        name: randomSymb(eps),
        args: [...gen(
            Math.floor(Math.random() * maxArgs),
            () => randomTerm(eps, varProb, maxArgs, maxDepth - 1)
        )]
    };
};

const randomTerm = (eps = 0.1, varProb = 0.5, maxArgs = 10, maxDepth = 3): Term => {
    if (maxDepth === 0 || Math.random() < varProb) return randomVar(eps);
    return randomFun(eps, varProb, maxArgs, maxDepth);
};

const randomRule = (eps = 0.1): Rule => {
    return [randomFun(eps), randomTerm(eps)];
};

const randomTRS = (eps = 0.1): Rule[] => {
    return [...gen(
        Math.floor(Math.random() * 20),
        () => randomRule(eps)
    )];
};

test('Lex vars', () => {
    const lexer = new Lexer();
    for (const varName of gen(100, () => randomVar())) {
        const lexVar = lexer.tokenize(varName);
        expect(isOk(lexVar)).toBe(true);
        expect(unwrap(lexVar)).toStrictEqual([{
            type: 'Var',
            name: varName,
            position: {
                line: 1,
                col: 1
            }
        }]);
    }
});

test('Lex symbols', () => {
    const lexer = new Lexer();
    for (const symb of gen(100, () => randomSymb())) {
        const lexSpecialSymb = lexer.tokenize(symb);
        expect(isOk(lexSpecialSymb)).toBe(true);
        expect(unwrap(lexSpecialSymb)).toStrictEqual([{
            type: 'Symb',
            name: symb,
            position: {
                line: 1,
                col: 1
            }
        }]);
    }
});

test('Parse terms', () => {
    const parser = TRSParser.getInstance();
    for (const term of gen(100, () => randomTerm())) {
        const lexerErr = parser.tokenize(showTerm(term));
        expect(lexerErr).toBe(undefined);
        const parsedTerm = parser.parseTerm();
        expect(isOk(parsedTerm)).toBe(true);
        expect(unwrap(parsedTerm)).toStrictEqual(term);
    }
});

test('Parse rules', () => {
    const parser = TRSParser.getInstance();
    for (const trs of gen(100, () => randomTRS())) {
        const asStr = trs.map(rule => showRule(rule)).join('\n');
        const parsedTRS = parser.parse(asStr);
        if (isError(parsedTRS)) console.error(parsedTRS);
        expect(isOk(parsedTRS)).toBe(true);
        expect(unwrap(parsedTRS)).toStrictEqual(trs);
    }
});