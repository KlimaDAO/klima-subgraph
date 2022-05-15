import { BigInt } from '@graphprotocol/graph-ts';
import { Transfer } from '../generated/BCTPrice/ERC20'
import { TokenFactory } from '../../lib/tokens/TokenFactory'
import { dayFromTimestamp, hourFromTimestamp } from '../../lib/utils/Dates'

import { loadOrCreateDailyPrice } from './utils/DailyPrice'
import { loadOrCreateHourlyPrice } from './utils/HourlyPrice'

export function handleTransfer(event: Transfer): void {

    const token = new TokenFactory().getTokenForAddress(event.address)

    const dayTimestamp = dayFromTimestamp(event.block.timestamp)
    const dailyId = dayTimestamp + token.getTokenName()

    let dailyPrice = loadOrCreateDailyPrice(dailyId)
    dailyPrice.token = token.getTokenName()
    dailyPrice.marketPrice = token.getMarketPrice()
    dailyPrice.usdPrice = token.getUSDPrice()
    dailyPrice.timestamp = BigInt.fromString(dayTimestamp)
    dailyPrice.save()


    const hourTimestamp = hourFromTimestamp(event.block.timestamp)
    const hourlyId = hourTimestamp + token.getTokenName()
    let hourlyPrice = loadOrCreateHourlyPrice(hourlyId)
    hourlyPrice.token = token.getTokenName()
    hourlyPrice.marketPrice = token.getMarketPrice()
    hourlyPrice.usdPrice = token.getUSDPrice()
    hourlyPrice.timestamp = BigInt.fromString(hourTimestamp)
    hourlyPrice.save()
}