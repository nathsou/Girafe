import { readFileSync } from "fs";
import { defined, showTerm } from "../Compiler/Utils";
import { Externals } from "../Externals/Externals";
import { nodeWorkerNormalizer } from '../Normalizer/JSNormalizer/NodeWorkerNormalizer';
import { parseRules, parseTerm } from "../Parser/Parser";
import { makeBigNat } from "../Translator/JSTranslator";

const tests = [
    { // peano addition
        rules: `
        +(a, 0) -> a
        +(0, b) -> b
        +(S(a), b) -> S(+(a, b))
        +(a, S(b)) -> S(+(a, b))
        1 -> S(0)
        2 -> S(1)
        3 -> S(2)
        Query -> +(3, 2)`,
        query: 'Query',
        output: 'S(S(S(S(S(0)))))',
        externals: {}
    },
    { // fibonacci
        rules: `
        1 -> S(0)
        2 -> S(1)
        3 -> S(2)
        4 -> S(3)
        5 -> S(4)
        6 -> S(5)
        7 -> S(6)
        8 -> S(7)
        9 -> S(8)
        +(0, b) -> b
        +(a, 0) -> a
        +(S(a), b) -> S(+(a, b))
        +(a, S(b)) -> S(+(a, b))
        Fib(0) -> 0
        Fib(S(0)) -> 1
        Fib(S(S(n))) -> +(Fib(S(n)), Fib(n))
        Query -> Fib(7)`,
        query: 'Query',
        output: 'S(S(S(S(S(S(S(S(S(S(S(S(S(0)))))))))))))',
        externals: {}
    },
    { // primes
        rules: readFileSync('src/Tests/TRSs/primes.grf').toString(),
        query: 'Query',
        output: ":(2', :(5', Nil))",
        externals: {}
    },
].map(({ rules, query, output, externals }) =>
    ({
        rules: defined(parseRules(rules)),
        query: defined(parseTerm(query)),
        output,
        externals: externals as Externals<'js', string>
    })
);

it('should produce expected output when evaluated', async () => {
    for (const { rules, query, output, externals } of tests) {
        const normalize = nodeWorkerNormalizer(rules, externals, makeBigNat);
        const res = await normalize(query);
        expect(showTerm(res)).toBe(output);
    }
});