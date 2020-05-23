import { matches } from "../../Unification";
import { Rule, Symb, Term, TRS } from "../../../Parser/Types";
import { indexed } from "../../../Parser/Utils";
import { closure, collectArities, stringify, unstringify, genSymbolSplitter } from "../StringMatcher/Closure";
import { isEmpty, isFun, isVar, lhs, Maybe, zip } from "../../../Compiler/Utils";
import { ω } from '../StringMatcher/Closure';
import { Matcher } from "../Matcher";
import { Unificator } from "../../Unificator";

type Node = {
    symbol: Symb,
    value?: Rule[],
    children: { [key: string]: Node }
};

export class TermMatcher {
    private root: Node;

    constructor(trs: TRS) {
        this.root = {
            symbol: null,
            children: {}
        };

        this.init(trs);
    }

    private init(trs: TRS): void {
        const rules = [...trs.values()].flat();
        const patterns = rules.map(lhs);
        const patternsStr = patterns.map(stringify);
        const M = new Set(patternsStr);
        const arities = collectArities(patterns);
        const M_ = closure(M, arities);
        const splitSymbols = genSymbolSplitter([...arities.keys(), ω]);

        for (const p of M_) {
            const pat = unstringify(p, splitSymbols, arities);

            if (pat) {
                const P_s: Rule[] = [];
                for (const [pattern, rule] of zip(patterns, rules)) {
                    if (matches(pat, pattern)) {
                        P_s.push(rule);
                    }
                }

                this.insert(pat, P_s);
            }
        }
    }

    private termName(term: Term): string {
        return typeof term === 'string' ? ω : term.name;
    }

    private insert(term: Term, value: Rule[], node = this.root): Node {
        const name = isVar(term) ? ω : term.name;

        const child: Node = {
            symbol: name,
            children: node.children[name]?.children ?? {},
            value: isVar(term) ? value : undefined
        };

        node.children[name] = child;
        node = child;

        if (isFun(term)) {
            if (isEmpty(term.args)) {
                node.value = value;
            }

            for (const [arg, i] of indexed(term.args)) {
                node = this.insert(arg, i === term.args.length - 1 ? value : undefined, node);
            }
        }

        return node;
    }

    private lookupArgs(term: Term, node: Node): Node {
        if (node === undefined) return undefined;
        if (node.symbol === ω || isVar(term)) return node;
        for (const arg of term.args) {
            node = this.lookupArgs(arg, node.children[this.termName(arg)] ?? node.children[ω]);
            if (node === undefined) return;
        }

        return node;
    }

    public lookup(term: Term): Maybe<Rule[]> {
        let node = this.root.children[this.termName(term)] ?? this.root.children[ω];

        if (node) {
            if (isFun(term)) {
                for (const arg of term.args) {
                    node = this.lookupArgs(arg, node.children[this.termName(arg)] ?? node.children[ω]);
                    if (node === undefined) return;
                }
            }

            return node.value;
        }
    }

    public asMatcher(): Matcher {
        return (term: Term, unificator: Unificator) => {
            const rules = this.lookup(term);

            if (rules) {
                for (const [lhs, rhs] of rules) {
                    const sigma = unificator(term, lhs);
                    if (sigma) return { sigma, rule: [lhs, rhs] };
                }
            }
        };
    }
}