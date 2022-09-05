export * from './hw/DelimiterParser'
export * from './hw/InterByteTimeoutParser'
export * from './hw/WebSerialDevice'
import { IHw } from '@ktaicoder/hcp-base'
import { wiseXboard } from './hw/wiseXboard'
import { wiseXboardPremium } from './hw/wiseXboardPremium'

export const webSerialHardwares: IHw[] = [wiseXboard, wiseXboardPremium]

export const webSerialHardwareMap: Record<string, IHw> = webSerialHardwares.reduce((acc, cur) => {
    acc[cur.hwId] = cur
    return acc
}, {})
