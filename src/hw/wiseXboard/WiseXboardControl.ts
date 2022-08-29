import { IHwControl } from '@ktaicoder/hcp-base'
import { filter, firstValueFrom, map, Observable, shareReplay, timestamp } from 'rxjs'
import { DelimiterParser } from '../DelimiterParser'
import { WebSerialDevice } from '../WebSerialDevice'

const DEBUG = true

const DELIMITER = new Uint8Array([0x52, 0x58, 0x3d, 0x0, 0x0e])

const chr = (ch: string): number => ch.charCodeAt(0)

export class WiseXboardControl implements IHwControl {
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

    private readNext_ = async (ctx: any): Promise<Uint8Array> => {
        const minTimestamp = Date.now()
        return firstValueFrom(
            this.chunk$.pipe(
                filter((it) => it.timestamp > minTimestamp),
                map((it) => it.value),
            ),
        )
    }

    observeData = (): Observable<Uint8Array> => {
        return this.chunk$.pipe(map((it) => it.value))
    }

    // isReadable = (): boolean => {
    //     return this.device_.isOpened()
    // }

    private async sendPacketMRTEXE_(exeIndex: number) {
        const pkt = [0xff, 0xff, 0x4c, 0x53, 0, 0, 0, 0, 0x30, 0x0c, 0x03, exeIndex, 0, 100, 0]
        for (let i = 6; i < 14; i++) {
            pkt[14] += pkt[i]
        }
        await this.device_.write(new Uint8Array(pkt))
    }

    analogRead = async (ctx: any): Promise<number[]> => {
        const values = await this.readNext_(ctx)
        // [pin1 ~ pin5]
        return new Array(5).fill(0).map((_, i) => values[i] ?? 0)
    }

    digitalRead = async (ctx: any): Promise<number[]> => {
        const values = await this.analogRead(ctx)
        // [pin1 ~ pin5]
        return values.map((v) => (v > 100 ? 1 : 0))
    }

    digitalWrite = async (ctx: any, pin: number, value: number): Promise<void> => {
        value = value > 0 ? 1 : 0

        const pkt = [chr('X'), chr('R'), 2, 0, 0, 0, 0, 0, chr('S')]
        pkt[2 + pin] = value
        if (DEBUG) console.log(`digitalWrite: pin=${pin}, value=${value}`)
        await this.device_.write(new Uint8Array(pkt))
    }

    setHumanoidMotion = async (ctx: any, index: number): Promise<void> => {
        const pkt = [0xff, 0xff, 0x4c, 0x53, 0, 0, 0, 0, 0x30, 0x0c, 0x03, index, 0, 100, 0]
        for (let i = 6; i < 14; i++) {
            pkt[14] += pkt[i]
        }
        await this.device_.write(new Uint8Array(pkt))
    }

    stopDCMotor = async (ctx: any): Promise<void> => {
        const pkt = [chr('X'), chr('R'), 0, 0, 0, 0, 0, 0, chr('S')]
        await this.device_.write(new Uint8Array(pkt))
        await this.sendPacketMRTEXE_(2)
    }

    setDCMotorSpeed = async (ctx: any, l1: number, r1: number, l2: number, r2: number): Promise<void> => {
        if (l1 < -10) l1 = -10
        if (r1 < -10) r1 = -10
        if (l2 > 10) l2 = 10
        if (r2 > 10) r2 = 10

        if (l1 < 0) l1 = 256 + l1
        if (l2 < 0) l2 = 256 + l2
        if (r1 < 0) r1 = 256 + r1
        if (r2 < 0) r2 = 256 + r2
        if (DEBUG) console.log(`setDCMotorSpeed : l1: ${l1}, r1:${r1}, l2:${l2}, r2: ${r2}`)
        await this.device_.write(new Uint8Array([chr('X'), chr('R'), 0, l1, r1, l2, r2, 0, chr('S')]))
        await this.sendPacketMRTEXE_(2)
    }

    setServoMotorAngle = async (ctx: any, pinNum: number, angle: number): Promise<void> => {
        if (DEBUG) console.log(`setServoMotorAngle : pinNo: ${pinNum}, angle:${angle}`)

        if (angle < -90) angle = -90
        if (angle > 90) angle = 90
        if (angle < 0) angle = 255 + angle

        if (pinNum < 1) pinNum = 1
        if (pinNum > 5) pinNum = 5

        await this.device_.write(new Uint8Array([chr('X'), chr('R'), 3, pinNum, angle, 0, 0, 0, chr('S')]))
        await this.sendPacketMRTEXE_(2)
    }

    onAfterOpen = async (ctx: any): Promise<void> => {
        if (DEBUG) console.log('XXX onAfterOpen()')
    }

    onBeforeClose = async (ctx: any): Promise<void> => {
        if (DEBUG) console.log('XXX onBeforeClose()')

        // 모터 중지
        try {
            await this.stopDCMotor(ctx)
        } catch (err) {}

        try {
            // 모든 LED OFF
            // 아무핀에나 0을 쓰면 모두 0이 된다.
            await this.digitalWrite(ctx, 1, 0)
        } catch (ignore) {}
    }
}
