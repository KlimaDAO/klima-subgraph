import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { ERC20 } from "../../../bonds/generated/BCTBondV1/ERC20";
import { IBondable } from "../IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { MCO2 } from "../../tokens/impl/MCO2";

export class MCO2Bond implements IBondable {
  contractAddress: Address;
  mco2Token: IToken

  constructor(constractAddress: Address) {
    this.contractAddress = constractAddress;
    this.mco2Token = new MCO2()
  }

  getToken(): IToken {
    return new MCO2();
  }

  getBondName(): string {
    return constants.MCO2_BOND_TOKEN;
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
