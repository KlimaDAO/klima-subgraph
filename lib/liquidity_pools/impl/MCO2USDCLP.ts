import { IToken } from "../../tokens/IToken";
import { ILiquidityPool } from "../ILiquidityPool";

import * as constants from "../../utils/Constants";
import { USDC } from "../../tokens/impl/USDC";
import { Address } from "@graphprotocol/graph-ts";
import { MCO2 } from "../../tokens/impl/MCO2";


export class MCO2USDCLP implements ILiquidityPool {

    private contractAddress: Address;
    private mco2Token: IToken
    private usdcToken: IToken
  
    constructor(constractAddress: Address) {
      this.contractAddress = constractAddress;
      this.mco2Token = new MCO2()
      this.usdcToken = new USDC()
    }

    getLPName(): string {
        return constants.BCTUSDC_LPBOND_TOKEN
    }
    getToken1(): IToken {
        return this.mco2Token
    }
    getToken2(): IToken {
        return this.usdcToken
    }
    getAffectedTokensFromSwap(): IToken[] {
        const array =  new Array<IToken>()
        array.push(this.mco2Token)
 
        return array
    }
}
