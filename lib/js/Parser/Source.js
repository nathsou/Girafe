"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
const Utils_1 = require("./Utils");
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
        return index;
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
