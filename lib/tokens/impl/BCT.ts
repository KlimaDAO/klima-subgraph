import { BigDecimal, BigInt, Address, log } from "@graphprotocol/graph-ts";
import { UniswapV2Pair } from '../../../bonds/generated/BCTBondV1/UniswapV2Pair'
import { ERC20 } from '../../../bonds/generated/BCTBondV1/ERC20'
import { IToken } from "../IToken";

import * as constants from '../../utils/Constants'
import { toDecimal, BIG_DECIMAL_1E9 } from "../../utils/Decimals"
import { KLIMA } from "./KLIMA";


export class BCT implements IToken {

  private contractAddress: string = constants.BCT_ERC20_CONTRACT
  private klimaToken: KLIMA = new KLIMA()

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

    log.debug("Get market price for BCT start", [])
    let pair = UniswapV2Pair.bind(Address.fromString(constants.KLIMA_BCT_PAIR))
    let reserveCall = pair.try_getReserves()
      if (reserveCall.reverted 
          || !reserveCall.value 
          || !reserveCall.value.value0 
          || !reserveCall.value.value1
          || !reserveCall.value.value2
          || reserveCall.value.value1.equals(BigInt.zero()) 
          || reserveCall.value.value2.equals(BigInt.zero())) {
          return BigDecimal.zero()
      }
    let reserves = reserveCall.value
    let reserve0 = reserves.value0.toBigDecimal()
    let reserve1 = reserves.value1.toBigDecimal()

    let klimaRate = reserve0.div(reserve1).div(BIG_DECIMAL_1E9)
    log.debug("KLIMA BCT rate {}", [klimaRate.toString()])

    return klimaRate
  }

  getUSDPrice(): BigDecimal {
    const klimaUsdPrice = this.klimaToken.getUSDPrice()
    const bctMarketPrice = this.getMarketPrice()

    if (bctMarketPrice.equals(BigDecimal.zero())) {
      return BigDecimal.zero()
    }

    return klimaUsdPrice.div(bctMarketPrice)
  }

  getTotalSupply(): BigDecimal {
   let ercContract = ERC20.bind(Address.fromString(this.contractAddress))
   let totalSupply = toDecimal(ercContract.totalSupply(), this.getDecimals())

   return totalSupply
  }
}
