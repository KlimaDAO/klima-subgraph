import { BigInt , log} from '@graphprotocol/graph-ts';
import { Swap } from '../generated/BCTPrice/UniswapV2Pair'
import { TokenFactory } from '../../lib/tokens/TokenFactory'
import { dayFromTimestamp, hourFromTimestamp } from '../../lib/utils/Dates'

import { loadOrCreateDailyPrice } from './utils/DailyPrice'
import { loadOrCreateHourlyPrice } from './utils/HourlyPrice'
import { IToken } from '../../lib/tokens/IToken';
import { LiquidityPoolFactory } from '../../lib/liquidity_pools/LiquidityPoolFactory';

export function handleSwap(event: Swap): void {
    log.debug("Handling swap for address: {}", [event.address.toHexString()])
    
    const lp = new LiquidityPoolFactory().getLPForAddress(event.address)
    const timestamp = event.block.timestamp

    const affectedTokens = lp.getAffectedTokensFromSwap()
    for (let i = 0; i < affectedTokens.length; i++) {
        log.debug("Found affected token: {}", [affectedTokens[i].getTokenName()])
        updatePricesForToken(affectedTokens[i], timestamp)
      }
}

function updatePricesForToken(token: IToken, timestamp: BigInt) :void {

    const dayTimestamp = dayFromTimestamp(timestamp)
    const dailyId = dayTimestamp + token.getTokenName()
    let dailyPrice = loadOrCreateDailyPrice(dailyId)
    dailyPrice.token = token.getTokenName()
    dailyPrice.marketPrice = token.getMarketPrice()
    dailyPrice.usdPrice = token.getUSDPrice()
    dailyPrice.timestamp = BigInt.fromString(dayTimestamp)
    dailyPrice.save()


    const hourTimestamp = hourFromTimestamp(timestamp)
    const hourlyId = hourTimestamp + token.getTokenName()
    let hourlyPrice = loadOrCreateHourlyPrice(hourlyId)
    hourlyPrice.token = token.getTokenName()
    hourlyPrice.marketPrice = token.getMarketPrice()
    hourlyPrice.usdPrice = token.getUSDPrice()
    hourlyPrice.timestamp = BigInt.fromString(hourTimestamp)
    hourlyPrice.save()

}