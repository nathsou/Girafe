# Girafe

[Try online](https://nathsou.github.io/Girafe/)

 ### Term Rewriting Systems infrastructure

Girafe provides a set of tools based on a minimal [term rewriting systems](https://en.wikipedia.org/wiki/Rewriting) language that can be interpreted or compiled to various targets.

See the examples/ folder for small demos.

Multiple preprocessors and transformations can be applied to support laziness, imports, currying, non-linearity etc.. see src/Compiler/Passes/

## Compiling
Girafe programs can be compiled to javascript, ocaml or haskell using:
```bash
$ grfc src.grf out.ext js/ocaml/haskell
```

Or interpreted using:
```bash
$ grfi src.grf [query]
```
## Use Cases

- Target language for functional (lazy or eager) programming languages (see [croco](https://github.com/nathsou/Croco))
- Symbolic computation
- Automated theorem proving
- Abstract data type specifications

### Todo

- [x] Use a necessity heuristic when building decision-trees
- [x] Simulate lazy rewriting correctly
- [ ] Add targets (c/rust/wasm)
- [ ] Confluence checks
- [x] Tail call elimination
- [ ] Simple optimizations

### References

1. Maranget, Luc (2008) [Compiling Pattern Matching to Good Decision Trees](http://moscova.inria.fr/~maranget/papers/ml05e-maranget.pdf)
2. Martelli & Montanari (1982) [An Efficient Unification Algorithm](http://moscova.inria.fr/~levy/courses/X/IF/03/pi/levy2/martelli-montanari.pdf)
3. Fokkink, Wan & Kamperman, Jasper & Walters, Pum. (1999). [Lazy Rewriting on Eager Machinery.](https://www.researchgate.net/publication/277293248_Lazy_Rewriting_on_Eager_Machinery) ACM Transactions on Programming Languages and Systems. 22. 10.1145/345099.345102. 
4. Klop, jan willem. (2000). [Term Rewriting Systems.](https://www.researchgate.net/publication/2472655_Term_Rewriting_Systems) 