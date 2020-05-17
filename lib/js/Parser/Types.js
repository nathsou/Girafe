"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapKeys = exports.mapValues = exports.mapEntries = exports.mapGet = exports.mapHas = exports.mapSet = void 0;
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
