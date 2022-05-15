import { BigDecimal, BigInt, Address, log } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { UniswapV2Pair } from "../../../bonds/generated/BCTBondV1/UniswapV2Pair";
import { getDaoIncome } from "../../../bonds/src/utils/DaoIncome";
import { IBondable } from "../IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { BCT } from "../../tokens/impl/BCT";
import { USDC } from "../../tokens/impl/USDC";

export class BCTUSDCBond implements IBondable {
  
  contractAddress: Address;

  private bctToken: IToken
  private usdcToken: IToken

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

  getDaoIncomeForBondPayout(payout: BigDecimal): BigDecimal {
    return getDaoIncome(this.contractAddress, payout)
  }

  getBondPrice(priceInUSD: BigInt): BigDecimal {
    return toDecimal(priceInUSD, 18);
  }

  getBondTokenValueFormatted(rawPrice: BigInt): BigDecimal {
    return toDecimal(rawPrice, 18)
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
