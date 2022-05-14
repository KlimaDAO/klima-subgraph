import { BigDecimal, BigInt, Address, log } from "@graphprotocol/graph-ts";
import { UniswapV2Pair } from '../../../bonds/generated/BCTBondV1/UniswapV2Pair'
import { ERC20 } from '../../../bonds/generated/BCTBondV1/ERC20'
import { IToken } from "../IToken";

import * as constants from '../../utils/Constants'
import { toDecimal } from "../../utils/Decimals"


export class MCO2 implements IToken {

  contractAddress: string = constants.MCO2_ERC20_CONTRACT

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
    let pair = UniswapV2Pair.bind(Address.fromString(constants.KLIMA_MCO2_PAIR))

    let reserveCall = pair.try_getReserves()
    if (reserveCall.reverted) {
      return this.getMarketPriceViaUsdc()
    }

    let reserve0 = reserveCall.value.value0.toBigDecimal()
    let reserve1 = reserveCall.value.value1.toBigDecimal()

    let klimaRate = reserve0.div(reserve1).div(BIG_DECIMAL_1E9)
    log.debug("KLIMA MCO2 rate {}", [klimaRate.toString()])

    return klimaRate
  }

  private getMarketPriceViaUsdc(): BigDecimal {
    let BIG_DECIMAL_1E12 = BigDecimal.fromString('1e12')

    let mco2UsdcPair = UniswapV2Pair.bind(Address.fromString(constants.MCO2_USDC_PAIR))
    let mco2UsdcReserves = mco2UsdcPair.getReserves()

    let mco2UsdcReserve1 = mco2UsdcReserves.value0.toBigDecimal()
    let mco2UsdcReserve2 = mco2UsdcReserves.value1.toBigDecimal()
    let mco2UsdcRate = (mco2UsdcReserve1.times(BIG_DECIMAL_1E12)).div(mco2UsdcReserve2)

    let klimaUsdcRate = this.getKLIMAUSDRate()

    return klimaUsdcRate.div(mco2UsdcRate);
  }

  private getKLIMAUSDRate(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(constants.KLIMA_BCT_PAIR))
    let BIG_DECIMAL_1E9 = BigDecimal.fromString('1e9')

    let reserves = pair.getReserves()
    let reserve0 = reserves.value0.toBigDecimal()
    let reserve1 = reserves.value1.toBigDecimal()

    let bctRate = this.getBCTUSDRate()

    let klimaRate = reserve0.div(reserve1).div(BIG_DECIMAL_1E9).times(bctRate)
    log.debug("KLIMA rate {}", [klimaRate.toString()])

    return klimaRate
  }

  private getBCTUSDRate(): BigDecimal {

    let pair = UniswapV2Pair.bind(Address.fromString(constants.BCT_USDC_PAIR))
    let BIG_DECIMAL_1E12 = BigDecimal.fromString('1e12')

    let reserves = pair.getReserves()
    let reserve0 = reserves.value0.toBigDecimal()
    let reserve1 = reserves.value1.toBigDecimal()

    let bctRate = reserve0.div(reserve1).times(BIG_DECIMAL_1E12)
    log.debug("BCT rate {}", [bctRate.toString()])

    return bctRate
}


  getTotalSupply(): BigDecimal {
   let ercContract = ERC20.bind(Address.fromString(this.contractAddress))
   let totalSupply = toDecimal(ercContract.totalSupply(), this.getDecimals())

   return totalSupply
  }
}
