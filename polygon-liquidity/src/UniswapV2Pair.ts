import { Swap } from '../generated/KLIMA_USDC/UniswapV2Pair'
import { updateKlimaPrice } from './utils/Pool'

export function handleSwap(event: Swap): void {
  updateKlimaPrice(event.block.timestamp, event.block.number)
}
