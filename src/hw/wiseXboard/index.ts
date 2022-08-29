import { IHw } from '@ktaicoder/hcp-base'
import { WebSerialDevice } from '../WebSerialDevice'
import { WiseXboardControl } from './WiseXboardControl'

export const wiseXboard: IHw = {
    hwId: 'wiseXboard',
    hwKind: 'serial',
    createControl: (ctx: any) => {
        const { device } = ctx as { device: WebSerialDevice }
        return new WiseXboardControl(device)
    },
}
