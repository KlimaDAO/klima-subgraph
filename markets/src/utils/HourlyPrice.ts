import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { HourlyPrice } from "../../generated/schema"

export function loadOrCreateHourlyPrice(id: string): HourlyPrice {

    let dailyPrice = HourlyPrice.load(id)
    if (dailyPrice == null) {
        dailyPrice = new HourlyPrice(id)
        dailyPrice.token = ""
        dailyPrice.timestamp = BigInt.zero()
        dailyPrice.usdPrice = BigDecimal.zero()
        dailyPrice.marketPrice = BigDecimal.zero()
        dailyPrice.save()
    }

    return dailyPrice as HourlyPrice
}
