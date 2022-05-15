import { BigDecimal, BigInt, Address, log } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { ERC20 } from "../../../bonds/generated/BCTBondV1/ERC20";
import { getDaoIncome } from "../../../bonds/src/utils/DaoIncome";
import { IBondable } from "../../bonds/IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { BCT } from "../../tokens/impl/BCT";

export class BCTBond implements IBondable {
  
  private contractAddress: Address;
  private bctToken: IToken

  constructor(constractAddress: Address) {
    this.contractAddress = constractAddress;
    this.bctToken = new BCT()
  }

  getToken(): IToken {
    return this.bctToken
  }

  getBondName(): string {
    return constants.BCT_BOND_TOKEN;
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
