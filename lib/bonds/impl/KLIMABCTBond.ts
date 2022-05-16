import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { UniswapV2Pair } from "../../../bonds/generated/BCTBondV1/UniswapV2Pair";
import { getDaoIncome } from "../../../bonds/src/utils/DaoIncome";
import { IBondable } from "../../bonds/IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { BCT } from "../../tokens/impl/BCT";
import { KLIMA } from "../../tokens/impl/KLIMA";

export class KLIMABCTBond implements IBondable {
  
  private contractAddress: Address;

  private klimaToken: IToken
  private bctToken: IToken

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

  getBondPrice(): BigDecimal {

    let bond = BondV1.bind(this.contractAddress)
    const bondPriceInUsd = bond.bondPriceInUSD()

    return toDecimal(bondPriceInUsd, this.getToken().getDecimals())
  }

  getBondDiscount(): BigDecimal {

    const bondPrice = this.getBondPrice()
    const marketPrice = this.getToken().getMarketPrice()

    // (bondPrice-marketPrice)/bondPrice
    const discount = (marketPrice.minus(bondPrice)).div(bondPrice)
    return discount;
  }

  getDaoIncomeForBondPayout(payout: BigDecimal): BigDecimal {
    return getDaoIncome(this.contractAddress, payout)
  }

  parseBondPrice(priceInUSD: BigInt): BigDecimal {
    return toDecimal(priceInUSD, 18);
  }

  parseBondTokenValueFormatted(rawPrice: BigInt): BigDecimal {
    return toDecimal(rawPrice, 18)
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
