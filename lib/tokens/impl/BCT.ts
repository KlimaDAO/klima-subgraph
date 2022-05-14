import { BigDecimal, BigInt, Address, log } from "@graphprotocol/graph-ts";
import { UniswapV2Pair } from '../../../bonds/generated/BCTBondV1/UniswapV2Pair'
import { ERC20 } from '../../../bonds/generated/BCTBondV1/ERC20'
import { IToken } from "../IToken";

import * as constants from '../../utils/Constants'
import { toDecimal } from "../../utils/Decimals"


export class BCT implements IToken {

  contractAddress: string = constants.BCT_ERC20_CONTRACT

  getERC20ContractAddress(): string {
    return this.contractAddress
  }

  getTokenName(): string {
    return constants.BCT_BOND_TOKEN
  }
  getDecimals(): number {
    return 18
  }

  getFormattedPrice(rawPrice: BigInt): BigDecimal {
    return toDecimal(rawPrice, this.getDecimals())
  }

  getMarketPrice(): BigDecimal {
    let BIG_DECIMAL_1E9 = BigDecimal.fromString('1e9')
    let pair = UniswapV2Pair.bind(Address.fromString(constants.KLIMA_BCT_PAIR))

    let reserves = pair.getReserves()
    let reserve0 = reserves.value0.toBigDecimal()
    let reserve1 = reserves.value1.toBigDecimal()

    let klimaRate = reserve0.div(reserve1).div(BIG_DECIMAL_1E9)
    log.debug("KLIMA BCT rate {}", [klimaRate.toString()])

    return klimaRate
  }

  getTotalSupply(): BigDecimal {
   let ercContract = ERC20.bind(Address.fromString(this.contractAddress))
   let totalSupply = toDecimal(ercContract.totalSupply(), this.getDecimals())

   return totalSupply
  }
}
