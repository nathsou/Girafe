#!/usr/bin/env node
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.rulesAlphaEquiv = exports.alphaEquivAux = exports.alphaEquiv = exports.isEmpty = exports.replaceTerms = exports.trd = exports.snd = exports.fst = exports.split = exports.decons = exports.tail = exports.last = exports.head = exports.hasDuplicatesMap = exports.hasDuplicatesSet = exports.hasDuplicates = exports.elem = exports.occurences = exports.fill = exports.unusedRuleVars = exports.swap = exports.swapMut = exports.setEq = exports.setDiff = exports.hasRecursiveRule = exports.isRuleRecursive = exports.hasMostGeneralRule = exports.isRuleMostGeneral = exports.mostGeneralFun = exports.genVars = exports.fun = exports.ruleArity = exports.arity = exports.emptyTRS = exports.cloneTRS = exports.showSubst = exports.showRule = exports.showTerm = exports.showTRS = exports.unmapify = exports.mapify = exports.removeRules = exports.ruleVars = exports.uniq = exports.rhs = exports.lhs = exports.ruleName = exports.addRules = exports.hasRule = exports.zip = exports.rulesEq = exports.termsEq = exports.substitute = exports.isSomething = exports.isNothing = exports.occurs = exports.vars = exports.isVar = exports.isFun = exports.defaultPasses = exports.logTRS = void 0;
const Types_1 = __webpack_require__(3);
const Utils_1 = __webpack_require__(2);
const Types_2 = __webpack_require__(1);
const Checks_1 = __webpack_require__(5);
const LeftLinearize_1 = __webpack_require__(11);
const OrderBy_1 = __webpack_require__(12);
exports.logTRS = (trs) => {
    console.log(exports.showTRS(trs));
    return Types_2.Ok(trs);
};
exports.defaultPasses = [
    Checks_1.check(Checks_1.checkNoFreeVars, Checks_1.checkArity, Checks_1.checkNoDuplicates),
    // currify,
    // lazify,
    LeftLinearize_1.leftLinearize,
    OrderBy_1.orderBySpecificity,
];
function isFun(term, name) {
    if (name) {
        return typeof term === "object" && term.name === name;
    }
    return typeof term === "object";
}
exports.isFun = isFun;
function isVar(term, name) {
    if (name) {
        return term === name;
    }
    return typeof term === "string";
}
exports.isVar = isVar;
function vars(term, acc = []) {
    if (isVar(term)) {
        acc.push(term);
        return acc;
    }
    return term.args.reduce((acc, t) => vars(t, acc), acc);
}
exports.vars = vars;
function occurs(x, t) {
    return vars(t).includes(x);
}
exports.occurs = occurs;
function isNothing(m) {
    return typeof m === "undefined";
}
exports.isNothing = isNothing;
function isSomething(m) {
    return !isNothing(m);
}
exports.isSomething = isSomething;
function substitute(t, sigma) {
    var _a;
    if (isVar(t))
        return (_a = Types_1.mapGet(sigma, t)) !== null && _a !== void 0 ? _a : t;
    return {
        name: t.name,
        args: t.args.map((s) => substitute(s, sigma)),
    };
}
exports.substitute = substitute;
exports.termsEq = (a, b) => {
    if (isVar(a) && isVar(b)) {
        return a === b;
    }
    if (isFun(a) && isFun(b)) {
        return a.name === b.name &&
            a.args.length === b.args.length &&
            a.args.every((arg, i) => exports.termsEq(arg, b.args[i]));
    }
    return false;
};
exports.rulesEq = ([lhs1, rhs1], [lhs2, rhs2]) => {
    return exports.termsEq(lhs1, lhs2) && exports.termsEq(rhs1, rhs2);
};
function* zip(as, bs) {
    const len = Math.min(as.length, bs.length);
    for (let i = 0; i < len; i++) {
        yield [as[i], bs[i]];
    }
}
exports.zip = zip;
exports.hasRule = (trs, rule) => {
    const name = exports.ruleName(rule);
    if (trs.has(name)) {
        return trs.get(name).some((def) => exports.rulesEq(def, rule));
    }
    return false;
};
// adds a rule to a trs if it does not already exist
exports.addRules = (trs, ...rules) => {
    for (const rule of rules) {
        const name = exports.ruleName(rule);
        if (!exports.hasRule(trs, rule)) {
            if (trs.has(name)) {
                trs.get(name).push(rule);
            }
            else {
                trs.set(name, [rule]);
            }
        }
    }
};
exports.ruleName = ([lhs, _]) => lhs.name;
exports.lhs = ([lhs, _]) => lhs;
exports.rhs = ([_, rhs]) => rhs;
function uniq(vals) {
    return [...new Set(vals)];
}
exports.uniq = uniq;
exports.ruleVars = ([lhs, rhs]) => {
    return uniq([...vars(lhs), ...vars(rhs)]);
};
exports.removeRules = (trs, ...rules) => {
    for (const rule of rules) {
        const name = exports.ruleName(rule);
        if (trs.has(name)) {
            trs.set(name, trs.get(name).filter((def) => !exports.rulesEq(rule, def)));
        }
    }
};
exports.mapify = (rules, trs = new Map()) => {
    for (const rule of rules) {
        const f = exports.ruleName(rule);
        if (trs.has(f)) {
            trs.get(f).push(rule);
        }
        else {
            trs.set(f, [rule]);
        }
    }
    return trs;
};
exports.unmapify = (trs) => ([].concat(...trs.values()));
exports.showTRS = (trs) => {
    const out = [];
    for (const [_, rules] of trs) {
        for (const rule of rules) {
            out.push(exports.showRule(rule));
        }
    }
    return out.join("\n");
};
exports.showTerm = (t) => {
    if (isVar(t))
        return t;
    if (t.args.length === 0)
        return t.name;
    return `${t.name}(${t.args.map(exports.showTerm).join(", ")})`;
};
exports.showRule = ([lhs, rhs]) => (`${exports.showTerm(lhs)} -> ${exports.showTerm(rhs)}`);
exports.showSubst = (sigma) => (Types_1.mapEntries(sigma)
    .map(([a, b]) => `${exports.showTerm(a)}: ${exports.showTerm(b)}`)
    .join(", "));
