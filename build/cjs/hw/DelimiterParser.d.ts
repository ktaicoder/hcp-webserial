import { Observable } from 'rxjs';
export interface DelimiterParserOptions {
    delimiter: Uint8Array;
    includeDelimiter?: boolean;
}
declare type TransformFn = (upstream: Observable<Uint8Array>) => Observable<Uint8Array>;
declare type ChunkHandlerFn = (chunk: Uint8Array) => void;
export declare class DelimiterParser {
    private buffer;
    private delimiter;
    private includeDelimiter;
    constructor(opts: DelimiterParserOptions);
    enqueue: (chunk: Uint8Array, callback: ChunkHandlerFn) => void;
    static parse: (opts: DelimiterParserOptions) => TransformFn;
}
export {};
