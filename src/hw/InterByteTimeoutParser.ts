import { Observable } from 'rxjs'

export interface InterByteTimeoutOptions {
    /** the period of silence in milliseconds after which data is emitted */
    interval: number

    /** the maximum number of bytes after which data will be emitted. Defaults to 65536 */
    maxBufferSize?: number
}

type TransformFn = (upstream: Observable<Uint8Array>) => Observable<Uint8Array>
type ChunkHandlerFn = (chunk: Uint8Array) => void

export class InterByteTimeoutParser {
    private maxBufferSize_: number

    private currentPacket_: number[]

    private interval_: number

    private intervalID_?: NodeJS.Timeout

    private chunkCallback_: ChunkHandlerFn

    constructor({ maxBufferSize = 65536, interval }: InterByteTimeoutOptions, chunkCallback: ChunkHandlerFn) {
        if (!interval) {
            throw new TypeError('"interval" is required')
        }

        if (typeof interval !== 'number' || Number.isNaN(interval)) {
            throw new TypeError('"interval" is not a number')
        }

        if (interval < 1) {
            throw new TypeError('"interval" is not greater than 0')
        }

        if (typeof maxBufferSize !== 'number' || Number.isNaN(maxBufferSize)) {
            throw new TypeError('"maxBufferSize" is not a number')
        }

        if (maxBufferSize < 1) {
            throw new TypeError('"maxBufferSize" is not greater than 0')
        }

        this.maxBufferSize_ = maxBufferSize
        this.currentPacket_ = []
        this.interval_ = interval
        this.chunkCallback_ = chunkCallback
    }

    enqueue = (chunk: Uint8Array) => {
        if (this.intervalID_) {
            clearTimeout(this.intervalID_)
        }

        for (let offset = 0; offset < chunk.length; offset++) {
            this.currentPacket_.push(chunk[offset])
            if (this.currentPacket_.length >= this.maxBufferSize_) {
                this.emitPacket_()
            }
        }

        this.cancelTimer()
        this.intervalID_ = setTimeout(this.emitPacket_, this.interval_)
    }

    private emitPacket_ = () => {
        this.cancelTimer()

        if (this.currentPacket_.length > 0) {
            this.chunkCallback_(new Uint8Array(this.currentPacket_))
        }
        this.currentPacket_ = []
    }

    cancelTimer = () => {
        if (this.intervalID_) {
            clearTimeout(this.intervalID_)
            this.intervalID_ = undefined
        }
    }

    static parse = (opts: InterByteTimeoutOptions): TransformFn => {
        return (upstream: Observable<Uint8Array>) => {
            return new Observable((subscriber) => {
                const onChunk = (chunk: Uint8Array) => {
                    if (!subscriber.closed && chunk.length > 0) {
                        subscriber.next(chunk)
                    }
                }
                const parser = new InterByteTimeoutParser(opts, onChunk)
                const subscription = upstream.subscribe({
                    next: parser.enqueue,
                    error: subscriber.error,
                    complete: subscriber.complete,
                })

                return () => {
                    parser.cancelTimer()
                    subscription.unsubscribe()
                }
            })
        }
    }
}