exports.cloneTRS = (trs) => {
    return new Map(trs.entries());
};
exports.emptyTRS = () => {
    return new Map();
};
exports.arity = (rules) => {
    return exports.ruleArity(rules[0]);
};
exports.ruleArity = ([lhs, _]) => {
    return lhs.args.length;
};
exports.fun = (name, ...args) => {
    return { name, args };
};
function genVars(n) {
    const names = [];
    for (let i = 0; i < n; i++) {
        names.push(`v${(i + 1)}`);
    }
    return names;
}
exports.genVars = genVars;
exports.mostGeneralFun = (name, arity) => {
    return { name, args: genVars(arity) };
};
exports.isRuleMostGeneral = ([lhs, _]) => {
    return lhs.args.every(t => isVar(t));
};
exports.hasMostGeneralRule = (rules) => {
    return rules.some(exports.isRuleMostGeneral);
};
exports.isRuleRecursive = ([lhs, rhs]) => {
    const name = exports.ruleName([lhs, rhs]);
    return Utils_1.some(Utils_1.traverseSymbols(rhs), f => f === name);
};
exports.hasRecursiveRule = (rules) => (rules.some(exports.isRuleRecursive));
function setDiff(as, bs) {
    const diff = new Set();
    for (const a of as) {
        if (!bs.has(a)) {
            diff.add(a);
        }
    }
    return diff;
}
exports.setDiff = setDiff;
function setEq(as, bs) {
    return as.size === bs.size && !Utils_1.some(as.keys(), a => !bs.has(a));
}
exports.setEq = setEq;
function swapMut(vals, i, j) {
    if (i < 0 || j < 0 || i >= vals.length || j >= vals.length) {
        throw new Error(`invalid swap indices, len: ${vals.length}, i: ${i}, j: ${j}`);
    }
    const tmp = vals[i];
    vals[i] = vals[j];
    vals[j] = tmp;
}
exports.swapMut = swapMut;
function swap(vals, i, j) {
    const copy = [...vals];
    swapMut(copy, i, j);
    return copy;
}
exports.swap = swap;
exports.unusedRuleVars = ([lhs, rhs]) => {
    return setDiff(new Set(vars(lhs)), new Set(vars(rhs)));
};
function fill(val, count) {
    const vals = [];
    for (let i = 0; i < count; i++) {
        vals.push(val);
    }
    return vals;
}
exports.fill = fill;
function occurences(vals) {
    const occurences = new Map();
    vals.forEach((val, idx) => {
        if (occurences.has(val)) {
            occurences.get(val).push(idx);
        }
        else {
            occurences.set(val, [idx]);
        }
    });
    return occurences;
}
exports.occurences = occurences;
function elem(value, elems, eq = (a, b) => a === b) {
    return elems.some((val) => eq(val, value));
}
exports.elem = elem;
function hasDuplicates(vals, eq) {
    if (isEmpty(vals))
        return false;
    const [h, tl] = decons(vals);
    return elem(h, tl, eq) || hasDuplicates(tl);
}
exports.hasDuplicates = hasDuplicates;
function hasDuplicatesSet(vals) {
    return new Set(vals).size !== vals.length;
}
exports.hasDuplicatesSet = hasDuplicatesSet;
function hasDuplicatesMap(vals) {
    return Utils_1.some(occurences(vals).values(), (occs) => occs.length > 1);
}
exports.hasDuplicatesMap = hasDuplicatesMap;
function head(list) {
    return list[0];
}
exports.head = head;
function last(list) {
    return list[list.length - 1];
}
exports.last = last;
function tail(list) {
    return list.slice(1);
}
exports.tail = tail;
function decons(list) {
    return [head(list), tail(list)];
}
exports.decons = decons;
function split(list, splitIdx) {
    return [list.slice(0, splitIdx), list.slice(splitIdx)];
}
exports.split = split;
function fst(list) {
    return list[0];
}
exports.fst = fst;
function snd(list) {
    return list[1];
}
exports.snd = snd;
function trd(list) {
    return list[2];
}
exports.trd = trd;
exports.replaceTerms = (old, by, inside) => {
    return inside.map((t) => exports.termsEq(t, old) ? by : t);
};
function isEmpty(collection) {
    return (Array.isArray(collection) ? collection.length : collection.size) ===
        0;
}
exports.isEmpty = isEmpty;
exports.alphaEquiv = (s, t) => (isSomething(exports.alphaEquivAux([hasDuplicates(vars(t)) ? [t, s] : [s, t]])));
exports.alphaEquivAux = (eqs, sigma = {}) => {
    if (isEmpty(eqs))
        return sigma;
    const [a, b] = eqs.pop();
    if (isVar(a) && isVar(b)) {
        if (Types_1.mapHas(sigma, a)) {
            if (Types_1.mapGet(sigma, a) === b) {
                return exports.alphaEquivAux(eqs, sigma);
            }
        }
        else {
            return exports.alphaEquivAux(eqs, Types_1.mapSet(sigma, a, b));
        }
    }
    else if (isFun(a) && isFun(b)) {
        if (a.name == b.name && a.args.length === b.args.length) {
            eqs.push(...zip(a.args, b.args));
            return exports.alphaEquivAux(eqs, sigma);
        }
    }
};
exports.rulesAlphaEquiv = (rule1, rule2) => {
    return exports.alphaEquiv(exports.lhs(rule1), exports.lhs(rule2));
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrap = exports.either = exports.isError = exports.isRight = exports.isOk = exports.isLeft = exports.Error = exports.Right = exports.Ok = exports.Left = void 0;
// type constructors
function Left(value) {
    return [value, 'left'];
}
exports.Left = Left;
;
exports.Ok = Left;
function Right(value) {
    return [value, 'right'];
}
exports.Right = Right;
;
exports.Error = Right;
function isLeft(value) {
    return value[1] === 'left';
}
exports.isLeft = isLeft;
exports.isOk = isLeft;
function isRight(value) {
    return value[1] === 'right';
}
exports.isRight = isRight;
exports.isError = isRight;
// helpers
function either(value, onLeft, onRight) {
    return isLeft(value) ? onLeft(value[0]) : onRight(value[0]);
}
exports.either = either;
function unwrap([value, _]) {
    return value;
}
exports.unwrap = unwrap;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.gen = exports.randomElement = exports.pop = exports.traverseSymbols = exports.traverse = exports.time = exports.mapMut = exports.setFilter = exports.setMap = exports.unionMut = exports.union = exports.repeat = exports.indexed = exports.some = exports.iter = exports.once = exports.join = exports.reverse = void 0;
const Utils_1 = __webpack_require__(0);
function* reverse(elems) {
    for (let i = elems.length - 1; i >= 0; i--) {
        yield elems[i];
    }
}
exports.reverse = reverse;
function* join(as, bs) {
    for (const a of as)
        yield a;
    for (const b of bs)
        yield b;
}
exports.join = join;
function* once(val) {
    yield val;
}
exports.once = once;
function* iter(vals) {
    for (const val of vals) {
        yield val;
    }
}
exports.iter = iter;
function some(it, pred) {
    for (const val of it) {
        if (pred(val))
            return true;
    }
    return false;
}
exports.some = some;
function* indexed(vals) {
    let i = 0;
    for (const val of vals) {
        yield [val, i++];
    }
}
exports.indexed = indexed;
function* repeat(val, count) {
    for (let i = 0; i < count; i++) {
        yield val;
    }
}
exports.repeat = repeat;
function union(...sets) {
    return unionMut(new Set(), ...sets);
}
exports.union = union;
function unionMut(a, ...sets) {
    for (const set of sets) {
        for (const val of set) {
            a.add(val);
        }
    }
    return a;
}
exports.unionMut = unionMut;
function setMap(set, f) {
    return new Set([...set.values()].map(f));
}
exports.setMap = setMap;
function setFilter(set, f) {
    return new Set([...set.values()].filter(f));
}
exports.setFilter = setFilter;
function mapMut(vals, f) {
    for (let i = 0; i < vals.length; i++) {
        vals[i] = f(vals[i]);
    }
    return vals;
}
exports.mapMut = mapMut;
function time(f) {
    const start = Date.now();
    const res = f();
    return [Date.now() - start, res];
}
exports.time = time;
function* traverse(term) {
    if (Utils_1.isVar(term)) {
        yield term;
    }
    else {
        yield term;
        for (const arg of term.args) {
            for (const t of traverse(arg)) {
                yield t;
            }
        }
    }
}
exports.traverse = traverse;
function* traverseSymbols(term) {
    for (const t of traverse(term)) {
        if (Utils_1.isVar(t)) {
            yield t;
        }
        else {
            yield t.name;
        }
    }
}
exports.traverseSymbols = traverseSymbols;
function pop(elems, count = 1) {
    const popped = [];
    for (let i = 0; i < count; i++) {
        popped.push(elems.pop());
    }
    return popped;
}
exports.pop = pop;
function randomElement(elems) {
    return elems[Math.floor(Math.random() * elems.length)];
}
exports.randomElement = randomElement;
function* gen(count, f) {
    for (let i = 0; i < count; i++) {
        yield f(i);
    }
}
exports.gen = gen;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.mapKeys = exports.mapValues = exports.mapEntries = exports.mapGet = exports.mapHas = exports.mapSet = exports.supportedTargets = void 0;
exports.supportedTargets = ['js', 'ocaml', 'haskell'];
function mapSet(map, key, value) {
    map[key] = value;
    return map;
}
exports.mapSet = mapSet;
function mapHas(map, key) {
    return map.hasOwnProperty(key);
}
exports.mapHas = mapHas;
function mapGet(map, key) {
    return map[key];
}
exports.mapGet = mapGet;
function mapEntries(map) {
    return Object.entries(map);
}
exports.mapEntries = mapEntries;
function mapValues(map) {
    return Object.values(map);
}
exports.mapValues = mapValues;
function mapKeys(map) {
    return Object.keys(map);
}
exports.mapKeys = mapKeys;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Translator = void 0;
const Utils_1 = __webpack_require__(0);
const Types_1 = __webpack_require__(3);
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


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.allChecks = exports.checkNoDuplicates = exports.checkNoFreeVars = exports.hasFreeVars = exports.checkLeftLinearity = exports.isLeftLinear = exports.checkArity = exports.check = void 0;
const Types_1 = __webpack_require__(1);
const Utils_1 = __webpack_require__(0);
// performs a set of checks on each rule
exports.check = (...checkers) => {
    return (trs) => {
        const errors = [];
        for (const rules of trs.values()) {
            for (const checker of checkers) {
                errors.push(...checker(rules));
            }
        }
        return errors.length > 0 ? Types_1.Error(errors) : Types_1.Ok(trs);
    };
};
exports.checkArity = (rules) => {
    const errors = [];
    const ar = Utils_1.arity(rules);
    for (const rule of rules) {
        // check if the arity is consistent
        if (Utils_1.ruleArity(rule) !== ar) {
            errors.push(`${Utils_1.ruleName(rule)} has inconsistent arities`);
        }
    }
    return errors;
};
exports.isLeftLinear = ([lhs, _]) => {
    return !Utils_1.hasDuplicatesSet(Utils_1.vars(lhs));
};
exports.checkLeftLinearity = (rules) => {
    const errors = [];
    for (const rule of rules) {
        // check if the rule is left-linear
        if (!exports.isLeftLinear(rule)) {
            errors.push(`${Utils_1.showRule(rule)} is not left-linear`);
        }
    }
    return errors;
};
exports.hasFreeVars = ([lhs, rhs]) => {
    const lhsVars = new Set(Utils_1.vars(lhs));
    return Utils_1.vars(rhs).some(x => !lhsVars.has(x));
};
exports.checkNoFreeVars = (rules) => {
    const errors = [];
    for (const rule of rules) {
        if (exports.hasFreeVars(rule)) {
            errors.push(`${Utils_1.ruleName(rule)} contains free variables`);
        }
    }
    return errors;
};
const overlappingRules = (rules) => {
    const alphaEquivRules = [];
    for (let i = 0; i < rules.length; i++) {
        for (let j = 0; j < rules.length; j++) {
            if (i === j)
                continue;
            const [rule1, rule2] = [rules[i], rules[j]];
            if (Utils_1.rulesAlphaEquiv(rule1, rule2)) {
                alphaEquivRules.push([rule1, rule2]);
            }
        }
    }
    return alphaEquivRules;
};
exports.checkNoDuplicates = (rules) => {
    const errors = [];
    for (const [rule1, rule2] of overlappingRules(rules)) {
        errors.push(`${Utils_1.showRule(rule1)} and ${Utils_1.showRule(rule2)} are overlapping`);
    }
    return errors;
};
exports.allChecks = exports.check(exports.checkArity, exports.checkLeftLinearity, exports.checkNoDuplicates, exports.checkNoFreeVars);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnd = exports.useIf = exports.use = exports.Eq = exports.And = exports.If = exports.False = exports.True = exports.falseSymb = exports.trueSymb = exports.andSymb = exports.ifSymb = exports.eqSymb = void 0;
const Utils_1 = __webpack_require__(0);
exports.eqSymb = '@equ';
exports.ifSymb = 'if';
exports.andSymb = 'and';
exports.trueSymb = 'True';
exports.falseSymb = 'False';
exports.True = () => Utils_1.fun(exports.trueSymb);
exports.False = () => Utils_1.fun(exports.falseSymb);
exports.If = (cond, thenExp, elseExp) => {
    return Utils_1.fun(exports.ifSymb, cond, thenExp, elseExp);
};
exports.And = (a, b) => {
    return Utils_1.fun(exports.andSymb, a, b);
};
exports.Eq = (a, b) => {
    return Utils_1.fun(exports.eqSymb, a, b);
};
exports.use = (trs, rules) => {
    Utils_1.addRules(trs, ...rules);
};
exports.useIf = (trs) => {
    const ifRules = [
        [exports.If(exports.True(), 'a', 'b'), 'a'],
        [exports.If(exports.False(), 'a', 'b'), 'b']
    ];
    exports.use(trs, ifRules);
};
exports.useAnd = (trs) => {
    const andRules = [
        [exports.And(exports.False(), exports.False()), exports.False()],
        [exports.And(exports.False(), exports.True()), exports.False()],
        [exports.And(exports.True(), exports.False()), exports.False()],
        [exports.And(exports.True(), exports.True()), exports.True()]
    ];
    exports.use(trs, andRules);
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocess = void 0;
const Utils_1 = __webpack_require__(0);
const Source_1 = __webpack_require__(8);
const Types_1 = __webpack_require__(1);
async function preprocess(source, passes, info = {}) {
    const src = source instanceof Source_1.Source ? source : new Source_1.Source(source);
    const passedPasses = [];
    for (const pass of passes) {
        passedPasses.push(pass);
        const errors = await pass(src, passedPasses, info);
        if (Utils_1.isSomething(errors))
            return Types_1.Error(errors);
    }
    return Types_1.Ok(src.asString());
}
exports.preprocess = preprocess;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
const Utils_1 = __webpack_require__(2);
// represents the raw source code
class Source {
    constructor(source) {
        this._lines = source.split('\n');
        this.patches = [];
    }
    isLineValid(index) {
        return index >= 0 && index < this._lines.length;
    }
    isRangeValid(start, count) {
        const end = start + count;
        return start >= 0 && start < this._lines.length &&
            count >= 0 && end < this._lines.length;
    }
    removeLines(startIndex, count) {
        if (this.isRangeValid(startIndex, count)) {
            this._lines.splice(startIndex, count);
            this.patches.push({
                type: 'remove',
                startIndex,
                count
            });
            return startIndex - count;
        }
        return startIndex;
    }
    insert(index, source) {
        return this.insertLines(index, ...source.split('\n'));
    }
    insertLines(startIndex, ...lines) {
        if (this.isLineValid(startIndex)) {
            this._lines.splice(startIndex, 0, ...lines);
            this.patches.push({
                type: 'insert',
                startIndex,
                count: lines.length
            });
            return startIndex + lines.length;
        }
        return startIndex;
    }
    updateLines(startIndex, ...newLines) {
        if (this.isRangeValid(startIndex, newLines.length)) {
            newLines.forEach((line, idx) => {
                this._lines[startIndex + idx] = line;
            });
        }
    }
    originalLineNumber(currentLine) {
        let index = currentLine;
        for (const { type, startIndex, count } of Utils_1.reverse(this.patches)) {
            if (type === 'insert' && index >= startIndex) {
                index -= count;
            }
            if (type === 'remove' && index >= startIndex) {
                index += count;
            }
        }
        return index + 1; // 0 indexed
    }
    *lines() {
        for (let i = 0; i < this._lines.length; i++) {
            yield [this._lines[i], i];
        }
    }
    *linesReversed() {
        for (let i = this._lines.length - 1; i >= 0; i--) {
            yield [this._lines[i], i];
        }
    }
    asString() {
        return this._lines.join('\n');
    }
}
exports.Source = Source;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __webpack_require__(10);
const Utils_1 = __webpack_require__(0);
const Unification_1 = __webpack_require__(13);
const Types_1 = __webpack_require__(3);
const Translate_1 = __webpack_require__(20);
const src = process.argv[2];
const outFile = process.argv[3];
const target = process.argv[4];
const transpile = async (path, target) => {
    const source = fs_1.readFileSync(path).toString();
    const trs = await Unification_1.compileRules(source, Utils_1.defaultPasses, async (path) => {
        return new Promise((resolve, reject) => {
            const contents = fs_1.readFileSync(`./TRSs/${path}`).toString();
            resolve(contents);
        });
    });
    if (trs) {
        return Translate_1.translate(trs, target);
    }
    else {
        console.log("Transpilation failed");
    }
};
(async () => {
    var _a;
    if (src) {
        const targetName = (_a = target) !== null && _a !== void 0 ? _a : 'js';
        if (!Types_1.supportedTargets.includes(targetName)) {
            console.error(`invalid target: ${targetName}`);
            return;
        }
        const out = await transpile(src, targetName);
        if (outFile) {
            fs_1.writeFileSync(outFile, out);
        }
        else {
            console.log(out);
        }
    }
    else {
        console.log("usage: grfc [src.grf] [out] [ocaml/haskell/js]");
    }
})();


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceVars = exports.leftLinearize = void 0;
const Checks_1 = __webpack_require__(5);
const Imports_1 = __webpack_require__(6);
const Utils_1 = __webpack_require__(0);
const Types_1 = __webpack_require__(1);
// transforms a general TRS into a left-linear one
// requires a structural equality external function (eqSymb)
exports.leftLinearize = (trs) => {
    const removedRules = [];
    const newRules = [];
    for (const rules of trs.values()) {
        for (const rule of rules) {
            if (!Checks_1.isLeftLinear(rule)) {
                const lhsVars = Utils_1.vars(Utils_1.lhs(rule));
                const rhsVars = Utils_1.vars(Utils_1.rhs(rule));
                const uniqueVars = Utils_1.genVars(lhsVars.length);
                const counts = Utils_1.occurences(lhsVars);
                const eqs = [];
                for (const occs of counts.values()) {
                    if (occs.length > 1) {
                        eqs.push(allEq(occs.map(idx => uniqueVars[idx])));
                    }
                }
                const newRhsVars = rhsVars.map(v => uniqueVars[lhsVars.indexOf(v)]);
                const newRule = [
                    replaceVars(Utils_1.lhs(rule), uniqueVars),
                    Imports_1.If(conjunction(eqs), replaceVars(Utils_1.rhs(rule), newRhsVars), Utils_1.fun('.'))
                ];
                removedRules.push(rule);
                newRules.push(newRule);
            }
        }
    }
    Utils_1.removeRules(trs, ...removedRules);
    Utils_1.addRules(trs, ...newRules);
    if (newRules.length > 0) {
        Imports_1.useIf(trs);
        Imports_1.useAnd(trs);
    }
    return Types_1.Ok(trs);
};
function replaceVars(t, newVars, i = { offset: 0 }) {
    if (Utils_1.isVar(t))
        return newVars[i.offset++];
    return Utils_1.fun(t.name, ...t.args.map(s => replaceVars(s, newVars, i)));
}
exports.replaceVars = replaceVars;
const conjunction = (terms) => {
    if (terms.length === 0)
        return Imports_1.True();
    if (terms.length === 1)
        return Utils_1.head(terms);
    const [h, tl] = Utils_1.decons(terms);
    return Imports_1.And(h, conjunction(tl));
};
// allEq(['a', 'b', 'c']) = And(Eq('a', 'b'), Eq('b', 'c'))
const allEq = (terms) => {
    if (terms.length <= 1)
        return Imports_1.True();
    if (terms.length === 2)
        return Imports_1.Eq(Utils_1.fst(terms), Utils_1.snd(terms));
    const [h, tl] = Utils_1.decons(terms);
    return Imports_1.And(Imports_1.Eq(h, Utils_1.head(tl)), allEq(tl));
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.orderBySpecificity = exports.lessSpecific = exports.orderBy = exports.ruleOrder = void 0;
const Types_1 = __webpack_require__(1);
const Utils_1 = __webpack_require__(0);
exports.ruleOrder = (order, rule1, rule2) => (order(Utils_1.lhs(rule1), Utils_1.lhs(rule2)) ? 1 : -1);
exports.orderBy = (order) => {
    return (trs) => {
        const reordered = Utils_1.emptyTRS();
        for (const [name, rules] of trs.entries()) {
            reordered.set(name, rules.sort((a, b) => exports.ruleOrder(order, a, b)));
        }
        return Types_1.Ok(reordered);
    };
};
exports.lessSpecific = (s, t) => {
    if (Utils_1.isVar(s) && Utils_1.isFun(t))
        return true;
    if (Utils_1.isFun(s) && Utils_1.isVar(t))
        return false;
    if (Utils_1.isFun(s) && Utils_1.isFun(t)) {
        if (s.args.length !== t.args.length) {
            return s.args.length < t.args.length;
        }
        for (const [a, b] of Utils_1.zip(s.args, t.args)) {
            if (exports.lessSpecific(a, b))
                return true;
        }
        return s.name > t.name;
    }
    return false;
};
exports.orderBySpecificity = exports.orderBy(exports.lessSpecific);


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTRS = exports.reduce = exports.oneStepReduce = exports.compileRules = exports.matches = exports.match = void 0;
const CompilerPass_1 = __webpack_require__(14);
const Utils_1 = __webpack_require__(0);
const Parser_1 = __webpack_require__(15);
const Import_1 = __webpack_require__(17);
const RemoveComments_1 = __webpack_require__(18);
const Types_1 = __webpack_require__(3);
const Utils_2 = __webpack_require__(2);
const Types_2 = __webpack_require__(1);
const RuleBasedUnify_1 = __webpack_require__(19);
exports.match = RuleBasedUnify_1.ruleBasedUnify;
exports.matches = (s, t) => Utils_1.isSomething(exports.match(s, t));
function logErrors(errors) {
    for (const err of Types_2.unwrap(errors)) {
        if (Parser_1.isParserError(err)) {
            console.error(`[Parser error on line ${err.originalLine}]: \n${err.message}`);
        }
        else {
            console.error(err);
        }
    }
}
async function compileRules(src, passes = Utils_1.defaultPasses, fileReader) {
    const rules = await Parser_1.parse(src, RemoveComments_1.removeComments, Import_1.handleImports(fileReader));
    if (Types_2.isError(rules)) {
        logErrors(rules);
        return;
    }
    const trs = CompilerPass_1.compile(Types_2.unwrap(rules).trs, ...passes);
    if (Types_2.isError(trs)) {
        logErrors(trs);
        return;
    }
    return Types_2.unwrap(trs);
}
exports.compileRules = compileRules;
exports.oneStepReduce = (term, externals = {}, matcher) => {
    // externals
    if (term.name.charAt(0) === "@") {
        const f = term.name.substr(1);
        if (Types_1.mapHas(externals, f)) {
            const newTerm = externals[f](term);
            return { term: newTerm, changed: newTerm !== term };
        }
        else {
            throw new Error(`Unknown external function: "${f}"`);
        }
    }
    const rules = matcher.lookup(term);
    if (rules) {
        for (const [lhs, rhs] of rules) {
            const sigma = exports.match(term, lhs);
            if (sigma) {
                return { term: Utils_1.substitute(rhs, sigma), changed: true };
            }
        }
    }
    return { term, changed: false };
};
exports.reduce = (term, externals = {}, matcher) => {
    if (Utils_1.isVar(term))
        return term;
    let reduced = { term, changed: true };
    while (reduced.changed) {
        if (Utils_1.isVar(reduced.term))
            return reduced.term;
        Utils_2.mapMut(reduced.term.args, (s) => exports.reduce(s, externals, matcher));
        reduced = exports.oneStepReduce(reduced.term, externals, matcher);
    }
    return reduced.term;
};
exports.parseTRS = Parser_1.parseTerm;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.compile = void 0;
const Types_1 = __webpack_require__(1);
const Utils_1 = __webpack_require__(0);
exports.compile = (trs, ...passes) => {
    if (passes.length === 0)
        return Types_1.Ok(trs);
    for (const pass of passes) {
        const res = pass(trs);
        if (Types_1.isError(res)) {
            return res;
        }
        trs = Types_1.unwrap(res);
    }
    return Types_1.Ok(trs);
};
function log(trs) {
    console.log(Utils_1.showTRS(trs));
    return Types_1.Ok(trs);
}
exports.log = log;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.parseTerm = exports.parseRules = exports.parseRule = exports.renameVars = exports.isParserError = void 0;
const Utils_1 = __webpack_require__(0);
const Types_1 = __webpack_require__(1);
const grammar_js_1 = __webpack_require__(16);
const Preprocessor_1 = __webpack_require__(7);
const Source_1 = __webpack_require__(8);
function isParserError(obj) {
    return typeof obj === 'object'
        && obj.hasOwnProperty('message') &&
        obj.hasOwnProperty('originalLine');
}
exports.isParserError = isParserError;
function renameVars(t) {
    if (Utils_1.isVar(t))
        return `$${t}`;
    return {
        name: t.name,
        args: t.args.map(s => renameVars(s))
    };
}
exports.renameVars = renameVars;
exports.parseRule = (rule) => {
    if (!rule.includes('->'))
        return;
    const [lhs, rhs] = rule.split('->');
    const l = exports.parseTerm(lhs);
    const r = exports.parseTerm(rhs);
    if (Utils_1.isSomething(l) && Utils_1.isFun(l) && Utils_1.isSomething(r)) {
        return [l, r];
    }
};
exports.parseRules = (src) => {
    const rules = grammar_js_1.parse(src);
    return Utils_1.mapify(rules.map(([lhs, rhs]) => [lhs, rhs]
    // [renameVars(lhs), renameVars(rhs)]
    ));
};
exports.parseTerm = (term) => {
    try {
        return grammar_js_1.parse(term);
    }
    catch (e) {
        console.error(e);
    }
};
async function parse(source, ...preprocessors) {
    const info = {};
    const src = new Source_1.Source(source);
    const preprocessedSource = await Preprocessor_1.preprocess(src, preprocessors, info);
    if (Types_1.isError(preprocessedSource)) {
        return preprocessedSource;
    }
    try {
        const trs = exports.parseRules(Types_1.unwrap(preprocessedSource));
        return Types_1.Ok({ trs, info: info });
    }
    catch (e) {
        return Types_1.Error([{
                message: e.message.replace(/(Parse error on line [0-9]+:\n)/, ''),
                originalLine: src.originalLineNumber(e.hash.line)
            }]);
    }
}
exports.parse = parse;


/***/ }),
/* 16 */
/***/ (function(module, exports) {

/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var grammar = (function () {
    var o = function (k, v, o, l) { for (o = o || {}, l = k.length; l--; o[k[l]] = v); return o }, $V0 = [1, 5], $V1 = [1, 7], $V2 = [1, 13], $V3 = [1, 12], $V4 = [5, 9, 14], $V5 = [5, 8, 9, 11, 13, 14, 16], $V6 = [13, 16];
    var parser = {
        trace: function trace() { },
        yy: {},
        symbols_: { "error": 2, "e": 3, "rules": 4, "EOF": 5, "term": 6, "rule": 7, "->": 8, "VAR": 9, "fun": 10, "?": 11, "terms": 12, ",": 13, "SYMB": 14, "(": 15, ")": 16, "$accept": 0, "$end": 1 },
        terminals_: { 2: "error", 5: "EOF", 8: "->", 9: "VAR", 11: "?", 13: ",", 14: "SYMB", 15: "(", 16: ")" },
        productions_: [0, [3, 2], [3, 2], [4, 1], [4, 2], [7, 3], [6, 1], [6, 1], [6, 2], [12, 1], [12, 3], [10, 1], [10, 4]],
        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
            /* this == yyval */

            var $0 = $$.length - 1;
            switch (yystate) {
                case 1: case 2:
                    return $$[$0 - 1];
                    break;
                case 3: case 9:
                    this.$ = [$$[$0]];
                    break;
                case 4:
                    $$[$0 - 1].push($$[$0]);
                    break;
                case 5:
                    this.$ = [$$[$0 - 2], $$[$0]];
                    break;
                case 6:
                    this.$ = yytext;
                    break;
                case 7:
                    this.$ = $$[$0];
                    break;
                case 8:
                    this.$ = { name: "Lazy", args: [$$[$0 - 1]] };
                    break;
                case 10:
                    $$[$0 - 2].push($$[$0]);
                    break;
                case 11:
                    this.$ = { name: $$[$0], args: [] };
                    break;
                case 12:
                    this.$ = { name: $$[$0 - 3], args: $$[$0 - 1] };
                    break;
            }
        },
        table: [{ 3: 1, 4: 2, 6: 3, 7: 4, 9: $V0, 10: 6, 14: $V1 }, { 1: [3] }, { 5: [1, 8], 6: 10, 7: 9, 9: $V0, 10: 6, 14: $V1 }, { 5: [1, 11], 8: $V2, 11: $V3 }, o($V4, [2, 3]), o($V5, [2, 6]), o($V5, [2, 7]), o($V5, [2, 11], { 15: [1, 14] }), { 1: [2, 1] }, o($V4, [2, 4]), { 8: $V2, 11: $V3 }, { 1: [2, 2] }, o($V5, [2, 8]), { 6: 15, 9: $V0, 10: 6, 14: $V1 }, { 6: 17, 9: $V0, 10: 6, 12: 16, 14: $V1 }, o($V4, [2, 5], { 11: $V3 }), { 13: [1, 19], 16: [1, 18] }, o($V6, [2, 9], { 11: $V3 }), o($V5, [2, 12]), { 6: 20, 9: $V0, 10: 6, 14: $V1 }, o($V6, [2, 10], { 11: $V3 })],
        defaultActions: { 8: [2, 1], 11: [2, 2] },
        parseError: function parseError(str, hash) {
            if (hash.recoverable) {
                this.trace(str);
            } else {
                var error = new Error(str);
                error.hash = hash;
                throw error;
            }
        },
        parse: function parse(input) {
            var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
            var args = lstack.slice.call(arguments, 1);
            var lexer = Object.create(this.lexer);
            var sharedState = { yy: {} };
            for (var k in this.yy) {
                if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
                    sharedState.yy[k] = this.yy[k];
                }
            }
            lexer.setInput(input, sharedState.yy);
            sharedState.yy.lexer = lexer;
            sharedState.yy.parser = this;
            if (typeof lexer.yylloc == 'undefined') {
                lexer.yylloc = {};
            }
            var yyloc = lexer.yylloc;
            lstack.push(yyloc);
            var ranges = lexer.options && lexer.options.ranges;
            if (typeof sharedState.yy.parseError === 'function') {
                this.parseError = sharedState.yy.parseError;
            } else {
                this.parseError = Object.getPrototypeOf(this).parseError;
            }
            function popStack(n) {
                stack.length = stack.length - 2 * n;
                vstack.length = vstack.length - n;
                lstack.length = lstack.length - n;
            }
            _token_stack:
            var lex = function () {
                var token;
                token = lexer.lex() || EOF;
                if (typeof token !== 'number') {
                    token = self.symbols_[token] || token;
                }
                return token;
            };
            var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
            while (true) {
                state = stack[stack.length - 1];
                if (this.defaultActions[state]) {
                    action = this.defaultActions[state];
                } else {
                    if (symbol === null || typeof symbol == 'undefined') {
                        symbol = lex();
                    }
                    action = table[state] && table[state][symbol];
                }
                if (typeof action === 'undefined' || !action.length || !action[0]) {
                    var errStr = '';
                    expected = [];
                    for (p in table[state]) {
                        if (this.terminals_[p] && p > TERROR) {
                            expected.push('\'' + this.terminals_[p] + '\'');
                        }
                    }
                    if (lexer.showPosition) {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                    } else {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                    }
                    this.parseError(errStr, {
                        text: lexer.match,
                        token: this.terminals_[symbol] || symbol,
                        line: lexer.yylineno,
                        loc: yyloc,
                        expected: expected
                    });
                }
                if (action[0] instanceof Array && action.length > 1) {
                    throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
                }
                switch (action[0]) {
                    case 1:
                        stack.push(symbol);
                        vstack.push(lexer.yytext);
                        lstack.push(lexer.yylloc);
                        stack.push(action[1]);
                        symbol = null;
                        if (!preErrorSymbol) {
                            yyleng = lexer.yyleng;
                            yytext = lexer.yytext;
                            yylineno = lexer.yylineno;
                            yyloc = lexer.yylloc;
                            if (recovering > 0) {
                                recovering--;
                            }
                        } else {
                            symbol = preErrorSymbol;
                            preErrorSymbol = null;
                        }
                        break;
                    case 2:
                        len = this.productions_[action[1]][1];
                        yyval.$ = vstack[vstack.length - len];
                        yyval._$ = {
                            first_line: lstack[lstack.length - (len || 1)].first_line,
                            last_line: lstack[lstack.length - 1].last_line,
                            first_column: lstack[lstack.length - (len || 1)].first_column,
                            last_column: lstack[lstack.length - 1].last_column
                        };
                        if (ranges) {
                            yyval._$.range = [
                                lstack[lstack.length - (len || 1)].range[0],
                                lstack[lstack.length - 1].range[1]
                            ];
                        }
                        r = this.performAction.apply(yyval, [
                            yytext,
                            yyleng,
                            yylineno,
                            sharedState.yy,
                            action[1],
                            vstack,
                            lstack
                        ].concat(args));
                        if (typeof r !== 'undefined') {
                            return r;
                        }
                        if (len) {
                            stack = stack.slice(0, -1 * len * 2);
                            vstack = vstack.slice(0, -1 * len);
                            lstack = lstack.slice(0, -1 * len);
                        }
                        stack.push(this.productions_[action[1]][0]);
                        vstack.push(yyval.$);
                        lstack.push(yyval._$);
                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                        stack.push(newState);
                        break;
                    case 3:
                        return true;
                }
            }
            return true;
        }
    };
    /* generated by jison-lex 0.3.4 */
    var lexer = (function () {
        var lexer = ({

            EOF: 1,

            parseError: function parseError(str, hash) {
                if (this.yy.parser) {
                    this.yy.parser.parseError(str, hash);
                } else {
                    throw new Error(str);
                }
            },

            // resets the lexer, sets new input
            setInput: function (input, yy) {
                this.yy = yy || this.yy || {};
                this._input = input;
                this._more = this._backtrack = this.done = false;
                this.yylineno = this.yyleng = 0;
                this.yytext = this.matched = this.match = '';
                this.conditionStack = ['INITIAL'];
                this.yylloc = {
                    first_line: 1,
                    first_column: 0,
                    last_line: 1,
                    last_column: 0
                };
                if (this.options.ranges) {
                    this.yylloc.range = [0, 0];
                }
                this.offset = 0;
                return this;
            },

            // consumes and returns one char from the input
            input: function () {
                var ch = this._input[0];
                this.yytext += ch;
                this.yyleng++;
                this.offset++;
                this.match += ch;
                this.matched += ch;
                var lines = ch.match(/(?:\r\n?|\n).*/g);
                if (lines) {
                    this.yylineno++;
                    this.yylloc.last_line++;
                } else {
                    this.yylloc.last_column++;
                }
                if (this.options.ranges) {
                    this.yylloc.range[1]++;
                }

                this._input = this._input.slice(1);
                return ch;
            },

            // unshifts one char (or a string) into the input
            unput: function (ch) {
                var len = ch.length;
                var lines = ch.split(/(?:\r\n?|\n)/g);

                this._input = ch + this._input;
                this.yytext = this.yytext.substr(0, this.yytext.length - len);
                //this.yyleng -= len;
                this.offset -= len;
                var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                this.match = this.match.substr(0, this.match.length - 1);
                this.matched = this.matched.substr(0, this.matched.length - 1);

                if (lines.length - 1) {
                    this.yylineno -= lines.length - 1;
                }
                var r = this.yylloc.range;

                this.yylloc = {
                    first_line: this.yylloc.first_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.first_column,
                    last_column: lines ?
                        (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                        + oldLines[oldLines.length - lines.length].length - lines[0].length :
                        this.yylloc.first_column - len
                };

                if (this.options.ranges) {
                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];
                }
                this.yyleng = this.yytext.length;
                return this;
            },

            // When called from action, caches matched text and appends it on next action
            more: function () {
                this._more = true;
                return this;
            },

            // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
            reject: function () {
                if (this.options.backtrack_lexer) {
                    this._backtrack = true;
                } else {
                    return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                        text: "",
                        token: null,
                        line: this.yylineno
                    });

                }
                return this;
            },

            // retain first n characters of the match
            less: function (n) {
                this.unput(this.match.slice(n));
            },

            // displays already matched input, i.e. for error messages
            pastInput: function () {
                var past = this.matched.substr(0, this.matched.length - this.match.length);
                return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
            },

            // displays upcoming input, i.e. for error messages
            upcomingInput: function () {
                var next = this.match;
                if (next.length < 20) {
                    next += this._input.substr(0, 20 - next.length);
                }
                return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
            },

            // displays the character position where the lexing error occurred, i.e. for error messages
            showPosition: function () {
                var pre = this.pastInput();
                var c = new Array(pre.length + 1).join("-");
                return pre + this.upcomingInput() + "\n" + c + "^";
            },

            // test the lexed token: return FALSE when not a match, otherwise return token
            test_match: function (match, indexed_rule) {
                var token,
                    lines,
                    backup;

                if (this.options.backtrack_lexer) {
                    // save context
                    backup = {
                        yylineno: this.yylineno,
                        yylloc: {
                            first_line: this.yylloc.first_line,
                            last_line: this.last_line,
                            first_column: this.yylloc.first_column,
                            last_column: this.yylloc.last_column
                        },
                        yytext: this.yytext,
                        match: this.match,
                        matches: this.matches,
                        matched: this.matched,
                        yyleng: this.yyleng,
                        offset: this.offset,
                        _more: this._more,
                        _input: this._input,
                        yy: this.yy,
                        conditionStack: this.conditionStack.slice(0),
                        done: this.done
                    };
                    if (this.options.ranges) {
                        backup.yylloc.range = this.yylloc.range.slice(0);
                    }
                }

                lines = match[0].match(/(?:\r\n?|\n).*/g);
                if (lines) {
                    this.yylineno += lines.length;
                }
                this.yylloc = {
                    first_line: this.yylloc.last_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.last_column,
                    last_column: lines ?
                        lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                        this.yylloc.last_column + match[0].length
                };
                this.yytext += match[0];
                this.match += match[0];
                this.matches = match;
                this.yyleng = this.yytext.length;
                if (this.options.ranges) {
                    this.yylloc.range = [this.offset, this.offset += this.yyleng];
                }
                this._more = false;
                this._backtrack = false;
                this._input = this._input.slice(match[0].length);
                this.matched += match[0];
                token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
                if (this.done && this._input) {
                    this.done = false;
                }
                if (token) {
                    return token;
                } else if (this._backtrack) {
                    // recover context
                    for (var k in backup) {
                        this[k] = backup[k];
                    }
                    return false; // rule action called reject() implying the next rule should be tested instead.
                }
                return false;
            },

            // return next match in input
            next: function () {
                if (this.done) {
                    return this.EOF;
                }
                if (!this._input) {
                    this.done = true;
                }

                var token,
                    match,
                    tempMatch,
                    index;
                if (!this._more) {
                    this.yytext = '';
                    this.match = '';
                }
                var rules = this._currentRules();
                for (var i = 0; i < rules.length; i++) {
                    tempMatch = this._input.match(this.rules[rules[i]]);
                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                        match = tempMatch;
                        index = i;
                        if (this.options.backtrack_lexer) {
                            token = this.test_match(tempMatch, rules[i]);
                            if (token !== false) {
                                return token;
                            } else if (this._backtrack) {
                                match = false;
                                continue; // rule action called reject() implying a rule MISmatch.
                            } else {
                                // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                                return false;
                            }
                        } else if (!this.options.flex) {
                            break;
                        }
                    }
                }
                if (match) {
                    token = this.test_match(match, rules[index]);
                    if (token !== false) {
                        return token;
                    }
                    // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                    return false;
                }
                if (this._input === "") {
                    return this.EOF;
                } else {
                    return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                        text: "",
                        token: null,
                        line: this.yylineno
                    });
                }
            },

            // return next match that has a token
            lex: function lex() {
                var r = this.next();
                if (r) {
                    return r;
                } else {
                    return this.lex();
                }
            },

            // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
            begin: function begin(condition) {
                this.conditionStack.push(condition);
            },

            // pop the previously active lexer condition state off the condition stack
            popState: function popState() {
                var n = this.conditionStack.length - 1;
                if (n > 0) {
                    return this.conditionStack.pop();
                } else {
                    return this.conditionStack[0];
                }
            },

            // produce the lexer rule set which is active for the currently active lexer condition state
            _currentRules: function _currentRules() {
                if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
                    return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
                } else {
                    return this.conditions["INITIAL"].rules;
                }
            },

            // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
            topState: function topState(n) {
                n = this.conditionStack.length - 1 - Math.abs(n || 0);
                if (n >= 0) {
                    return this.conditionStack[n];
                } else {
                    return "INITIAL";
                }
            },

            // alias for begin(condition)
            pushState: function pushState(condition) {
                this.begin(condition);
            },

            // return the number of states currently on the stack
            stateStackSize: function stateStackSize() {
                return this.conditionStack.length;
            },
            options: {},
            performAction: function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
                var YYSTATE = YY_START;
                switch ($avoiding_name_collisions) {
                    case 0:/* skip whitespace */
                        break;
                    case 1: return 9;
                        break;
                    case 2: return 15;
                        break;
                    case 3: return 16;
                        break;
                    case 4: return 13;
                        break;
                    case 5: return 8;
                        break;
                    case 6: return 11;
                        break;
                    case 7: return 14;
                        break;
                    case 8: return 5;
                        break;
                }
            },
            rules: [/^(?:\s+)/, /^(?:[a-z][a-zA-Z0-9]*)/, /^(?:\()/, /^(?:\))/, /^(?:,)/, /^(?:->)/, /^(?:\?)/, /^(?:[\.\-\~\+\*\/\\\&\|\^\%\°\$\@\#\£\€\;\:\_\=\'\>\<A-Z0-9]+[a-zA-Z0-9\']*)/, /^(?:$)/],
            conditions: { "INITIAL": { "rules": [0, 1, 2, 3, 4, 5, 6, 7, 8], "inclusive": true } }
        });
        return lexer;
    })();
    parser.lexer = lexer;
    function Parser() {
        this.yy = {};
    }
    Parser.prototype = parser; parser.Parser = Parser;
    return new Parser;
})();

