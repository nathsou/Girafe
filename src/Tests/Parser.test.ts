import { Arities } from '../Compiler/Passes/Lazify';
import { showRule, showTerm, showTermRec } from '../Compiler/Utils';
import { Lexer } from '../Parser/Lexer/Lexer';
import { TRSParser } from '../Parser/TRSParser';
import { gen } from '../Parser/Utils';
import { isError, isOk, unwrap } from '../Types';
import { randomSymb, randomTerm, randomTRS, randomVar, testPrng } from './TestUtils';

const rnd = testPrng;

const runs = 100;

test('Lex vars', () => {
    const lexer = new Lexer();
    for (const varName of gen(runs, () => randomVar(rnd))) {
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
    for (const symb of gen(runs, () => randomSymb(rnd))) {
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

test('showTerm', () => {
    for (const t of gen(runs, () => randomTerm(rnd, new Map()))) {
        expect(showTerm(t)).toBe(showTermRec(t));
    }
});

test('Parse terms', () => {
    const parser = TRSParser.getInstance();
    const arities: Arities = new Map();
    for (const term of gen(runs, () => randomTerm(rnd, arities))) {
        const lexerErr = parser.tokenize(showTerm(term));
        expect(lexerErr).toBe(undefined);
        const parsedTerm = parser.parseTerm();
        expect(isOk(parsedTerm)).toBe(true);
        expect(unwrap(parsedTerm)).toStrictEqual(term);
    }
});

test('Parse rules', () => {
    const parser = TRSParser.getInstance();
    const arities: Arities = new Map();
    for (const rules of gen(runs, () => randomTRS(rnd, arities))) {
        const asStr = rules.map(rule => showRule(rule)).join('\n');
        const parsedTRS = parser.parse(asStr);
        if (isError(parsedTRS)) console.error(JSON.stringify(parsedTRS));
        expect(isOk(parsedTRS)).toBe(true);
        expect(unwrap(parsedTRS)).toStrictEqual(rules);
    }
});