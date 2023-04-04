import { Deposited, Redeemed, Transfer } from '../generated/BaseCarbonTonne/BaseCarbonTonne'
import { loadOrCreateCarbonPool, savePoolDeposit, savePoolRedeem } from './utils/CarbonPool'
import { recordOffsetBalanceDeposit, recordOffsetBalanceRedeem } from './utils/CarbonPoolOffsetBalance'

export function handleDeposited(event: Deposited): void {
    let pool = loadOrCreateCarbonPool(event.address)

    savePoolDeposit(
        event.transaction.hash.concatI32(event.transactionLogIndex.toI32()),
        event.transaction.from,
        event.address,
        event.params.erc20Addr,
        event.params.amount,
        event.block.timestamp
    )

    pool.supply = pool.supply.plus(event.params.amount)
    pool.save()

    recordOffsetBalanceDeposit(event.address, event.params.erc20Addr, event.params.amount)
}
export function handleRedeemed(event: Redeemed): void {
    let pool = loadOrCreateCarbonPool(event.address)

    savePoolRedeem(
        event.transaction.hash.concatI32(event.transactionLogIndex.toI32()),
        event.params.account,
        event.address,
        event.params.erc20,
        event.params.amount,
        event.block.timestamp
    )

    pool.supply = pool.supply.minus(event.params.amount)
    pool.save()

    recordOffsetBalanceRedeem(event.address, event.params.erc20, event.params.amount)
}
export function handleTransfer(event: Transfer): void {}
