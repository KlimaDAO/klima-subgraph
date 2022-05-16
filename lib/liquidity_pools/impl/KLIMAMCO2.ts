import { IToken } from "../../tokens/IToken";
import { ILiquidityPool } from "../ILiquidityPool";

import * as constants from "../../utils/Constants";
import { KLIMA } from "../../tokens/impl/KLIMA";
import { MCO2 } from "../../tokens/impl/MCO2";
import { Address } from "@graphprotocol/graph-ts";


export class KLIMAMCO2LP implements ILiquidityPool {

    private contractAddress: Address;
    private klimaToken: IToken
    private mco2Token: IToken
  
    constructor(constractAddress: Address) {
      this.contractAddress = constractAddress;
      this.klimaToken = new KLIMA()
      this.mco2Token = new MCO2()
    }

    getLPName(): string {
        return constants.KLIMAUSDC_LPBOND_TOKEN
    }
    getToken1(): IToken {
        return this.klimaToken
    }
    getToken2(): IToken {
        return this.mco2Token
    }
    getAffectedTokensFromSwap(): IToken[] {
        const array =  new Array<IToken>()
        array.push(this.klimaToken)
        array.push(this.mco2Token)
 
        return array
    }
}
