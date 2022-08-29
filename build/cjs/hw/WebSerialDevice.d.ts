/// <reference types="w3c-web-serial" />
import { Observable } from "rxjs";
import { BufferTimestamped, HwDeviceState, IDevice } from "@ktaicoder/hcp-base";
export declare class WebSerialDevice implements IDevice {
    private deviceState$;
    private receivedData$;
    private port_?;
    private reader_?;
    private writer_?;
    private readLoopPromise_?;
    private writablePromise_?;
    /**
     * implement IDevice
     */
    observeDeviceState: () => Observable<HwDeviceState>;
    /**
     * implement IDevice
     */
    waitUntilOpened: (timeoutMilli?: number) => Promise<boolean>;
    /**
     * implement IDevice
     */
    observeReceivedData: () => Observable<BufferTimestamped>;
    /**
     * 연결 여부
     * implement IDevice
     */
    isOpened: () => boolean;
    /**
     * 디바이스 열기
     * implement IDevice
     */
    open: (port: SerialPort, options: SerialOptions) => Promise<void>;
    private onOpened_;
    private startReadLoop_;
    /**
     * write to serial port
     * @param value data to send
     * @returns Promise<void>
     *
     * implement IDevice
     */
    write: (value: Uint8Array) => Promise<void>;
    /**
     * implement IDevice
     */
    close: () => Promise<void>;
}
