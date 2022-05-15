import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { ERC20 } from "../../../bonds/generated/BCTBondV1/ERC20";
import { getDaoIncome } from "../../../bonds/src/utils/DaoIncome";
import { IBondable } from "../IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { MCO2 } from "../../tokens/impl/MCO2";

export class MCO2Bond implements IBondable {
  private contractAddress: Address;
  private mco2Token: IToken

  constructor(constractAddress: Address) {
    this.contractAddress = constractAddress;
    this.mco2Token = new MCO2()
  }

  getToken(): IToken {
    return this.mco2Token
  }

  getBondName(): string {
    return constants.MCO2_BOND_TOKEN;
  }

  getDaoIncomeForBondPayout(payout: BigDecimal): BigDecimal {
    return getDaoIncome(this.contractAddress, payout)
  }

  getBondPrice(priceInUSD: BigInt): BigDecimal {
    return toDecimal(priceInUSD, 18);
  }

  getBondTokenValueFormatted(rawPrice: BigInt): BigDecimal {
    return this.getToken().getFormattedPrice(rawPrice)
  }

  getCarbonCustodied(depositAmount: BigInt): BigDecimal {
    return toDecimal(depositAmount, this.getToken().getDecimals())
  }

  getTreasuredAmount(): BigDecimal {
    let treasuryAddress = Address.fromString(constants.TREASURY_ADDRESS);

    let ercContract = ERC20.bind(
      Address.fromString(this.getToken().getERC20ContractAddress())
    );
    let treasuryBalance = toDecimal(
      ercContract.balanceOf(treasuryAddress),
      this.getToken().getDecimals()
    );

    return treasuryBalance;
  }
}
