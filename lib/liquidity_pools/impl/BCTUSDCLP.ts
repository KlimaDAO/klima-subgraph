import { IToken } from "../../tokens/IToken";
import { ILiquidityPool } from "../ILiquidityPool";

import * as constants from "../../utils/Constants";
import { USDC } from "../../tokens/impl/USDC";
import { Address } from "@graphprotocol/graph-ts";
import { BCT } from "../../tokens/impl/BCT";


export class BCTUSDCLP implements ILiquidityPool {

    private contractAddress: Address;
    private bctToken: IToken
    private usdcToken: IToken
  
    constructor(constractAddress: Address) {
      this.contractAddress = constractAddress;
      this.bctToken = new BCT()
      this.usdcToken = new USDC()
    }

    getLPName(): string {
        return constants.BCTUSDC_LPBOND_TOKEN
    }
    getToken1(): IToken {
        return this.bctToken
    }
    getToken2(): IToken {
        return this.usdcToken
    }
    getAffectedTokensFromSwap(): Array<IToken> {

       const array =  new Array<IToken>()
       array.push(this.bctToken)

       return array
    }
}