exports.parse = function () { return grammar.parse.apply(grammar, arguments); };

// if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
//     exports.parser = grammar;
//     exports.Parser = grammar.Parser;
//     exports.parse = function () { return grammar.parse.apply(grammar, arguments); };
//     exports.main = function commonjsMain(args) {
//         if (!args[1]) {
//             console.log('Usage: ' + args[0] + ' FILE');
//             process.exit(1);
//         }
//         var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
//         return exports.parser.parse(source);
//     };
//     if (typeof module !== 'undefined' && require.main === module) {
//         exports.main(process.argv.slice(1));
//     }
// }

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImports = exports.specialCharacters = void 0;
const Types_1 = __webpack_require__(1);
const Preprocessor_1 = __webpack_require__(7);
exports.specialCharacters = [
    ".",
    "-",
    "~",
    "+",
    "*",
    "&",
    "|",
    "^",
    "%",
    "°",
    "$",
    "@",
    "#",
    ";",
    ":",
    "_",
    "=",
    "'",
    ">",
    "<",
];
// import "arith.grf" (+, -, *, %, >)
const symb = `[${exports.specialCharacters.map((c) => `\\${c}`).join("")}a-zA-Z0-9]+`;
const pattern = `^\\s*(import)\\s*\\"(${symb})\\"\\s*(\\(((\\s*${symb}\\,)*\\s*${symb})\\))?$`;
exports.handleImports = (fileReader) => {
    return async (src, passes, info) => {
        var _a, _b;
        if (!info.importPass) {
            info.importPass = {
                includedPaths: new Map(),
            };
        }
        for (const [line, idx] of src.linesReversed()) {
            const matches = new RegExp(pattern).exec(line);
            if (matches) {
                const path = matches[2];
                if (!info.importPass.includedPaths.has(path)) {
                    const namedImports = (_b = (_a = matches[4]) === null || _a === void 0 ? void 0 : _a.split(",").map((s) => s.trim())) !== null && _b !== void 0 ? _b : [];
                    info.importPass.includedPaths.set(path, namedImports);
                    const contents = await fileReader(path);
                    const preprocessed = await Preprocessor_1.preprocess(contents, passes, info);
                    if (Types_1.isError(preprocessed)) {
                        return Types_1.unwrap(preprocessed);
                    }
                    src.removeLines(idx, 1);
                    src.insert(idx, Types_1.unwrap(preprocessed));
                }
                else {
                    src.removeLines(idx, 1);
                }
            }
        }
    };
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.removeComments = void 0;
exports.removeComments = async (source) => {
    for (const [line, idx] of source.linesReversed()) {
        const matches = /(\/{2}.*)$/.exec(line);
        if (matches) {
            const [comment] = matches;
            if (comment.length === line.length) {
                source.removeLines(idx, 1);
            }
            else {
                source.updateLines(idx, line.replace(comment, ''));
            }
        }
    }
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleBasedUnify = void 0;
const Types_1 = __webpack_require__(3);
const Utils_1 = __webpack_require__(0);
const Utils_2 = __webpack_require__(2);
exports.ruleBasedUnify = (s, t) => unify([[s, t]]);
const unify = (eqs, sigma = {}) => {
    if (eqs.length === 0)
        return sigma;
    const [a, b] = eqs.pop();
    if (Utils_1.isVar(a) && Utils_1.isVar(b) && a === b) { // Delete
        return unify(eqs, sigma);
    }
    if (Utils_1.isFun(a) && Utils_1.isFun(b) &&
        a.name == b.name &&
        a.args.length == b.args.length) { // Decompose
        eqs.push(...Utils_1.zip(a.args, b.args));
        return unify(eqs, sigma);
    }
    if (Utils_1.isVar(a) && !Utils_1.occurs(a, b)) {
        if (Types_1.mapHas(sigma, a)) {
            // handles non left-linear rules
            if (Utils_1.termsEq(Types_1.mapGet(sigma, a), b)) {
                return unify(eqs, sigma);
            }
        }
        else {
            if (Utils_1.isVar(b)) {
                return unify(eqs, Types_1.mapSet(sigma, b, a));
            }
        }
    }
    if (Utils_1.isFun(a) && Utils_1.isVar(b)) {
        Types_1.mapSet(sigma, b, a);
        return unify(Utils_2.mapMut(eqs, ([s, t]) => [Utils_1.substitute(s, sigma), Utils_1.substitute(t, sigma)]), sigma);
    }
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const Arithmetic_1 = __webpack_require__(21);
const HaskellTranslator_1 = __webpack_require__(22);
const OCamlTranslator_1 = __webpack_require__(23);
const JSTranslator_1 = __webpack_require__(24);
function translate(trs, target) {
    let translator;
    switch (target) {
        case 'ocaml':
            translator = new OCamlTranslator_1.OCamlTranslator(trs, Arithmetic_1.ocamlArithmeticExternals);
            break;
        case 'haskell':
            translator = new HaskellTranslator_1.HaskellTranslator(trs, Arithmetic_1.haskellArithmeticExternals);
        case 'js':
            translator = new JSTranslator_1.JSTranslator(trs, Arithmetic_1.jsArithmeticExternals);
    }
    return translator.translate();
}
exports.translate = translate;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ocamlArithmeticExternals = exports.haskellArithmeticExternals = exports.jsArithmeticExternals = exports.arithmeticExterals = exports.boolbinop = exports.arithbinop = exports.symb = void 0;
const Imports_1 = __webpack_require__(6);
const Utils_1 = __webpack_require__(0);
exports.symb = (f) => ({ name: f, args: [] });
exports.arithbinop = (t, op) => {
    const [a, b] = t.args;
    if (Utils_1.isFun(a) && Utils_1.isFun(b)) {
        try {
            const an = BigInt(a.name);
            const bn = BigInt(b.name);
            const res = op(an, bn);
            return exports.symb(`${res}`);
        }
        catch (e) {
            return t;
        }
    }
    return t;
};
exports.boolbinop = (t, op) => {
    const [a, b] = t.args;
    if (Utils_1.isFun(a) && Utils_1.isFun(b)) {
        const an = BigInt(a.name);
        const bn = BigInt(b.name);
        const res = op(an, bn);
        return res ? Imports_1.True() : Imports_1.False();
    }
    return t;
};
exports.arithmeticExterals = {
    'add': t => exports.arithbinop(t, (a, b) => a + b),
    'sub': t => exports.arithbinop(t, (a, b) => a - b),
    'mult': t => exports.arithbinop(t, (a, b) => a * b),
    'div': t => exports.arithbinop(t, (a, b) => a / b),
    'mod': t => exports.arithbinop(t, (a, b) => a % b),
    'pow': t => exports.arithbinop(t, (a, b) => a ** b),
    'equ': t => exports.boolbinop(t, (a, b) => a === b),
    'gtr': t => exports.boolbinop(t, (a, b) => a > b),
    'geq': t => exports.boolbinop(t, (a, b) => a >= b),
    'lss': t => exports.boolbinop(t, (a, b) => a < b),
    'leq': t => exports.boolbinop(t, (a, b) => a <= b)
};
const jsarithbinop = (op) => {
    return (name) => (`function ${name}(a, b) {
            if (isFun(a) && isFun(b)) {
                try {
                    const an = BigInt(a.name);
                    const bn = BigInt(b.name);
        
                    const res = (an ${op} bn).toString();
                    return { name: res, args: [] };
                } catch (e) {
                    return { name: name, args: [a, b] };
                }
        
            }
        
            return { name: name, args: [a, b] };
        }`);
};
const jsboolbinop = (op) => {
    return (name) => (`function ${name}(a, b) {
            if (isFun(a) && isFun(b)) {
                const an = BigInt(a.name);
                const bn = BigInt(b.name);
                const res = an ${op} bn;
        
                return { name: res ? 'True' : 'False', args: [] };
            }
        
            return { name: name, args: [a, b] };
        }`);
};
exports.jsArithmeticExternals = {
    'add': jsarithbinop('+'),
    'sub': jsarithbinop('-'),
    'mult': jsarithbinop('*'),
    'div': jsarithbinop('/'),
    'mod': jsarithbinop('%'),
    'pow': jsarithbinop('**'),
    'equ': jsboolbinop('==='),
    'gtr': jsboolbinop('>'),
    'geq': jsboolbinop('>='),
    'lss': jsboolbinop('<'),
    'leq': jsboolbinop('<=')
};
exports.haskellArithmeticExternals = {
    "sub": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) - (read b :: Int))) []`,
    "add": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) + (read b :: Int))) []`,
    "mult": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) * (read b :: Int))) []`,
    "mod": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) \`mod\` (read b :: Int))) []`,
    "div": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) \`div\` (read b :: Int))) []`,
    "pow": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) \`pow\` (read b :: Int))) []`,
    "equ": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) == (read b :: Int))) []`,
    "lss": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) < (read b :: Int))) []`,
    "leq": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) <= (read b :: Int))) []`,
    "gtr": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) > (read b :: Int))) []`,
    "geq": (name) => `${name} (Fun a []) (Fun b []) =
          Fun (show ((read a :: Int) >= (read b :: Int))) []`,
};
const ocamlIntBinop = (op, reversed = false) => {
    return (name) => 'let ' + name + ' a b = match (a, b) with\n' +
        '   | ((Fun (a, [])), (Fun (b, []))) ->\n' +
        (reversed ?
            '       Fun ((string_of_int ((' + op + ' (int_of_string a)) (int_of_string b))), [])' :
            '       Fun ((string_of_int ((int_of_string a) ' + op + ' (int_of_string b))), [])') + '\n' +
        '   | _ -> Fun ("@' + name + '", []);;';
};
const ocamlBoolOf = (expr) => `(if ${expr} then "True" else "False")`;
const ocamlBoolBinop = (op) => {
    return (name) => 'let ' + name + ' a b = match (a, b) with\n' +
        '   | ((Fun (a, [])), (Fun (b, []))) ->\n' +
        '       Fun (' + ocamlBoolOf('((int_of_string a) ' + op + ' (int_of_string b))') + ', [])\n' +
        '   | _ -> Fun ("@' + name + '", []);;';
};
exports.ocamlArithmeticExternals = {
    "sub": ocamlIntBinop('-'),
    "add": ocamlIntBinop('+'),
    "mult": ocamlIntBinop('*'),
    "mod": ocamlIntBinop('mod'),
    "div": ocamlIntBinop('/'),
    "pow": name => `
let rec pow a = function
    | 0 -> 1
    | 1 -> a
    | n -> 
      let b = pow a (n / 2) in
      b * b * (if n mod 2 = 0 then 1 else a);;
    
      ${ocamlIntBinop('pow', true)(name)}
`.trim().trimEnd(),
    "equ": ocamlBoolBinop('='),
    "lss": ocamlBoolBinop('<'),
    "leq": ocamlBoolBinop('<='),
    "gtr": ocamlBoolBinop('>'),
    "geq": ocamlBoolBinop('>=')
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.HaskellTranslator = void 0;
const Utils_1 = __webpack_require__(0);
const Translator_1 = __webpack_require__(4);
class HaskellTranslator extends Translator_1.Translator {
    constructor(trs, externals) {
        super(trs, externals);
        this.header = [
            "import Data.List (intercalate, map)",
            "data Term = Var String | Fun String [Term]",
            `instance Show Term where
            show (Var x) = x
            show (Fun f []) = f
            show (Fun f ts) = f ++ "(" ++ (intercalate ", " (map show ts)) ++ ")"
        `,
        ];
    }
    rename(name) {
        const symbolMap = {
            '.': '_dot_',
            '-': '_minus_',
            '~': '_tilde_',
            '+': '_plus_',
            '*': '_star_',
            '&': '_ampersand_',
            '|': '_pipe_',
            '/': '_slash_',
            '\\': '_backslash_',
            '^': '_caret_',
            '%': '_percent_',
            '°': '_num_',
            '$': '_dollar_',
            '@': '_at_',
            '#': '_hash_',
            ';': '_semicolon_',
            ':': '_colon_',
            '_': '_',
            '=': '_eq_',
            "'": '_prime_',
            ">": '_gtr_',
            "<": '_lss_'
        };
        const noSymbols = name
            .split('')
            .map(c => { var _a; return (_a = symbolMap[c]) !== null && _a !== void 0 ? _a : c; })
            .join('');
        return `grf_${noSymbols}`;
    }
    translateTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        return `(Fun "${term.name}" [${term.args.map((t) => this.translateTerm(t)).join(", ")}])`;
    }
    callTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(Utils_1.fun(term.name, ...term.args.map(t => this.callTerm(t))));
        }
        const args = `${term.args.map((t) => this.callTerm(t)).join(" ")}`;
        return `(${term.name} ${args})`;
    }
    translateRules(name, rules) {
        const res = [];
        for (const [lhs, rhs] of rules) {
            const args = `${lhs.args.map((t) => this.translateTerm(t)).join(" ")}`;
            res.push(`${name} ${args} = ${this.callTerm(rhs)}`);
        }
        return res.join("\n");
    }
}
exports.HaskellTranslator = HaskellTranslator;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.OCamlTranslator = void 0;
const Utils_1 = __webpack_require__(0);
const Translator_1 = __webpack_require__(4);
class OCamlTranslator extends Translator_1.Translator {
    constructor() {
        super(...arguments);
        this.firstRule = true;
    }
    init() {
        this.header = [
            "type term = Var of string | Fun of string * term list;;",
            "let funOf name args = Fun (name, args);;",
            "let varOf name = Var (name);;",
            `let rec show_term t =
                match t with
                | Var x -> x
                | Fun (f, []) -> f
                | Fun (f, ts) -> f ^ "(" ^ (String.concat ", " (List.map show_term ts)) ^ ")";;
        `,
        ];
    }
    rename(name) {
        const symbolMap = {
            '.': '_dot_',
            '-': '_minus_',
            '~': '_tilde_',
            '+': '_plus_',
            '*': '_star_',
            '&': '_ampersand_',
            '|': '_pipe_',
            '/': '_slash_',
            '\\': '_backslash_',
            '^': '_caret_',
            '%': '_percent_',
            '°': '_num_',
            '$': '_dollar_',
            '@': '_at_',
            '#': '_hash_',
            ';': '_semicolon_',
            ':': '_colon_',
            '_': '_',
            '=': '_eq_',
            "'": '_prime_',
            ">": '_gtr_',
            "<": '_lss_'
        };
        const noSymbols = name
            .split('')
            .map(c => { var _a; return (_a = symbolMap[c]) !== null && _a !== void 0 ? _a : c; })
            .join('');
        return `grf_${noSymbols}`;
    }
    translateTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        return `(Fun ("${term.name}", [${term.args.map((t) => this.translateTerm(t)).join("; ")}]))`;
    }
    callTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(Utils_1.fun(term.name, ...term.args.map(t => this.callTerm(t))));
        }
        const args = `(${term.args.map((t) => this.callTerm(t)).join(', ')})`;
        return `(${term.name} ${args})`;
    }
    translateRules(name, rules) {
        const newVars = Utils_1.genVars(Utils_1.arity(rules));
        const args = `(${newVars.join(', ')})`;
        const res = [
            `${this.firstRule ? 'let rec' : 'and'} ${name} ${args} =
                match (${newVars.join(', ')}) with
            `.trim()
        ];
        this.firstRule = false;
        for (const [lhs_, rhs_] of rules) {
            const sigma = {};
            const unusedVars = Utils_1.unusedRuleVars([lhs_, rhs_]);
            for (const [a, b] of Utils_1.zip(lhs_.args, newVars)) {
                if (Utils_1.isVar(a)) {
                    sigma[a] = unusedVars.has(a) ? '_' : b;
                }
            }
            const [lhs, rhs] = [
                Utils_1.substitute(lhs_, sigma),
                Utils_1.substitute(rhs_, sigma)
            ];
            const args = `(${lhs.args.map(t => this.translateTerm(t)).join(', ')})`;
            res.push(`| ${args} -> ${this.callTerm(rhs)}`.trim());
        }
        if (!Utils_1.hasMostGeneralRule(rules)) {
            res.push(`| _ -> ${this.translateTerm(Utils_1.fun(name, ...newVars))}`);
        }
        return res.join("\n");
    }
}
exports.OCamlTranslator = OCamlTranslator;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.JSTranslator = void 0;
const DecisionTreeTranslator_1 = __webpack_require__(25);
const Utils_1 = __webpack_require__(0);
const Types_1 = __webpack_require__(1);
const translateTerm = (term) => {
    if (Utils_1.isVar(term))
        return term;
    return `{ name: "${term.name}", args: [${term.args.map(translateTerm).join(', ')}] }`;
};
class JSTranslator extends DecisionTreeTranslator_1.DecisionTreeTranslator {
    constructor(trs, externals) {
        super(trs, externals);
    }
    accessSubterm(parent, childIndex) {
        return `${parent}.args[${childIndex}]`;
    }
    init() {
        this.header.push(`function isFun(term) {
                return typeof term === "object";
            }`, `function isVar(term) {
                return typeof term === "string";
            }`, `function showTerm(term) {
                if (isVar(term)) return term;
                if (term.args.length === 0) return term.name;
                return term.name + '(' +  term.args.map(showTerm).join(', ') + ')';
            }`);
    }
    callTerm(term) {
        if (Utils_1.isVar(term))
            return term;
        if (!this.isDefined(term.name)) {
            return this.translateTerm(Utils_1.fun(term.name, ...term.args.map(t => this.callTerm(t))));
        }
        const args = `${term.args.map((t) => this.callTerm(t)).join(', ')}`;
        return `${term.name}(${args})`;
    }
    translateDecisionTree(name, dt, varNames) {
        const translateOccurence = (occ) => {
            const val = Types_1.either(occ.value, translateOccurence, Utils_1.showTerm);
            if (occ.index !== undefined)
                return `${val}.args[${occ.index}]`;
            return val;
        };
        const translate = (tree) => {
            switch (tree.type) {
                case 'fail':
                    return `return ${translateTerm(Utils_1.fun(name, ...varNames))};`;
                case 'leaf':
                    return `return ${this.callTerm(tree.action)};`;
                case 'switch':
                    const tests = [];
                    for (const [ctor, A] of tree.tests) {
                        if (ctor === '_') {
                            tests.push(`default:
                                ${translate(A)}
                            `);
                        }
                        else {
                            tests.push(`case "${ctor}":
                                ${translate(A)}
                            `);
                        }
                    }
                    const occName = translateOccurence(tree.occurence);
                    return `switch (isFun(${occName}) ? ${occName}.name : null) {
                        ${tests.join('\n')}
                    }`;
            }
        };
        return `function ${name}(${varNames.join(', ')}) {
            ${translate(dt)}
        }`;
    }
    rename(name) {
        const symbolMap = {
            '.': '_dot_',
            '-': '_minus_',
            '~': '_tilde_',
            '+': '_plus_',
            '*': '_star_',
            '&': '_ampersand_',
            '|': '_pipe_',
            '/': '_slash_',
            '\\': '_backslash_',
            '^': '_caret_',
            '%': '_percent_',
            '°': '_num_',
            '$': '_dollar_',
            '@': '_at_',
            '#': '_hash_',
            ';': '_semicolon_',
            ':': '_colon_',
            '_': '_',
            '=': '_eq_',
            "'": '_prime_',
            ">": '_gtr_',
            "<": '_lss_'
        };
        const noSymbols = name
            .split('')
            .map(c => { var _a; return (_a = symbolMap[c]) !== null && _a !== void 0 ? _a : c; })
            .join('');
        return `grf_${noSymbols}`;
    }
    translateTerm(term) {
        return translateTerm(term);
    }
}
exports.JSTranslator = JSTranslator;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionTreeTranslator = void 0;
const Lazify_1 = __webpack_require__(26);
const Utils_1 = __webpack_require__(2);
const Translator_1 = __webpack_require__(4);
const Utils_2 = __webpack_require__(0);
const DecisionTreeCompiler_1 = __webpack_require__(27);
class DecisionTreeTranslator extends Translator_1.Translator {
    constructor(trs, externals) {
        super(trs, externals);
        this.arities = Lazify_1.collectTRSArities(trs);
        this.signature = new Set(this.arities.keys());
    }
    translateRules(name, rules) {
        const renameVars = (t, sigma, i = 0, j = 0, parent) => {
            const name = parent ? this.accessSubterm(parent, j) : `v${(i + 1)}`;
            if (Utils_2.isVar(t)) {
                sigma[t] = name;
                return;
            }
            t.args.forEach((s, idx) => {
                renameVars(s, sigma, i + idx, idx, name);
            });
        };
        const newVars = Utils_2.genVars(Utils_2.ruleArity(Utils_2.fst(rules)));
        const rules_ = rules.map(([lhs, rhs]) => {
            const sigma = {};
            for (const [t, i] of Utils_1.indexed(lhs.args)) {
                renameVars(t, sigma, i);
            }
            return [
                Utils_2.substitute(lhs, sigma),
                Utils_2.substitute(rhs, sigma)
            ];
        });
        const m = DecisionTreeCompiler_1.clauseMatrixOf(rules_);
        const occs = DecisionTreeCompiler_1.occurencesOf(...newVars);
        const dt = DecisionTreeCompiler_1.compileClauseMatrix(occs, m, this.signature);
        return this.translateDecisionTree(name, dt, newVars);
    }
}
exports.DecisionTreeTranslator = DecisionTreeTranslator;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.collectArity = exports.collectTRSArities = exports.lazify = void 0;
const Types_1 = __webpack_require__(1);
const Utils_1 = __webpack_require__(0);
const instSymb = 'inst';
const thunkSymb = 'Θ';
const Inst = (...args) => Utils_1.fun(instSymb, ...args);
const Thunk = (name, ...args) => Utils_1.fun(`${thunkSymb}${name}`, ...args);
exports.lazify = (trsWithAnnotations) => {
    const newTrs = Utils_1.emptyTRS();
    const [ann, hasLazyTerms] = collectLazinessAnnotations(trsWithAnnotations);
    const trs = removeLazinessAnnotations(trsWithAnnotations);
    if (!hasLazyTerms)
        return Types_1.Ok(trs);
    const arities = exports.collectTRSArities(trs);
    // thunk each lazy argument
    for (const [name, rules] of trs.entries()) {
        for (const [lhs, rhs] of rules) {
            const thunkedRule = instantiateMigrants([
                lhs,
                thunkify(rhs, ann)
            ], ann);
            Utils_1.addRules(newTrs, thunkedRule);
            // make sure the arity is correct for function symbols
            arities.set(name, Utils_1.arity(rules));
        }
    }
    // instantiate each function symbol
    for (const [symb, ar] of arities.entries()) {
        const varNames = Utils_1.genVars(ar);
        const instRule = [
            Inst(Thunk(symb, ...varNames)),
            // FIXME: Don't instantiate everything
            Utils_1.fun(symb, ...varNames.map(t => Inst(t)))
        ];
        Utils_1.addRules(newTrs, instRule);
    }
    Utils_1.addRules(newTrs, [Inst('x'), 'x']);
    return Types_1.Ok(newTrs);
};
const removeLazinessAnnotations = (trs) => {
    const newTrs = new Map();
    for (const [name, rules] of trs.entries()) {
        for (const [lhs, rhs] of rules) {
            const newArgs = [];
            for (const t of lhs.args) {
                if (Utils_1.isFun(t, 'Lazy')) {
                    newArgs.push(t.args[0]);
                }
                else {
                    newArgs.push(t);
                }
            }
            Utils_1.addRules(newTrs, [{ name, args: newArgs }, rhs]);
        }
    }
    return newTrs;
};
const collectLazinessAnnotations = (trs) => {
    const annotations = new Map();
    let hasLazyTerms = false;
    for (const [name, rules] of trs.entries()) {
        const ar = Utils_1.arity(rules);
        const ann = Utils_1.fill(false, ar);
        for (const [lhs, _] of rules) {
            lhs.args.forEach((t, i) => {
                if (Utils_1.isFun(t, 'Lazy')) {
                    ann[i] = true;
                    hasLazyTerms = true;
                }
            });
        }
        annotations.set(name, ann);
    }
    return [annotations, hasLazyTerms];
};
exports.collectTRSArities = (trs) => {
    const arities = new Map();
    for (const rules of trs.values()) {
        for (const rule of rules) {
            collectRuleArity(rule, arities);
        }
    }
    return arities;
};
const collectRuleArity = ([lhs, rhs], arities) => {
    exports.collectArity(lhs, arities);
    exports.collectArity(rhs, arities);
};
exports.collectArity = (t, arities) => {
    var _a;
    if (Utils_1.isFun(t)) {
        arities.set(t.name, (_a = arities.get(t.name)) !== null && _a !== void 0 ? _a : t.args.length);
        t.args.forEach(s => exports.collectArity(s, arities));
    }
};
const isLazy = (ruleName, nth, ann) => {
    return ann.has(ruleName) ? ann.get(ruleName)[nth] : false;
};
const isVarActive = (x, t, ann) => {
    if (Utils_1.isVar(t))
        return t === x;
    return t.args.some((arg, i) => (!isLazy(t.name, i, ann) && isVarActive(x, arg, ann)));
};
const isVarMigrant = (x, [lhs, rhs], ann) => {
    return !isVarActive(x, lhs, ann) && isVarActive(x, rhs, ann);
};
const migrantVars = (rule, ann) => {
    return Utils_1.ruleVars(rule).filter(x => isVarMigrant(x, rule, ann));
};
const thunkifyAll = (ts, ann) => (ts.map(t => Utils_1.isVar(t) ? t : Thunk(t.name, ...thunkifyAll(t.args, ann))));
const thunkify = (t, ann) => {
    if (Utils_1.isVar(t))
        return t;
    const args = t.args.map((arg, i) => {
        if (Utils_1.isFun(arg) && isLazy(t.name, i, ann)) {
            return thunkify(Thunk(arg.name, ...thunkifyAll(arg.args, ann)), ann);
        }
        return arg;
    });
    return { name: t.name, args };
};
const instantiateMigrants = (rule, ann) => {
    const [l, r] = rule;
    if (Utils_1.isVar(r) && isVarMigrant(r, rule, ann)) {
        return [l, Inst(r)];
    }
    else if (Utils_1.isFun(r)) {
        const migrants = migrantVars(rule, ann);
        if (!Utils_1.isEmpty(migrants)) {
            const newArgs = migrants.reduce((ts, x) => Utils_1.replaceTerms(x, Inst(x), ts), r.args);
            const newRhs = { name: r.name, args: newArgs };
            return [l, newRhs];
        }
    }
    return rule;
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.compileClauseMatrix = exports.occurencesOf = exports.defaultClauseMatrix = exports.specializeClauseMatrix = exports.clauseMatrixOf = exports.patternOf = exports._ = void 0;
const Utils_1 = __webpack_require__(2);
const Types_1 = __webpack_require__(1);
const Utils_2 = __webpack_require__(0);
const DecisionTree_1 = __webpack_require__(28);
exports._ = '_';
exports.patternOf = (term) => {
    if (Utils_2.isVar(term))
        return exports._;
    return { name: term.name, args: term.args.map(exports.patternOf) };
};
// all the rules must have share the same head symbol and arity
exports.clauseMatrixOf = (rules) => {
    return {
        patterns: rules.map(rule => Utils_2.lhs(rule).args.map(t => exports.patternOf(t))),
        dims: [rules.length, Utils_2.ruleArity(Utils_2.fst(rules))],
        actions: rules.map(rule => Utils_2.rhs(rule))
    };
};
const specializeRow = (row, c, arity) => {
    const [p, ps] = Utils_2.decons(row);
    if (p === exports._)
        return [...Utils_1.repeat(exports._, arity), ...ps];
    if (p.name === c)
        return [...p.args, ...ps];
};
exports.specializeClauseMatrix = (matrix, c, arity) => {
    const patterns = matrix.patterns
        .map(row => specializeRow(row, c, arity));
    const actions = [...Utils_2.zip(patterns, matrix.actions)]
        .filter(([p, a]) => p)
        .map(([p, a]) => a);
    return {
        patterns: patterns.filter(Utils_2.isSomething),
        dims: [actions.length, arity + matrix.dims[1] - 1],
        actions
    };
};
const defaultRow = (row) => {
    const [p, ps] = Utils_2.decons(row);
    if (p === exports._)
        return ps;
};
exports.defaultClauseMatrix = (matrix) => {
    const patterns = matrix.patterns.map(defaultRow);
    const actions = [...Utils_2.zip(patterns, matrix.actions)]
        .filter(([p, a]) => p)
        .map(([p, a]) => a);
    return {
        patterns: patterns.filter(Utils_2.isSomething),
        dims: [actions.length, matrix.dims[1] - 1],
        actions
    };
};
const getColumn = (matrix, i) => {
    const col = [];
    for (const row of matrix.patterns) {
        col.push(row[i]);
    }
    return col;
};
const selectColumn = (matrix) => {
    for (let i = 0; i < matrix.dims[1]; i++) {
        if (getColumn(matrix, i).some(p => p !== exports._)) {
            return i;
        }
    }
    throw new Error('No valid column found (should never happen)');
};
const swapColumn = (matrix, i) => {
    for (const row of matrix.patterns) {
        Utils_2.swapMut(row, 0, i);
    }
};
const heads = (patterns) => {
    const hds = new Map();
    for (const p of patterns) {
        if (p !== exports._) {
            hds.set(p.name, p.args.length);
        }
    }
    return hds;
};
exports.occurencesOf = (...terms) => {
    return terms.map(t => ({ value: Types_1.Right(t) }));
};
exports.compileClauseMatrix = (occurences, matrix, signature) => {
    const [m, n] = matrix.dims;
    if (m === 0)
        return DecisionTree_1.makeFail();
    if (m > 0 && (n === 0 || matrix.patterns[0].every(p => p === exports._))) {
        return DecisionTree_1.makeLeaf(matrix.actions[0]);
    }
    const colIdx = selectColumn(matrix);
    if (colIdx !== 0) {
        Utils_2.swapMut(occurences, 0, colIdx);
        swapColumn(matrix, colIdx);
    }
    const col = getColumn(matrix, 0);
    const hds = heads(col);
    const tests = [];
    for (const [ctor, arity] of hds) {
        const o1 = [...Utils_1.gen(arity, i => ({
                value: Types_1.Left(occurences[0]),
                index: i
            }))];
        const A_k = exports.compileClauseMatrix([...o1, ...Utils_2.tail(occurences)], exports.specializeClauseMatrix(matrix, ctor, arity), signature);
        tests.push([ctor, A_k]);
    }
    if (!Utils_2.setEq(hds, signature)) {
        const A_D = exports.compileClauseMatrix(Utils_2.tail(occurences), exports.defaultClauseMatrix(matrix), signature);
        tests.push([exports._, A_D]);
    }
    return DecisionTree_1.makeSwitch(Utils_2.head(occurences), tests);
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.showDecisionTree = exports.makeSwitch = exports.makeFail = exports.makeLeaf = void 0;
const Types_1 = __webpack_require__(1);
const Utils_1 = __webpack_require__(0);
exports.makeLeaf = (action) => ({ type: 'leaf', action });
exports.makeFail = () => ({ type: 'fail' });
exports.makeSwitch = (occurence, tests) => {
    return {
        type: 'switch',
        occurence,
        tests
    };
};
const showOccurence = (occ) => {
    const val = Types_1.either(occ.value, showOccurence, Utils_1.showTerm);
    if (occ.index)
        return `${val}[${occ.index}]`;
    return val;
};
exports.showDecisionTree = (tree) => {
    switch (tree.type) {
        case 'fail':
            return 'throw new Error("Failed");';
        case 'leaf':
            return `return ${JSON.stringify(tree.action)};`;
        case 'switch':
            const tests = [];
            for (const [ctor, A] of tree.tests) {
                if (ctor === '_') {
                    tests.push(`default:
                        ${exports.showDecisionTree(A)}
                    `);
                }
                else {
                    tests.push(`case "${ctor}":
                        ${exports.showDecisionTree(A)}
                    `);
                }
            }
            return `switch (${showOccurence(tree.occurence)}) {
                ${tests.join('\n')}
            }`;
    }
};


/***/ })
/******/ ]);