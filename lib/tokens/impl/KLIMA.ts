import { BigDecimal, BigInt, Address, log } from "@graphprotocol/graph-ts";
import { ERC20 } from '../../../bonds/generated/BCTBondV1/ERC20'
import { IToken } from "../IToken";

import * as constants from '../../utils/Constants'
import { toDecimal } from "../../utils/Decimals"


export class KLIMA implements IToken {

    contractAddress: string = constants.KLIMA_ERC20_V1_CONTRACT
    static DECIMALS: number = 9

    getERC20ContractAddress(): string {
        return this.contractAddress
    }

    getTokenName(): string {
        return "KLIMA"
    }
    getDecimals(): number {
        return KLIMA.DECIMALS
    }
    getFormattedPrice(rawPrice: BigInt): BigDecimal {
        return toDecimal(rawPrice, this.getDecimals())
    }
    getMarketPrice(): BigDecimal {
        throw new Error("Method not implemented.");
    }
    getTotalSupply(): BigDecimal {
        let ercContract = ERC20.bind(Address.fromString(this.contractAddress))
        let totalSupply = toDecimal(ercContract.totalSupply(), this.getDecimals())
     
        return totalSupply
    }
}