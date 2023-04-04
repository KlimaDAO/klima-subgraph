import { Address } from '@graphprotocol/graph-ts'

import { IToken } from './IToken'
import * as constants from '../utils/Constants'
import { KLIMA } from './impl/KLIMA'
import { BCT } from './impl/BCT'
// import { MCO2 } from './impl/MCO2'
import { UBO } from './impl/UBO'
import { NBO } from './impl/NBO'
import { NCT } from './impl/NCT'
import { USDC } from './impl/USDC'

export class TokenFactory {
    constructor() {}

    public getTokenForAddress(address: Address): IToken {
        if (address == constants.BCT_ERC20_CONTRACT) {
            return new BCT()
        }
        // if (address == constants.MCO2_ERC20_CONTRACT) {
        //     return new MCO2()
        // }
        if (address == constants.UBO_ERC20_CONTRACT) {
            return new UBO()
        }
        if (address == constants.NBO_ERC20_CONTRACT) {
            return new NBO()
        }
        if (address == constants.NCT_ERC20_CONTRACT) {
            return new NCT()
        }
        if (address == constants.KLIMA_ERC20_CONTRACT) {
            return new KLIMA()
        }
        if (address == constants.USDC_ERC20_CONTRACT) {
            return new USDC()
        }

        throw new Error('[Token Factory] Failed to get Token for address: ' + address.toHexString())
    }
}
