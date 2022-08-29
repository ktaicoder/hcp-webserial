import { IHw } from '@ktaicoder/hcp-base'
import { WebSerialDevice } from '../WebSerialDevice'
import { WiseXboardControl } from './WiseXboardControl'

const DELIMITER = Buffer.from([0x52, 0x58, 0x3d, 0x0, 0x0e])

export const wiseXboard: IHw = {
    hwId: 'wiseXboard',
    hwKind: 'serial',
    createControl: (ctx: any) => {
        const { device } = ctx as { device: WebSerialDevice }
        return new WiseXboardControl(device)
    },
}
