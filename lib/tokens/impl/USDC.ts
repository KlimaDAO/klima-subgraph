import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { IToken } from "../IToken";

import { toDecimal } from "../../utils/Decimals"


export class USDC implements IToken {

    static DECIMALS: number = 12

    getERC20ContractAddress(): string {
        throw new Error("Method not implemented.");
    }

    getTokenName(): string {
        return "USDC"
    }
    getDecimals(): number {
        return USDC.DECIMALS
    }
    getFormattedPrice(rawPrice: BigInt): BigDecimal {
        return toDecimal(rawPrice, this.getDecimals())
    }
    getMarketPrice(): BigDecimal {
        throw new Error("Method not implemented.");
    }
    getTotalSupply(): BigDecimal {
        throw new Error("Method not implemented.");
    }
}