export declare class Source {
    private _lines;
    private patches;
    constructor(source: string);
    private isLineValid;
    private isRangeValid;
    removeLines(startIndex: number, count: number): number;
    insert(index: number, source: string): number;
    insertLines(startIndex: number, ...lines: string[]): number;
    updateLines(startIndex: number, ...newLines: string[]): void;
    originalLineNumber(currentLine: number): number;
    lines(): Generator<[string, number], void>;
    linesReversed(): Generator<[string, number], void>;
    asString(): string;
}
