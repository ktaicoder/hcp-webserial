export * from './hw/DelimiterParser'
export * from './hw/WebSerialDevice'
import { IHw } from '@ktaicoder/hcp-base'
import { wiseXboard } from './hw/wiseXboard'
import { wiseXboardPremium } from './hw/wiseXboardPremium'

export const hardwares: IHw[] = [wiseXboard, wiseXboardPremium]
