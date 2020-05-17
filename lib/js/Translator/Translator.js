"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translator = void 0;
const Utils_1 = require("../Compiler/Utils");
const Types_1 = require("../Parser/Types");
class Translator {
    constructor(trs, externals) {
        this.header = [];
        this.trs = trs;
        this.externals = externals;
        this.definedSymbols = new Set([...trs.keys(), ...Object.keys(externals).map((s) => `@${s}`)]
            .map((f) => this.rename(f)));
        this.init();
    }
    init() { }
    isDefined(f) {
        return this.trs.has(f) || this.definedSymbols.has(f) ||
            Types_1.mapHas(this.externals, f.substr(1));
    }
    renameTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        if (!this.isDefined(term.name)) {
            return Utils_1.fun(term.name, ...term.args.map(t => this.renameTerm(t)));
        }
        return this.renameFun(term);
    }
    renameFun(term) {
        return {
            name: this.rename(term.name),
            args: term.args.map((t) => this.renameTerm(t)),
        };
    }
    renameRule([lhs, rhs]) {
        return [this.renameFun(lhs), this.renameTerm(rhs)];
    }
    generateExternals() {
        const exts = [];
        for (const [name, gen] of Object.entries(this.externals)) {
            exts.push(gen(this.rename("@" + name)));
        }
        return exts.join("\n");
    }
    generateRules() {
        const res = [];
        for (const [name, rules] of this.trs) {
            res.push(this.translateRules(this.rename(name), rules.map((r) => this.renameRule(r))));
        }
        return res.join("\n");
    }
    translate() {
        return [
            this.header.join("\n"),
            this.generateExternals(),
            this.generateRules(),
        ].join("\n");
    }
}
exports.Translator = Translator;
