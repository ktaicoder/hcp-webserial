import { IHwControl } from '@ktaicoder/hcp-base';
import { Observable } from 'rxjs';
import { WebSerialDevice } from '../WebSerialDevice';
export declare class WiseXboardPremiumControl implements IHwControl {
    private device_;
    private chunk$;
    constructor(device_: WebSerialDevice);
    private readNext_;
    observeData: () => Observable<Uint8Array>;
    isReadable: () => boolean;
    /**
     * DC 모터1,2 속도 설정
     */
    setDCMotorSpeedP(l1: number, r1: number, l2: number, r2: number): Promise<void>;
    /**
     * DC 모터1 속도 설정
     */
    setDCMotor1SpeedP(l1: number, r1: number): Promise<void>;
    /**
     * DC 모터2 속도 설정
     */
    setDCMotor2SpeedP(l2: number, r2: number): Promise<void>;
    /**
     * 일곱개의 핀값을 읽는다
     */
    private _read7;
    /**
     * 일곱개의 핀값을 읽는다
     * 첵섬이 다르거나, 구분자가 다르면 한번더 시도한다
     */
    private _read7Retry;
    /**
     * 모든 DC 모터 끄기
     */
    stopDCMotorP(): Promise<void>;
    /**
     * n번핀 서보모터 각도 angle로 정하기
     * pinNum = [1,5], angle=[-90, 90]
     */
    setServoMotorAngleP(pinNum: number, angle: number): Promise<void>;
    /**
     * 리모콘 값 읽기
     */
    readRemoconP(): Promise<number>;
    /**
     * 아날로그 핀 읽기
     * 일곱개의 핀값을 모두 가져온다
     */
    analogReadP(): Promise<number[]>;
    /**
     * 디지털 핀 읽기
     * 일곱개의 핀값을 모두 가져온다
     */
    digitalReadP(): Promise<number[]>;
    /**
     * 디지털 n번핀 value로 정하기
     * pinNum = [0~5], value = [0,1]
     */
    digitalWriteP(pinNum: number, value: number): Promise<void>;
    /**
     * 키값 전송
     */
    sendKeyP(key: number): Promise<void>;
    onAfterOpen: () => Promise<void>;
    onBeforeClose: () => Promise<void>;
}
