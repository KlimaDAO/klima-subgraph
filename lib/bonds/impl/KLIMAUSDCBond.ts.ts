import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { getDaoIncome } from "../../../bonds/src/utils/DaoIncome";
import { IBondable } from "../IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { KLIMA } from "../../tokens/impl/KLIMA";
import { USDC } from "../../tokens/impl/USDC";

export class KLIMAUSDCBond implements IBondable {
  
  private contractAddress: Address;
  private usdcToken: IToken

  constructor(constractAddress: Address) {
    this.contractAddress = constractAddress;
    this.usdcToken = new USDC()
  }

  getToken(): IToken {
    return this.usdcToken
  }

  getBondName(): string {
    return constants.KLIMAUSDC_LPBOND_TOKEN;
  }

  getDaoIncomeForBondPayout(payout: BigDecimal): BigDecimal {
    return getDaoIncome(this.contractAddress, payout)
  }

  getBondPrice(priceInUSD: BigInt): BigDecimal {
    return toDecimal(priceInUSD, 6);
  }

  getBondTokenValueFormatted(rawPrice: BigInt): BigDecimal {
    return toDecimal(rawPrice, 18)
  }

  getCarbonCustodied(depositAmount: BigInt): BigDecimal {
    return toDecimal(depositAmount, this.getToken().getDecimals())
  }

  getTreasuredAmount(): BigDecimal {
    //This Bond does not bring any carbon offset into treasury
    return BigDecimal.zero()
  }
}
