import {
    BehaviorSubject,
    EMPTY,
    filter,
    firstValueFrom,
    map,
    Observable,
    Subject,
    switchMap,
    take,
    timeout,
} from 'rxjs'
import { BufferTimestamped, HwDeviceState, IDevice } from '@ktaicoder/hcp-base'

export class WebSerialDevice implements IDevice {
    DEBUG = false

    private deviceState$ = new BehaviorSubject<HwDeviceState>('closed')

    private receivedData$ = new Subject<BufferTimestamped>()

    private port_?: SerialPort

    private reader_?: ReadableStreamDefaultReader

    private writer_?: WritableStreamDefaultWriter

    private readLoopPromise_?: Promise<void>

    private writablePromise_?: Promise<void>

    getRawSerialPort = (): SerialPort | undefined => {
        return this.port_
    }

    /**
     * implement IDevice
     */
    observeDeviceState = (): Observable<HwDeviceState> => this.deviceState$.asObservable()

    /**
     * implement IDevice
     */
    waitUntilOpened = (timeoutMilli = 0): Promise<boolean> => {
        if (timeoutMilli > 0) {
            return firstValueFrom(
                this.deviceState$.pipe(
                    filter((it) => it === 'opened'),
                    take(1),
                    timeout({ first: timeoutMilli }),
                    map(() => true),
                ),
            )
        } else {
            return firstValueFrom(
                this.deviceState$.pipe(
                    filter((it) => it === 'opened'),
                    take(1),
                    map(() => true),
                ),
            )
        }
    }

    /**
     * implement IDevice
     */
    observeReceivedData = (): Observable<BufferTimestamped> => {
        return this.deviceState$.pipe(
            switchMap((state) => (state === 'opened' ? this.receivedData$.asObservable() : EMPTY)),
        )
    }

    /**
     * 연결 여부
     * implement IDevice
     */
    isOpened = (): boolean => {
        return this.deviceState$.value === 'opened'
    }

    private closeAndWait_ = async () => {
        if (this.deviceState$.value === 'closed') return
        if (this.deviceState$.value !== 'closing') {
            if (this.DEBUG) console.log('WebSerialDevice.closeAndWait_()')
            this.close()
        }
        await firstValueFrom(this.deviceState$.pipe(filter((it) => it === 'closed')))
    }

    /**
     * 디바이스 열기
     * implement IDevice
     */
    open = async (port: SerialPort, options: SerialOptions): Promise<void> => {
        if (this.DEBUG) console.log('WebSerialDevice.open()', options)
        await this.closeAndWait_()
        if (this.DEBUG) console.log('WebSerialDevice.open() opening')
        this.deviceState$.next('opening')

        if (!port.readable) {
            try {
                if (this.DEBUG) console.log('WebSerialDevice.open() : port.open() called')
                await port.open(options)
            } catch (err) {
                console.log(err)
            }
        }

        if (!port.readable) {
            console.warn('WebSerialDevice.open() : port.open() failed, port is not readable')
            this.deviceState$.next('closed')
            return
        }

        this.onOpened_(port)
    }

    private onOpened_ = (port: SerialPort) => {
        if (this.DEBUG) console.debug('WebSerialDevice.onOpened_()')
        this.port_ = port
        this.deviceState$.next('opened')
        this.readLoopPromise_ = this.startReadLoop_()
    }

    private startReadLoop_ = async () => {
        while (this.deviceState$.value === 'opened') {
            if (this.DEBUG) {
                if (!this.port_) {
                    console.warn('WebSerialDevice.startReadLoop_() this.port_ is null')
                } else if (!this.port_.readable) {
                    console.warn('WebSerialDevice.startReadLoop_() this.port_.readable is null')
                }
            }

            if (!this.port_ || !this.port_.readable) {
                await new Promise((resolve) => setTimeout(resolve, 100)).catch(() => {
                    /*  ignore */
                })
                continue
            }

            if (this.DEBUG) console.log('SerialPortManager.startReadLoop_() locked reader')
            const reader = this.port_.readable.getReader()
            this.reader_ = reader
            try {
                while (this.deviceState$.value === 'opened') {
                    const { value: dataBuffer, done } = await reader.read()
                    if (done) {
                        break
                    }

                    if (dataBuffer) {
                        this.receivedData$.next({ timestamp: Date.now(), dataBuffer })
                    }
                }
            } catch (err) {
                // Handle non-fatal
                console.info('ignore error', err)
            } finally {
                if (this.DEBUG) console.log('SerialPortManager.startReadLoop_() reader.releaseLock()')
                reader.releaseLock()
                this.reader_ = undefined
            }
        }
    }

    /**
     * write to serial port
     * @param value data to send
     * @returns Promise<void>
     *
     * implement IDevice
     */
    write = async (value: Uint8Array): Promise<void> => {
        const port = this.port_
        if (!port) {
            console.log('port is not bound')
            return
        }
        if (!port.writable) {
            console.log('port is not writable')
            return
        }

        if (port.writable.locked) {
            console.log('port is locked')
            return
        }
        const writer = port.writable.getWriter()
        try {
            this.writer_ = writer
            await writer.write(value)
        } finally {
            writer.releaseLock()
            this.writer_ = undefined
        }
    }

    /**
     * implement IDevice
     */
    close = async () => {
        if (this.deviceState$.value === 'closed') {
            console.log('ignore close, already closed')
            return
        }

        if (this.deviceState$.value === 'closing') {
            console.log('ignore close, already closing')
            return
        }

        this.deviceState$.next('closing')
        if (this.reader_) {
            await this.reader_.cancel()
            this.reader_ = undefined
        }

        if (this.readLoopPromise_) {
            await this.readLoopPromise_.catch(() => {
                /* ignore error */
            })
            this.readLoopPromise_ = undefined
        }

        if (this.writer_) {
            if (!this.writer_.closed) {
                await this.writer_.close()
            }
            this.writer_ = undefined
        }

        if (this.writablePromise_) {
            await this.writablePromise_
            this.writablePromise_ = undefined
        }

        if (this.port_) {
            await this.port_.close().catch(() => {
                /* ignore error */
            })
            this.port_ = undefined
        }

        this.deviceState$.next('closed')
    }
}
