import { IHwControl } from '@ktaicoder/hcp-base';
import { Observable } from 'rxjs';
import { WebSerialDevice } from '../WebSerialDevice';
export declare class WiseXboardControl implements IHwControl {
    private device_;
    private chunk$;
    constructor(device_: WebSerialDevice);
    private readNext_;
    observeData: () => Observable<Uint8Array>;
    private sendPacketMRTEXE_;
    analogRead: (ctx: any) => Promise<number[]>;
    digitalRead: (ctx: any) => Promise<number[]>;
    digitalWrite: (ctx: any, pin: number, value: number) => Promise<void>;
    setHumanoidMotion: (ctx: any, index: number) => Promise<void>;
    stopDCMotor: (ctx: any) => Promise<void>;
    setDCMotorSpeed: (ctx: any, l1: number, r1: number, l2: number, r2: number) => Promise<void>;
    setServoMotorAngle: (ctx: any, pinNum: number, angle: number) => Promise<void>;
    onAfterOpen: (ctx: any) => Promise<void>;
    onBeforeClose: (ctx: any) => Promise<void>;
}
