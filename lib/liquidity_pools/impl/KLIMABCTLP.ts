import { IToken } from "../../tokens/IToken";
import { ILiquidityPool } from "../ILiquidityPool";

import * as constants from "../../utils/Constants";
import { KLIMA } from "../../tokens/impl/KLIMA";
import { BCT } from "../../tokens/impl/BCT";
import { Address } from "@graphprotocol/graph-ts";


export class KLIMABCTLP implements ILiquidityPool {

    private contractAddress: Address;
    private klimaToken: IToken
    private bctToken: IToken
  
    constructor(constractAddress: Address) {
      this.contractAddress = constractAddress;
      this.klimaToken = new KLIMA()
      this.bctToken = new BCT()
    }

    getLPName(): string {
        return constants.KLIMABCT_LPBOND_TOKEN
    }
    getToken1(): IToken {
        return this.klimaToken
    }
    getToken2(): IToken {
        return this.bctToken
    }
    getAffectedTokensFromSwap(): IToken[] {
        const array =  new Array<IToken>()
        array.push(this.bctToken)
        array.push(this.klimaToken)
 
        return array
    }
}
