import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { UniswapV2Pair } from "../../../bonds/generated/BCTBondV1/UniswapV2Pair";
import { IBondable } from "../../bonds/IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { BCT } from "../../tokens/impl/BCT";
import { KLIMA } from "../../tokens/impl/KLIMA";

export class KLIMABCTBond implements IBondable {
  
  contractAddress: Address;

  klimaToken: IToken
  bctToken: IToken

  constructor(constractAddress: Address) {
    this.contractAddress = constractAddress;
    this.klimaToken = new KLIMA()
    this.bctToken = new BCT()
  }

  getToken(): IToken {
    return this.bctToken
  }

  getBondName(): string {
    return constants.KLIMABCT_LPBOND_TOKEN;
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
    let pair = UniswapV2Pair.bind(Address.fromString(constants.KLIMA_BCT_PAIR))

    let total_lp = pair.totalSupply()
    let lp_token_1 = toDecimal(pair.getReserves().value0, this.klimaToken.getDecimals())
    let lp_token_2 = toDecimal(pair.getReserves().value1, this.getToken().getDecimals())
    let kLast = lp_token_1.times(lp_token_2).truncate(0).digits

    let part1 = toDecimal(depositAmount, 18).div(toDecimal(total_lp, 18))
    let two = BigInt.fromI32(2)

    let sqrt = kLast.sqrt();
    let part2 = toDecimal(two.times(sqrt), 0)
    let result = part1.times(part2)
    return result
  }

  getTreasuredAmount(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(constants.KLIMA_BCT_PAIR))
    let lp_token_2 = toDecimal(pair.getReserves().value1, this.getToken().getDecimals())

    return lp_token_2
  }
}
