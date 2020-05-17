# Girafe

 ### Term Rewriting Systems infrastructure

Giraffe provides a set of tools based on a minimal [term rewriting systems](https://en.wikipedia.org/wiki/Rewriting) language that can be interpreted or even compiled to various targets.

See the TRS/ folder for examples.

Various preprocessors and transformations can be applied to support laziness, imports, currying, non-linearity etc.. see src/Compiler/Passes/

## Compiling
Giraffe programs can be compiled to various targets using:
```bash
$ node cli/grfc.js [src.grf] [out.ext] [js/ocaml/haskell]
```
## Use Cases

- Target language for functional (lazy or eager) programming languages
- Symbolic computation
- Automated theorem proving
- Abstract data type specifications

### Todo

- [ ] Use the necessity heuristic when building decision-trees
- [ ] Simulate lazy rewriting correctly
- [ ] Add targets (c/rust/wasm)
- [ ] Confluence checks
- [ ] Simple optimizations

### References

1. Maranget, Luc (2008) [Compiling Pattern Matching to Good Decision Trees](http://moscova.inria.fr/~maranget/papers/ml05e-maranget.pdf)
2. Gräf, Albert (1991) [Left-to-right tree pattern matching.](https://github.com/agraef/pure-lang/wiki/rtapaper.pdf)
3. Fokkink, Wan & Kamperman, Jasper & Walters, Pum. (1999). [Lazy Rewriting on Eager Machinery.](https://www.researchgate.net/publication/277293248_Lazy_Rewriting_on_Eager_Machinery) ACM Transactions on Programming Languages and Systems. 22. 10.1145/345099.345102. 
4. Klop, jan willem. (2000). [Term Rewriting Systems.](https://www.researchgate.net/publication/2472655_Term_Rewriting_Systems) 