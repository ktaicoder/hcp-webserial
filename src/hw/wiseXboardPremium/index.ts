import { IHw } from '@ktaicoder/hcp-base'
import { WebSerialDevice } from '../WebSerialDevice'
import { WiseXboardPremiumControl } from './WiseXboardPremiumControl'

export const wiseXboardPremium: IHw = {
    hwId: 'wiseXboardPremium',
    hwKind: 'serial',
    createControl: (ctx: any) => {
        const { device } = ctx as { device: WebSerialDevice }
        return new WiseXboardPremiumControl(device)
    },
}
