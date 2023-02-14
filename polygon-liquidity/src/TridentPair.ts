import { Address, BigDecimal } from '@graphprotocol/graph-ts'
import { NBO } from '../../lib-updated/tokens/impl/NBO'
import { ZERO_BI } from '../../lib-updated/utils/Decimals'
import { loadOrCreateToken } from '../../lib-updated/utils/Token'
import { Burn, Mint, Swap, TridentPair } from '../generated/KLIMA_NBO/TridentPair'
import {
  checkForSnapshot,
  createPool,
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
  let poolContract = TridentPair.bind(event.address)
  let tokens = poolContract.getAssets()
  for (let i = 0; i < tokens.length; i++) loadOrCreateToken(tokens[i])
  loadOrCreatePool(event.address, 'SUSHI_TRIDENT', tokens, event.block.timestamp, event.block.number)

  //   loadOrCreateAccount(event.transaction.from)

  //   recordAddLiquidityEvent(event)

  checkForSnapshot(event.address, event.block.timestamp, event.block.number)

  updatePoolTokenBalances(event.address, [event.params.amount0, event.params.amount1])

  incrementPoolDeposit(event.address)
}

export function handleSwap(event: Swap): void {
  //   loadOrCreateAccount(event.transaction.from)

  //   recordSwapEvent(event)

  checkForSnapshot(event.address, event.block.timestamp, event.block.number)

  updatePoolVolumes(event.address, event.params.tokenIn, event.params.amountIn, event.params.tokenOut, event.params.amountOut)

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
