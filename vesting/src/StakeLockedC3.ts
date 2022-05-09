import { StakeLocked } from "../generated/C3WsKlimaVesting/C3WsKlimaVesting"
import { loadOrCreateVesting, loadOrCreateAggregateVestingInfo } from './utils/Vest'
import { dayFromTimestamp } from '../../lib/utils/Dates'
import * as constants from '../../lib/utils/Constants'
import { BigInt, Bytes } from "@graphprotocol/graph-ts"



export function handleStakeLocked(event: StakeLocked): void {
    const vesting = loadOrCreateVesting(event.transaction)

    vesting.token = constants.C3_WSKLIMA_TOKEN
    vesting.contractAddress = Bytes.fromHexString(constants.C3_WSKLIMA_CONTRACT)
    vesting.stakerAddress = event.params.source_address
    vesting.startedAt = event.block.timestamp
    vesting.maturityDate = event.block.timestamp.plus(event.params.secs)
    vesting.lockedInSeconds = event.params.secs
    vesting.lockedAmount = event.params.amount

    vesting.save()

    const maturityDateString = dayFromTimestamp(vesting.maturityDate)
    const id = maturityDateString + vesting.token
    const aggregateVestingInfo = loadOrCreateAggregateVestingInfo(id)

    aggregateVestingInfo.token = vesting.token
    aggregateVestingInfo.maturityDate = maturityDateString
    aggregateVestingInfo.totalUnlocks = aggregateVestingInfo.totalUnlocks.plus(BigInt.fromString("1"))
    aggregateVestingInfo.totalAmount = aggregateVestingInfo.totalAmount.plus(vesting.lockedAmount)
    
    aggregateVestingInfo.save()
}