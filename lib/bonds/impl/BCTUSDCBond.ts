import { BigDecimal, BigInt, Address, log } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { UniswapV2Pair } from "../../../bonds/generated/BCTBondV1/UniswapV2Pair";
import { IBondable } from "../IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { BCT } from "../../tokens/impl/BCT";
import { USDC } from "../../tokens/impl/USDC";

export class BCTUSDCBond implements IBondable {
  
  contractAddress: Address;

  bctToken: IToken
  usdcToken: IToken

  constructor(constractAddress: Address) {
    this.contractAddress = constractAddress;
    this.bctToken = new BCT()
    this.usdcToken = new USDC()
  }

  getToken(): IToken {
    return this.bctToken
  }

  getBondName(): string {
    return constants.BCTUSDC_LPBOND_TOKEN;
  }

  getBondFee(): BigDecimal {
    let bondContract = BondV1.bind(this.contractAddress);
    let feeRaw = bondContract.terms().value4;
    const feeDecimal = feeRaw
      .toBigDecimal()
      .div(BigDecimal.fromString("10000"));

    return feeDecimal;
  }

  getBondPrice(priceInUSD: BigInt): BigDecimal {
    return toDecimal(priceInUSD, 18);
  }

  getCarbonCustodied(depositAmount: BigInt): BigDecimal {
    // From older implementation - this returns zero
    return BigDecimal.zero()
  }

  getTreasuredAmount(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(constants.KLIMA_BCT_PAIR))
    let lp_token_1 = toDecimal(pair.getReserves().value0, this.getToken().getDecimals())

    return lp_token_1
  }
}
