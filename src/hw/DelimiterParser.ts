import { Observable } from 'rxjs'
import { arrayConcat, arrayIndexOf } from './util'

export interface DelimiterParserOptions {
    delimiter: Uint8Array
    includeDelimiter?: boolean
}

type TransformFn = (upstream: Observable<Uint8Array>) => Observable<Uint8Array>
type ChunkHandlerFn = (chunk: Uint8Array) => void

export class DelimiterParser {
    private buffer: Uint8Array

    private delimiter: Uint8Array

    private includeDelimiter: boolean

    private chunkCallback_: ChunkHandlerFn

    constructor(opts: DelimiterParserOptions, chunkCallback: ChunkHandlerFn) {
        this.delimiter = opts.delimiter
        this.includeDelimiter = opts.includeDelimiter === true
        this.buffer = new Uint8Array(0)
        this.chunkCallback_ = chunkCallback
    }

    enqueue = (chunk: Uint8Array) => {
        let data = arrayConcat(this.buffer, chunk)
        let pos
        while ((pos = arrayIndexOf(data, this.delimiter)) !== -1) {
            const pktLen = pos + (this.includeDelimiter ? this.delimiter.length : 0)
            this.chunkCallback_(data.slice(0, pktLen))
            data = data.slice(pos + this.delimiter.length)
        }

        if (data.byteLength > 65535) {
            // delimiter를 못찾았으면 모두 버린다.
            this.buffer = new Uint8Array()
        } else {
            this.buffer = data
        }
    }

    static parse = (opts: DelimiterParserOptions): TransformFn => {
        return (upstream: Observable<Uint8Array>) => {
            return new Observable((subscriber) => {
                const onChunk = (chunk: Uint8Array) => {
                    if (!subscriber.closed && chunk.length > 0) {
                        subscriber.next(chunk)
                    }
                }
                const parser = new DelimiterParser(opts, onChunk)
                const subscription = upstream.subscribe({
                    next: parser.enqueue,
                    error: subscriber.error,
                    complete: subscriber.complete,
                })

                return () => {
                    subscription.unsubscribe()
                }
            })
        }
    }
}
