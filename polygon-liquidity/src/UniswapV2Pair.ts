import { Address, log } from '@graphprotocol/graph-ts'
import { ZERO_BI } from '../../lib-updated/utils/Decimals'
import { loadOrCreateToken } from '../../lib-updated/utils/Token'
import { Burn, Mint, Swap, UniswapV2Pair } from '../generated/KLIMA_USDC/UniswapV2Pair'
import {
  checkForSnapshot,
  incrementPoolDeposit,
  incrementPoolSwap,
  incrementPoolWithdraw,
  loadOrCreatePool,
  loadPool,
  updatePoolTokenBalances,
  updatePoolTokenPrices,
  updatePoolVolumes,
} from './utils/Pool'

export function handleMint(event: Mint): void {
  let poolContract = UniswapV2Pair.bind(event.address)
  let tokens = [poolContract.token0(), poolContract.token1()]
  for (let i = 0; i < tokens.length; i++) loadOrCreateToken(tokens[i])
  loadOrCreatePool(event.address, 'SUSHI_V2', tokens, event.block.timestamp, event.block.number)

  //   loadOrCreateAccount(event.transaction.from)

  //   recordAddLiquidityEvent(event)

  checkForSnapshot(event.address, event.block.timestamp, event.block.number)

  updatePoolTokenBalances(event.address, [event.params.amount0, event.params.amount1])

  incrementPoolDeposit(event.address)
}

export function handleSwap(event: Swap): void {
  //   loadOrCreateAccount(event.transaction.from)

  //   recordSwapEvent(event)

  let pool = loadPool(event.address)
  log.debug('Pool {} loaded for swap update', [pool.id.toHexString()])
  let token0 = Address.fromBytes(pool.tokens[0])
  let token1 = Address.fromBytes(pool.tokens[1])

  checkForSnapshot(event.address, event.block.timestamp, event.block.number)

  updatePoolVolumes(
    event.address,
    event.params.amount0In == ZERO_BI ? token1 : token0,
    event.params.amount0In == ZERO_BI ? event.params.amount1In : event.params.amount0In,
    event.params.amount0Out == ZERO_BI ? token1 : token0,
    event.params.amount0Out == ZERO_BI ? event.params.amount1Out : event.params.amount0Out
  )

  updatePoolTokenPrices(event.address, event.block.timestamp, event.block.number)

  incrementPoolSwap(event.address)
}

export function handleBurn(event: Burn): void {
  //   loadOrCreateAccount(event.transaction.from)

  //   recordSwapEvent(event)

  checkForSnapshot(event.address, event.block.timestamp, event.block.number)

  updatePoolTokenBalances(event.address, [ZERO_BI.minus(event.params.amount0), ZERO_BI.minus(event.params.amount1)])

  updatePoolTokenPrices(event.address, event.block.timestamp, event.block.number)

  incrementPoolWithdraw(event.address)
}
