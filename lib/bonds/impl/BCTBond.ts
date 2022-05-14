import { BigDecimal, BigInt, Address, log } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { ERC20 } from "../../../bonds/generated/BCTBondV1/ERC20";
import { IBondable } from "../../bonds/IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { BCT } from "../../tokens/impl/BCT";

export class BCTBond implements IBondable {
  
  contractAddress: Address;

  constructor(constractAddress: Address) {
    this.contractAddress = constractAddress;
  }

  getToken(): IToken {
    return new BCT();
  }

  getBondName(): string {
    return constants.BCT_BOND_TOKEN;
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
