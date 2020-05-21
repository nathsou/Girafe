import { reverse } from "./Utils";

type SourcePatch = {
    type: 'remove' | 'insert',
    startIndex: number,
    count: number
};

// represents the raw source code
export class Source {
    private _lines: string[];
    private patches: SourcePatch[];

    constructor(source: string) {
        this._lines = source.split('\n');
        this.patches = [];
    }

    private isLineValid(index: number): boolean {
        return index >= 0 && index < this._lines.length;
    }

    private isRangeValid(start: number, count: number): boolean {
        const end = start + count;
        return start >= 0 && start < this._lines.length &&
            count >= 0 && end < this._lines.length;
    }

    public removeLines(startIndex: number, count: number): number {
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

    public insert(index: number, source: string): number {
        return this.insertLines(index, ...source.split('\n'));
    }

    public insertLines(startIndex: number, ...lines: string[]): number {
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

    public updateLines(startIndex: number, ...newLines: string[]): void {
        if (this.isRangeValid(startIndex, newLines.length)) {
            newLines.forEach((line, idx) => {
                this._lines[startIndex + idx] = line;
            });
        }
    }

    public originalLineNumber(currentLine: number): number {
        let index = currentLine;

        for (const { type, startIndex, count } of reverse(this.patches)) {
            if (type === 'insert' && index >= startIndex) {
                index -= count;
            }

            if (type === 'remove' && index >= startIndex) {
                index += count;
            }
        }

        return index;
    }

    public *lines(): Generator<[string, number], void> {
        for (let i = 0; i < this._lines.length; i++) {
            yield [this._lines[i], i];
        }
    }

    public *linesReversed(): Generator<[string, number], void> {
        for (let i = this._lines.length - 1; i >= 0; i--) {
            yield [this._lines[i], i];
        }
    }

    public asString(): string {
        return this._lines.join('\n');
    }

}