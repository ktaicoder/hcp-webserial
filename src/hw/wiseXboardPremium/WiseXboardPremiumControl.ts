import { IHwControl } from '@ktaicoder/hcp-base'
import { filter, firstValueFrom, map, Observable, shareReplay, timestamp } from 'rxjs'
import { DelimiterParser } from '../DelimiterParser'
import { WebSerialDevice } from '../WebSerialDevice'

const DEBUG = true

const DELIMITER = new Uint8Array([0x23, 0x08, 0x0])

export class WiseXboardPremiumControl implements IHwControl {
    private chunk$: Observable<{ value: Uint8Array; timestamp: number }>

    constructor(private device_: WebSerialDevice) {
        this.chunk$ = this.device_.observeReceivedData().pipe(
            map((it) => it.dataBuffer),
            DelimiterParser.parse({
                delimiter: DELIMITER,
                includeDelimiter: false,
            }),
            timestamp(),
            shareReplay(1),
        )
    }

    observeData = (): Observable<Uint8Array> => {
        return this.chunk$.pipe(map((it) => it.value))
    }

    private readNext_ = async (ctx: any): Promise<Uint8Array> => {
        const minTimestamp = Date.now()
        return firstValueFrom(
            this.chunk$.pipe(
                filter((it) => it.timestamp > minTimestamp),
                map((it) => it.value),
            ),
        )
    }

    /**
     * 일곱개의 핀값을 읽는다
     */
    private async _read7(ctx: any): Promise<number[]> {
        const buf = await this.readNext_(ctx)

        if (buf.length != 8) {
            console.warn('check delimiter', [].slice.call(buf))
        }

        if (buf.length < 8) {
            throw new Error('invalid line')
        }

        let cksum = 0
        for (let i = 0; i < 7; i++) {
            cksum ^= buf[i]
        }

        if (cksum != buf[7]) {
            throw new Error('checksum mismatch')
        }

        return new Array(7).fill(0).map((_, i) => buf[i] ?? 0)
    }

    /**
     * 일곱개의 핀값을 읽는다
     * 첵섬이 다르거나, 구분자가 다르면 한번더 시도한다
     */
    private async _read7Retry(ctx: any): Promise<number[]> {
        let remainCount = 2
        for (let i = 0; i < remainCount; i++) {
            remainCount--
            try {
                const ret = await this._read7(ctx)
                console.log('_read7Retry() = ', ret)
                return ret
            } catch (err: any) {
                const msg: string = err.message ?? ''
                if (
                    msg.includes('checksum mismatch') ||
                    msg.includes('check delimiter') ||
                    msg.includes('invalid line')
                ) {
                    console.log('retry _read7()')
                    continue
                }

                throw err
            }
        }
        return new Array(7).fill(0)
    }

    /**
     * DC 모터1,2 속도 설정
     */
    async setDCMotorSpeedP(ctx: any, l1: number, r1: number, l2: number, r2: number): Promise<void> {
        if (l1 < -100) l1 = -100
        if (r1 < -100) r1 = -100
        if (l1 > 100) l1 = 100
        if (r1 > 100) r1 = 100
        if (l2 < -100) l2 = -100
        if (r2 < -100) r2 = -100
        if (l2 > 100) l2 = 100
        if (r2 > 100) r2 = 100
        if (l1 < 0) l1 = 256 + l1
        if (l2 < 0) l2 = 256 + l2
        if (r1 < 0) r1 = 256 + r1
        if (r2 < 0) r2 = 256 + r2

        if (DEBUG) console.log(`setDCMotorSpeedP : l1: ${l1}, r1:${r1}, l2:${l2}, r2: ${r2}`)
        const buf = [0x23, 5, 0x82, l1, r1, l2, r2, 0]
        let cksum = 0
        for (let i = 2; i < buf.length - 1; i++) {
            cksum ^= buf[i]
        }
        buf[buf.length - 1] = cksum
        await this.device_.write(new Uint8Array(buf))
    }

    /**
     * DC 모터1 속도 설정
     */
    async setDCMotor1SpeedP(ctx: any, l1: number, r1: number): Promise<void> {
        if (l1 < -100) l1 = -100
        if (r1 < -100) r1 = -100
        if (l1 > 100) l1 = 100
        if (r1 > 100) r1 = 100
        if (l1 < 0) l1 = 256 + l1
        if (r1 < 0) r1 = 256 + r1

        if (DEBUG) console.log(`setDCMotor1SpeedP : l1: ${l1}, r1:${r1}`)
        const buf = [0x23, 3, 0x85, l1, r1, 0]
        let cksum = 0
        for (let i = 2; i < buf.length - 1; i++) {
            cksum ^= buf[i]
        }
        buf[buf.length - 1] = cksum
        await this.device_.write(new Uint8Array(buf))
    }

