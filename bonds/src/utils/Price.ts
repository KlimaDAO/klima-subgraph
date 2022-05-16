import {
    KLIMA_BCT_PAIR, BCT_USDC_PAIR,
    KLIMA_MCO2_PAIR, LIQUIDITY_TRESHOLD
} from '../../../lib/utils/Constants'
import { Address, BigDecimal, BigInt, log, ethereum } from '@graphprotocol/graph-ts'
import { UniswapV2Pair, UniswapV2Pair__getReservesResult } from '../../generated/BCTBondV1/UniswapV2Pair'
import { toDecimal, BIG_DECIMAL_1E9, BIG_DECIMAL_1E12 } from '../../../lib/utils/Decimals'
import { IToken } from '../../../lib/tokens/IToken'

export function isLiquidReserves(
  reserveCall: ethereum.CallResult<UniswapV2Pair__getReservesResult>,
  reserveToken1: IToken,
  reserveToken2: IToken
): boolean {

    if (reserveCall.reverted) {
        return false
    }
    const reserveToken1UsdPrice = reserveToken1.getUSDPrice()
    const reserve1 = toDecimal(reserveCall.value.value0, reserveToken1.getDecimals())

    const reserveToken2UsdPrice = reserveToken2.getUSDPrice()
    const reserve2 = toDecimal(reserveCall.value.value1, reserveToken2.getDecimals())

    const pair = reserveToken1.getTokenName().concat("-").concat(reserveToken2.getTokenName())
    const totalLiquidityInUsd = (reserveToken1UsdPrice.times(reserve1)).plus((reserveToken2UsdPrice).times(reserve2))

    log.debug("[Liquidity check] Liquidity for {} is {}$", [pair, totalLiquidityInUsd.toString()])
    return totalLiquidityInUsd.gt(BigDecimal.fromString(LIQUIDITY_TRESHOLD))
}

export function getBCTUSDRate(): BigDecimal {

    let pair = UniswapV2Pair.bind(Address.fromString(BCT_USDC_PAIR))
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

    let bctRate = reserve0.div(reserve1).times(BIG_DECIMAL_1E12)
    log.debug("BCT rate {}", [bctRate.toString()])

    return bctRate
}

export function getKLIMAUSDRate(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(KLIMA_BCT_PAIR))

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

    let bctRate = getBCTUSDRate()

    let klimaRate = reserve0.div(reserve1).div(BIG_DECIMAL_1E9).times(bctRate)
    log.debug("KLIMA rate {}", [klimaRate.toString()])

    return klimaRate
}

export function getKLIMABCTRate(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(KLIMA_BCT_PAIR))

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

export function getKLIMAMCO2Rate(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(KLIMA_MCO2_PAIR))

    let reserves = pair.getReserves()
    let reserve0 = reserves.value0.toBigDecimal()
    let reserve1 = reserves.value1.toBigDecimal()

    let klimaRate = reserve0.div(reserve1).times(BIG_DECIMAL_1E9)
    log.debug("KLIMA MCO2 rate {}", [klimaRate.toString()])

    return klimaRate
}

//(slp_treasury/slp_supply)*(2*sqrt(lp_dai * lp_ohm))
export function getDiscountedPairCO2(lp_amount: BigInt, pair_address: string): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(pair_address))

    let total_lp = pair.totalSupply()
    let lp_token_1 = toDecimal(pair.getReserves().value0, 9)
    let lp_token_2 = toDecimal(pair.getReserves().value1, 18)
    let kLast = lp_token_1.times(lp_token_2).truncate(0).digits

    let part1 = toDecimal(lp_amount, 18).div(toDecimal(total_lp, 18))
    let two = BigInt.fromI32(2)

    let sqrt = kLast.sqrt();
    let part2 = toDecimal(two.times(sqrt), 0)
    let result = part1.times(part2)
    return result
}
