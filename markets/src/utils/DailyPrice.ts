import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { DailyPrice } from "../../generated/schema"

export function loadOrCreateDailyPrice(id: string): DailyPrice {

    let dailyPrice = DailyPrice.load(id)
    if (dailyPrice == null) {
        dailyPrice = new DailyPrice(id)
        dailyPrice.token = ""
        dailyPrice.timestamp = BigInt.zero()
        dailyPrice.usdPrice = BigDecimal.zero()
        dailyPrice.marketPrice = BigDecimal.zero()
        dailyPrice.save()
    }

    return dailyPrice as DailyPrice
}
