import { IToken } from "../../tokens/IToken";
import { ILiquidityPool } from "../ILiquidityPool";

import * as constants from "../../utils/Constants";
import { KLIMA } from "../../tokens/impl/KLIMA";
import { USDC } from "../../tokens/impl/USDC";
import { Address } from "@graphprotocol/graph-ts";


export class KLIMAUSDCLP implements ILiquidityPool {

    private contractAddress: Address;
    private klimaToken: IToken
    private usdcToken: IToken
  
    constructor(constractAddress: Address) {
      this.contractAddress = constractAddress;
      this.klimaToken = new KLIMA()
      this.usdcToken = new USDC()
    }

    getLPName(): string {
        return constants.KLIMAUSDC_LPBOND_TOKEN
    }
    getToken1(): IToken {
        return this.klimaToken
    }
    getToken2(): IToken {
        return this.usdcToken
    }
    getAffectedTokensFromSwap(): IToken[] {
        const array =  new Array<IToken>()
        array.push(this.klimaToken)
 
        return array
    }
}
