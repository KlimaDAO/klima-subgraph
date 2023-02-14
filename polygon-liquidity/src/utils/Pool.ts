import { Address, BigDecimal, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { Pool, PoolDailySnapshot, PoolHourlySnapshot } from '../../generated/schema'
import { ERC20 } from '../../generated/KLIMA_NBO/ERC20'
import {
  deltaBigDecimalArray,
  deltaBigIntArray,
  emptyBigDecimalArray,
  emptyBigIntArray,
  getBigDecimalArrayTotal,
  toDecimal,
  ZERO_BD,
  ZERO_BI,
} from '../../../lib-updated/utils/Decimals'
import { dayFromTimestamp, hourFromTimestamp } from '../../../lib-updated/utils/Dates'
import { KLIMA_NBO_PAIR, KLIMA_UBO_PAIR, KLIMA_PAIRED_LIQUIDITY, KLIMA_UBO_PAIR_BLOCK, KLIMA_NBO_PAIR_BLOCK } from '../../../lib-updated/utils/Constants'
import { TokenFactory } from '../../../lib-updated/tokens/TokenFactory'
import { NBO } from '../../../lib-updated/tokens/impl/NBO'
import { KLIMA } from '../../../lib-updated/tokens/impl/KLIMA'
import { UBO } from '../../../lib-updated/tokens/impl/UBO'

export function createPool(poolAddress: Address, dex: string, tokens: Address[], timestamp: BigInt, blockNumber: BigInt): Pool {
  let pool = new Pool(poolAddress)
  let poolContract = ERC20.bind(poolAddress)
  pool.dex = dex

  let nameCall = poolContract.try_name()
  if (nameCall.reverted) pool.name = ''
  else pool.name = nameCall.value

  let symbolCall = poolContract.try_symbol()
  if (symbolCall.reverted) pool.symbol = ''
  else pool.symbol = symbolCall.value

  if (tokens.length == 2) {
    pool.tokens = [tokens[0], tokens[1]]
  } else if (tokens.length == 3) {
    pool.tokens = [tokens[0], tokens[1], tokens[2]]
  } else if (tokens.length == 4) {
    pool.tokens = [tokens[0], tokens[1], tokens[2], tokens[3]]
  }
  pool.createdTimestamp = timestamp
  pool.createdBlockNumber = blockNumber

  pool.lpTokenSupply = ZERO_BI
  pool.totalLiquidityUSD = ZERO_BD
  pool.reserves = emptyBigIntArray(tokens.length)
  pool.reservesUSD = emptyBigDecimalArray(tokens.length)
  pool.cumulativeVolumeReserves = emptyBigIntArray(tokens.length)
  pool.cumulativeVolumeReservesUSD = emptyBigDecimalArray(tokens.length)
  pool.cumulativeVolumeUSD = ZERO_BD
  pool.cumulativeDepositCount = 0
  pool.cumulativeWithdrawCount = 0
  pool.cumulativeSwapCount = 0
  pool.lastSnapshotDayID = 0
  pool.lastSnapshotHourID = 0
  pool.lastUpdateTimestamp = timestamp
  pool.lastUpdateBlockNumber = blockNumber
  pool.save()
  return pool as Pool
}

export function loadPool(poolAddress: Address): Pool {
  return Pool.load(poolAddress) as Pool
}

export function loadOrCreatePool(poolAddress: Address, dex: string, tokens: Address[], timestamp: BigInt, blockNumber: BigInt): Pool {
  let pool = Pool.load(poolAddress)
  if (pool == null) pool = createPool(poolAddress, dex, tokens, timestamp, blockNumber)
  return pool as Pool
}

export function updatePoolVolumes(poolAddress: Address, fromToken: Address, amountIn: BigInt, toToken: Address, amountOut: BigInt): void {
  let pool = loadPool(poolAddress)
  let token = new TokenFactory().getTokenForAddress(fromToken)

  let fromTokenIndex = pool.tokens.indexOf(fromToken)
  let toTokenIndex = pool.tokens.indexOf(toToken)

  // Update fromToken amounts

  let tokenVolumes = pool.cumulativeVolumeReserves
  let tokenVolumesUSD = pool.cumulativeVolumeReservesUSD
  let tokenBalances = pool.reserves

  let volumeUSD = toDecimal(amountIn, token.getDecimals()).times(token.getUSDPrice())

  tokenVolumes[fromTokenIndex] = tokenVolumes[fromTokenIndex].plus(amountIn)
  tokenVolumesUSD[fromTokenIndex] = tokenVolumesUSD[fromTokenIndex].plus(volumeUSD)
  tokenBalances[fromTokenIndex] = tokenBalances[fromTokenIndex].plus(amountIn)

  tokenBalances[toTokenIndex] = tokenBalances[toTokenIndex].minus(amountOut)

  pool.cumulativeVolumeUSD = pool.cumulativeVolumeUSD.plus(volumeUSD)
  pool.cumulativeVolumeReserves = tokenVolumes
  pool.cumulativeVolumeReservesUSD = tokenVolumesUSD
  pool.reserves = tokenBalances

  pool.save()
}

export function updatePoolTokenBalances(poolAddress: Address, inputTokenAmounts: BigInt[]): void {
  let pool = loadPool(poolAddress)
  let balances = pool.reserves

  for (let i = 0; i < balances.length; i++) {
    balances[i] = balances[i].plus(inputTokenAmounts[i])
  }

  pool.reserves = balances
  pool.save()
}

export function updatePoolLiquidityTokenBalance(poolAddress: Address, deltaAmount: BigInt): void {
  let pool = loadPool(poolAddress)
  pool.lpTokenSupply = pool.lpTokenSupply.plus(deltaAmount)
  pool.save()
}

export function incrementPoolSwap(poolAddress: Address): void {
  let pool = loadPool(poolAddress)
  pool.cumulativeSwapCount += 1
  pool.save()
}

export function incrementPoolDeposit(poolAddress: Address): void {
  let pool = loadPool(poolAddress)
  pool.cumulativeDepositCount += 1
  pool.save()
}

export function incrementPoolWithdraw(poolAddress: Address): void {
  let pool = loadPool(poolAddress)
  pool.cumulativeWithdrawCount += 1
  pool.save()
}

export function checkForSnapshot(poolAddress: Address, timestamp: BigInt, blockNumber: BigInt): void {
  // We check for the prior period snapshot and then take one if needed
  let dayID = dayFromTimestamp(timestamp) - 1
  let hourID = hourFromTimestamp(timestamp) - 1

  let pool = loadPool(poolAddress)

  if (dayID > pool.lastSnapshotDayID) takePoolDailySnapshot(poolAddress, dayID, timestamp, blockNumber)
  if (hourID > pool.lastSnapshotHourID) takePoolHourlySnapshot(poolAddress, hourID, timestamp, blockNumber)
}

export function takePoolDailySnapshot(poolAddress: Address, dayID: i32, timestamp: BigInt, blockNumber: BigInt): void {
  let pool = loadPool(poolAddress)

  if (pool.lastSnapshotDayID == 0) {
    loadOrCreatePoolDailySnapshot(poolAddress, dayID, timestamp, blockNumber)
    pool.lastSnapshotDayID = dayID
    pool.save()
    return
  }

  let priorDay = pool.lastSnapshotDayID
  pool.lastSnapshotDayID = dayID
  pool.save()

  let priorSnapshot = loadOrCreatePoolDailySnapshot(poolAddress, priorDay, timestamp, blockNumber)
  let newSnapshot = loadOrCreatePoolDailySnapshot(poolAddress, pool.lastSnapshotDayID, timestamp, blockNumber)

  newSnapshot.deltalpTokenSupply = newSnapshot.lpTokenSupply.minus(priorSnapshot.lpTokenSupply)
  newSnapshot.deltaLiquidityUSD = newSnapshot.totalLiquidityUSD.minus(priorSnapshot.totalLiquidityUSD)
  newSnapshot.deltaVolumeReserves = deltaBigIntArray(newSnapshot.cumulativeVolumeReserves, priorSnapshot.cumulativeVolumeReserves)
  newSnapshot.deltaVolumeReservesUSD = deltaBigDecimalArray(newSnapshot.cumulativeVolumeReservesUSD, priorSnapshot.cumulativeVolumeReservesUSD)
  newSnapshot.deltaVolumeUSD = newSnapshot.cumulativeVolumeUSD.minus(priorSnapshot.cumulativeVolumeUSD)
  newSnapshot.deltaDepositCount = newSnapshot.cumulativeDepositCount - priorSnapshot.cumulativeDepositCount
  newSnapshot.deltaWithdrawCount = newSnapshot.cumulativeWithdrawCount - priorSnapshot.cumulativeWithdrawCount
  newSnapshot.deltaSwapCount = newSnapshot.cumulativeSwapCount - priorSnapshot.cumulativeSwapCount
  newSnapshot.lastUpdateTimestamp = timestamp
  newSnapshot.lastUpdateBlockNumber = blockNumber
  newSnapshot.save()
}

export function loadOrCreatePoolDailySnapshot(poolAddress: Address, dayID: i32, timestamp: BigInt, blockNumber: BigInt): PoolDailySnapshot {
  let snapshot = PoolDailySnapshot.load(poolAddress.concatI32(dayID))
  if (snapshot == null) {
    let pool = loadPool(poolAddress)
    snapshot = new PoolDailySnapshot(poolAddress.concatI32(dayID))
    snapshot.day = dayID
    snapshot.pool = poolAddress
    snapshot.lpTokenSupply = pool.lpTokenSupply
    snapshot.totalLiquidityUSD = pool.totalLiquidityUSD
    snapshot.cumulativeVolumeReserves = pool.cumulativeVolumeReserves
    snapshot.cumulativeVolumeReservesUSD = pool.cumulativeVolumeReservesUSD
    snapshot.cumulativeVolumeUSD = pool.cumulativeVolumeUSD
    snapshot.cumulativeDepositCount = pool.cumulativeDepositCount
    snapshot.cumulativeWithdrawCount = pool.cumulativeWithdrawCount
    snapshot.cumulativeSwapCount = pool.cumulativeSwapCount
    snapshot.deltalpTokenSupply = ZERO_BI
    snapshot.deltaLiquidityUSD = ZERO_BD
    snapshot.deltaVolumeReserves = emptyBigIntArray(pool.tokens.length)
    snapshot.deltaVolumeReservesUSD = emptyBigDecimalArray(pool.tokens.length)
    snapshot.deltaVolumeUSD = ZERO_BD
    snapshot.deltaDepositCount = 0
    snapshot.deltaWithdrawCount = 0
    snapshot.deltaSwapCount = 0
    snapshot.lastUpdateTimestamp = timestamp
    snapshot.lastUpdateBlockNumber = blockNumber
    snapshot.save()
  }
  return snapshot as PoolDailySnapshot
}

export function takePoolHourlySnapshot(poolAddress: Address, hourID: i32, timestamp: BigInt, blockNumber: BigInt): void {
  let pool = loadPool(poolAddress)

  let priorHourID = pool.lastSnapshotHourID
  pool.lastSnapshotHourID = hourID
  pool.save()

  let priorSnapshot = loadOrCreatePoolHourlySnapshot(poolAddress, priorHourID, timestamp, blockNumber)
  let newSnapshot = loadOrCreatePoolHourlySnapshot(poolAddress, pool.lastSnapshotHourID, timestamp, blockNumber)

  newSnapshot.deltalpTokenSupply = newSnapshot.lpTokenSupply.minus(priorSnapshot.lpTokenSupply)
  newSnapshot.deltaLiquidityUSD = newSnapshot.totalLiquidityUSD.minus(priorSnapshot.totalLiquidityUSD)
  newSnapshot.deltaVolumeReserves = deltaBigIntArray(newSnapshot.cumulativeVolumeReserves, priorSnapshot.cumulativeVolumeReserves)
  newSnapshot.deltaVolumeReservesUSD = deltaBigDecimalArray(newSnapshot.cumulativeVolumeReservesUSD, priorSnapshot.cumulativeVolumeReservesUSD)
  newSnapshot.deltaVolumeUSD = newSnapshot.cumulativeVolumeUSD.minus(priorSnapshot.cumulativeVolumeUSD)
  newSnapshot.deltaDepositCount = newSnapshot.cumulativeDepositCount - priorSnapshot.cumulativeDepositCount
  newSnapshot.deltaWithdrawCount = newSnapshot.cumulativeWithdrawCount - priorSnapshot.cumulativeWithdrawCount
  newSnapshot.deltaSwapCount = newSnapshot.cumulativeSwapCount - priorSnapshot.cumulativeSwapCount
  newSnapshot.lastUpdateTimestamp = timestamp
  newSnapshot.lastUpdateBlockNumber = blockNumber
  newSnapshot.save()
}

export function loadOrCreatePoolHourlySnapshot(poolAddress: Address, hourID: i32, timestamp: BigInt, blockNumber: BigInt): PoolHourlySnapshot {
  let snapshot = PoolHourlySnapshot.load(poolAddress.concatI32(hourID))
  if (snapshot == null) {
    let pool = loadPool(poolAddress)
    snapshot = new PoolHourlySnapshot(poolAddress.concatI32(hourID))
    snapshot.hour = hourID
    snapshot.pool = poolAddress
    snapshot.lpTokenSupply = pool.lpTokenSupply
    snapshot.totalLiquidityUSD = pool.totalLiquidityUSD
    snapshot.cumulativeVolumeReserves = pool.cumulativeVolumeReserves
    snapshot.cumulativeVolumeReservesUSD = pool.cumulativeVolumeReservesUSD
    snapshot.cumulativeVolumeUSD = pool.cumulativeVolumeUSD
    snapshot.cumulativeDepositCount = pool.cumulativeDepositCount
    snapshot.cumulativeWithdrawCount = pool.cumulativeWithdrawCount
    snapshot.cumulativeSwapCount = pool.cumulativeSwapCount
    snapshot.deltalpTokenSupply = ZERO_BI
    snapshot.deltaLiquidityUSD = ZERO_BD
    snapshot.deltaVolumeReserves = emptyBigIntArray(pool.tokens.length)
    snapshot.deltaVolumeReservesUSD = emptyBigDecimalArray(pool.tokens.length)
    snapshot.deltaVolumeUSD = ZERO_BD
    snapshot.deltaDepositCount = 0
    snapshot.deltaWithdrawCount = 0
    snapshot.deltaSwapCount = 0
    snapshot.lastUpdateTimestamp = timestamp
    snapshot.lastUpdateBlockNumber = blockNumber
    snapshot.save()
  }
  return snapshot as PoolHourlySnapshot
}

export function updateKlimaPrice(timestamp: BigInt, blockNumber: BigInt): void {
  let klima = new KLIMA()
  klima.updateUSDPrice(timestamp, blockNumber)

  // Update dependent prices

  if (blockNumber > KLIMA_UBO_PAIR_BLOCK) {
    let token = new UBO()
    token.updateUSDPrice(timestamp, blockNumber)
  }
  if (blockNumber > KLIMA_NBO_PAIR_BLOCK) {
    let token = new NBO()
    token.updateUSDPrice(timestamp, blockNumber)
  }
}

export function updatePoolTokenPrices(poolAddress: Address, timestamp: BigInt, blockNumber: BigInt): void {
  let pool = loadPool(poolAddress)

  let klima = new KLIMA()
  klima.updateUSDPrice(timestamp, blockNumber)

  if (poolAddress == KLIMA_UBO_PAIR) {
    // Klima is token1 and UBO is token0
    let token = new UBO()
    token.updateMarketPrice(timestamp, toDecimal(pool.reserves[0], token.getDecimals()).div(toDecimal(pool.reserves[1], 9)))
    token.updateUSDPrice(timestamp, blockNumber)
  } else if (poolAddress == KLIMA_NBO_PAIR) {
    // Klima is token0 and NBO is token1
    let token = new NBO()
    token.updateMarketPrice(timestamp, toDecimal(pool.reserves[1], token.getDecimals()).div(toDecimal(pool.reserves[0], 9)))
    token.updateUSDPrice(timestamp, blockNumber)
  }

  pool.reservesUSD = getCalculatedReserveUSDValues(pool.tokens, pool.reserves)
  pool.totalLiquidityUSD = getBigDecimalArrayTotal(pool.reservesUSD)
  pool.save()
}

export function getCalculatedReserveUSDValues(tokens: Bytes[], reserves: BigInt[]): BigDecimal[] {
  let results = emptyBigDecimalArray(tokens.length)
  for (let i = 0; i < tokens.length; i++) {
    let token = new TokenFactory().getTokenForAddress(Address.fromBytes(tokens[i]))
    results[i] = toDecimal(reserves[i], token.getDecimals()).times(token.getUSDPrice())
  }
  return results
}
