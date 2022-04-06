import { BondCreated, BondRedeemed, ControlVariableAdjustment } from '../generated/BCTBondV1/BondV1'
import { Deposit } from '../generated/schema'
import { loadOrCreateTransaction } from "./utils/Transactions"
import { toDecimal } from "../../lib/utils/Decimals"
import { KLIMABCT_LPBOND_TOKEN, KLIMA_BCT_PAIR } from '../../lib/utils/Constants'
import { loadOrCreateRedemption } from './utils/Redemption'
import { getDiscountedPairCO2, getKLIMABCTRate } from './utils/Price'
import { loadOrCreateKlimate, updateKlimateBalance } from './utils/Klimate'


export function handleDeposit(event: BondCreated): void {
    let klimate = loadOrCreateKlimate(event.transaction.from)
    let transaction = loadOrCreateTransaction(event.transaction, event.block)

    let deposit = new Deposit(transaction.id)
    deposit.token = KLIMABCT_LPBOND_TOKEN;
    deposit.transaction = transaction.id
    deposit.klimate = klimate.id
    deposit.payout = toDecimal(event.params.payout, 9)
    deposit.bondPrice = toDecimal(event.params.priceInUSD, 18)
    deposit.marketPrice = getKLIMABCTRate()
    deposit.discount = (deposit.marketPrice.minus(deposit.bondPrice)).div(deposit.marketPrice)
    deposit.tokenValue = toDecimal(event.params.deposit, 18)
    deposit.carbonCustodied = getDiscountedPairCO2(event.params.deposit, KLIMA_BCT_PAIR)
    deposit.timestamp = transaction.timestamp;
    deposit.save()

    klimate.totalCarbonCustodied = klimate.totalCarbonCustodied.plus(deposit.carbonCustodied)
    klimate.totalKlimaBonded = klimate.totalKlimaBonded.plus(deposit.payout)
    klimate.save()

    updateKlimateBalance(klimate, transaction)
}

export function handleRedeem(event: BondRedeemed): void {
    let klimate = loadOrCreateKlimate(event.params.recipient)
    let transaction = loadOrCreateTransaction(event.transaction, event.block)

    let redemption = loadOrCreateRedemption(event.transaction, transaction.timestamp)
    redemption.transaction = transaction.id
    redemption.klimate = klimate.id
    redemption.token = KLIMABCT_LPBOND_TOKEN
    redemption.payout = toDecimal(event.params.payout, 9)
    redemption.payoutRemaining = toDecimal(event.params.remaining, 9)
    redemption.timestamp = transaction.timestamp;
    redemption.save()

    updateKlimateBalance(klimate, transaction)
}
