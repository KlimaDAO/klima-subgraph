import { IToken } from "../../tokens/IToken";
import { ILiquidityPool } from "../ILiquidityPool";

import * as constants from "../../utils/Constants";
import { KLIMA } from "../../tokens/impl/KLIMA";
import { Address } from "@graphprotocol/graph-ts";
import { UBO } from "../../tokens/impl/UBO";


export class KLIMANBOLP implements ILiquidityPool {

    private contractAddress: Address;
    private klimaToken: IToken
    private nboToken: IToken
  
    constructor(constractAddress: Address) {
      this.contractAddress = constractAddress;
      this.klimaToken = new KLIMA()
      this.nboToken = new UBO()
    }

    getLPName(): string {
        return constants.KLIMAUSDC_LPBOND_TOKEN
    }
    getToken1(): IToken {
        return this.klimaToken
    }
    getToken2(): IToken {
        return this.nboToken
    }
    getAffectedTokensFromSwap(): IToken[] {
        const array =  new Array<IToken>()
        array.push(this.nboToken)
 
        return array
    }
}