    /**
     * DC 모터2 속도 설정
     */
    async setDCMotor2SpeedP(ctx: any, l2: number, r2: number): Promise<void> {
        if (l2 < -100) l2 = -100
        if (r2 < -100) r2 = -100
        if (l2 > 100) l2 = 100
        if (r2 > 100) r2 = 100
        if (l2 < 0) l2 = 256 + l2
        if (r2 < 0) r2 = 256 + r2

        if (DEBUG) console.log(`setDCMotor2SpeedP : l2: ${l2}, r2:${r2}`)
        const buf = [0x23, 3, 0x86, l2, r2, 0]
        let cksum = 0
        for (let i = 2; i < buf.length - 1; i++) {
            cksum ^= buf[i]
        }
        buf[buf.length - 1] = cksum
        await this.device_.write(new Uint8Array(buf))
    }

    /**
     * 모든 DC 모터 끄기
     */
    async stopDCMotorP(ctx: any): Promise<void> {
        if (DEBUG) console.log('stopDCMotorP()')
        const pkt = [0x23, 1, 0x83, 0]
        let cksum = 0
        for (let i = 2; i < pkt.length - 1; i++) {
            cksum ^= pkt[i]
        }
        pkt[pkt.length - 1] = cksum
        await this.device_.write(new Uint8Array(pkt))
    }

    /**
     * n번핀 서보모터 각도 angle로 정하기
     * pinNum = [1,5], angle=[-90, 90]
     */
    async setServoMotorAngleP(ctx: any, pinNum: number, angle: number): Promise<void> {
        if (DEBUG) console.log(`setServoMotorAngleP() : pinNo:${pinNum}, angle:${angle}`)

        if (angle < -90) angle = -90
        if (angle > 90) angle = 90
        if (angle < 0) angle = 255 + angle

        // 기존에 속도값은 전달하지 않는다
        // if (speed > 30) speed = 30
        // if (speed < 1) speed = 1
        const speed = 20

        if (pinNum < 3) pinNum = 3
        if (pinNum > 6) pinNum = 6

        let cksum = 0
        const buf = [0x23, 4, 0x81, pinNum, angle, speed, 0]
        for (let i = 2; i < buf.length - 1; i++) {
            cksum ^= buf[i]
        }
        buf[buf.length - 1] = cksum
        await this.device_.write(new Uint8Array(buf))
    }

    /**
     * 리모콘 값 읽기
     */
    async readRemoconP(ctx: any): Promise<number> {
        if (DEBUG) console.log('readRemoconP()')
        const values = await this._read7Retry(ctx)
        return values[6]
    }

    /**
     * 아날로그 핀 읽기
     * 일곱개의 핀값을 모두 가져온다
     */
    async analogReadP(ctx: any, pinNum: number): Promise<number> {
        if (DEBUG) console.log('analogReadP()')
        // [pin1 ~ pin7]
        const values = await this._read7Retry(ctx)
        return values[pinNum - 1]
    }

    /**
     * 디지털 핀 읽기
     * 일곱개의 핀값을 모두 가져온다
     */
    async digitalReadP(ctx: any, pinNum: number): Promise<number> {
        if (DEBUG) console.log('digitalReadP()')
        // [pin1 ~ pin7]
        const values = await this._read7Retry(ctx)
        const v = values[pinNum - 1]
        return v > 100 ? 1 : 0
    }

    /**
     * 디지털 n번핀 value로 정하기
     * pinNum = [0~5], value = [0,1]
     */
    async digitalWriteP(ctx: any, pinNum: number, value: number): Promise<void> {
        value = value <= 0 ? 0 : 1
        pinNum = pinNum <= 0 ? 0 : pinNum >= 5 ? 5 : pinNum
        if (DEBUG) console.log(`digitalWriteP : pinNo: ${pinNum}, value:${value}`)

        let cksum = 0
        const buf = [0x23, 3, 0x80, pinNum, value, 0]
        for (let i = 2; i < buf.length - 1; i++) {
            cksum ^= buf[i]
        }
        buf[buf.length - 1] = cksum
        if (DEBUG) console.log(`digitalWriteP : buf=`, buf)
        await this.device_.write(new Uint8Array(buf))
    }

    /**
     * 키값 전송
     */
    async sendKeyP(key: number): Promise<void> {
        if (DEBUG) console.log(`sendKeyP(): key: ${key}`)

        let cksum = 0
        const buf = [0x23, 2, 0x84, key, 0]
        for (let i = 2; i < buf.length - 1; i++) {
            cksum ^= buf[i]
        }
        buf[buf.length - 1] = cksum
        await this.device_.write(new Uint8Array(buf))
    }

    onAfterOpen = async (ctx: any): Promise<void> => {
        if (DEBUG) console.log('XXX onAfterOpen()')
    }

    onBeforeClose = async (ctx: any): Promise<void> => {
        if (DEBUG) console.log('XXX onBeforeClose()')
        if (!this.device_.isOpened) return

        // 모터 중지
        try {
            await this.stopDCMotorP(ctx)
        } catch (err) {}

        // 모든 LED OFF
        try {
            // 아무핀에나 0을 쓰면 모두 0이 된다.
            for (let i = 0; i < 7; i++) {
                await this.digitalWriteP(ctx, i, 0)
            }
        } catch (ignore) {}
    }
}
