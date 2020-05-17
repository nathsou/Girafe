"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gen = exports.randomElement = exports.pop = exports.traverseSymbols = exports.traverse = exports.time = exports.mapMut = exports.setFilter = exports.setMap = exports.unionMut = exports.union = exports.repeat = exports.indexed = exports.some = exports.iter = exports.once = exports.join = exports.reverse = void 0;
const Utils_1 = require("../Compiler/Utils");
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
