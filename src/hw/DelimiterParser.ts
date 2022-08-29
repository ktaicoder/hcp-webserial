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

  constructor(opts: DelimiterParserOptions) {
    this.delimiter = opts.delimiter
    this.includeDelimiter = opts.includeDelimiter === true
    this.buffer = new Uint8Array(0)
  }

  enqueue = (chunk: Uint8Array, callback: ChunkHandlerFn) => {
    let data = arrayConcat(this.buffer, chunk)
    let pos
    while ((pos = arrayIndexOf(data, this.delimiter)) !== -1) {
      const pktLen = pos + (this.includeDelimiter ? this.delimiter.length : 0)
      callback(data.slice(0, pktLen))
      data = data.slice(pos + this.delimiter.length)
    }

    // TODO 최대 버퍼링 길이보다 크면 버리는게 좋겠다
    this.buffer = data
  }

  static parse = (opts: DelimiterParserOptions): TransformFn => {
    const parser = new DelimiterParser(opts)
    return (upstream: Observable<Uint8Array>) => {
      return new Observable((subscriber) => {
        const subscription = upstream.subscribe({
          next: (chunk) => {
            if (!subscriber.closed) {
              parser.enqueue(chunk, (parsedChunk) => {
                if (!subscriber.closed && parsedChunk.length > 0) {
                  subscriber.next(parsedChunk)
                }
              })
            }
          },
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
