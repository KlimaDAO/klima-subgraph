import { clearStore, test, describe, newMockEvent, beforeEach, assert, log, afterEach } from 'matchstick-as'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Pair, Swap as SwapEvent } from '../generated/KLIMA_USDC/Pair'
import { handleSwap } from '../src/Pair'
import { KLIMA_CCO2_PAIR, NCT_USDC_PAIR } from '../../lib/utils/Constants'
import { create_SWAP_EVENT_MOCKS } from './swapsHelper.test'
// Helper function to create a Swap event

function newSwapEvent(
  address: Address,
  amount0In: BigInt,
  amount1In: BigInt,
  amount0Out: BigInt,
  amount1Out: BigInt,
  to: Address
): SwapEvent {
  let mockEvent = newMockEvent()
  let swapEvent = new SwapEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  swapEvent.address = address
  swapEvent.parameters = new Array()

  swapEvent.parameters.push(new ethereum.EventParam('sender', ethereum.Value.fromAddress(to)))
  swapEvent.parameters.push(new ethereum.EventParam('amount0In', ethereum.Value.fromUnsignedBigInt(amount0In)))
  swapEvent.parameters.push(new ethereum.EventParam('amount1In', ethereum.Value.fromUnsignedBigInt(amount1In)))
  swapEvent.parameters.push(new ethereum.EventParam('amount0Out', ethereum.Value.fromUnsignedBigInt(amount0Out)))
  swapEvent.parameters.push(new ethereum.EventParam('amount1Out', ethereum.Value.fromUnsignedBigInt(amount1Out)))
  swapEvent.parameters.push(new ethereum.EventParam('to', ethereum.Value.fromAddress(to)))

  return swapEvent
}

describe('handleSwap', () => {
  beforeEach(() => {
    create_SWAP_EVENT_MOCKS()
  })

  test('KLIMA_CCO2_PAIR:Initial swap updates pair price correctly. ', () => {
    let toAddress = Address.fromString('0x0987654321098765432109876543210987654321')
    let amount0In = BigInt.fromI32(1000)
    let amount1In = BigInt.fromI32(0)
    let amount0Out = BigInt.fromI32(0)
    let amount1Out = BigInt.fromI32(2000000000)

    let swapEvent = newSwapEvent(KLIMA_CCO2_PAIR, amount0In, amount1In, amount0Out, amount1Out, toAddress)

    handleSwap(swapEvent)

    // Assert that the pair price is updated correctly
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentprice', '0.01846581475982910603740163507456394')
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentpricepertonne', '18.46581475982910603740163507456394')
  })

  test('KLIMA_CCO2_PAIR:Subsequent swap updates pair price correctly', () => {
    let toAddress = Address.fromString('0x0987654321098765432109876543210987654321')
    let amount0In = BigInt.fromI32(1000)
    let amount1In = BigInt.fromI32(0)
    let amount0Out = BigInt.fromI32(0)
    let amount1Out = BigInt.fromI32(500000000)

    let swapEvent = newSwapEvent(KLIMA_CCO2_PAIR, amount0In, amount1In, amount0Out, amount1Out, toAddress)

    handleSwap(swapEvent)

    // Assert that the pair price is updated correctly
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentprice', '0.004616453689957276509350408768640985')
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentpricepertonne', '4.616453689957276509350408768640985')
  })

  // ────────────────────────────────────────────────────────────────────────────
  test('NCT_USDC_PAIR: Dust-quote swap returns spot price', () => {
    // 1 wei USDC  →  1 111 wei NCT  (the pathological trade)
    let toAddress = Address.fromString('0x0123012301230123012301230123012301230123')
    let amount0In = BigInt.fromI32(1) // 1 wei USDC
    let amount1In = BigInt.fromI32(0)
    let amount0Out = BigInt.fromI32(0)
    let amount1Out = BigInt.fromI32(1111) // 1 111 wei NCT

    let swapEvent = newSwapEvent(NCT_USDC_PAIR, amount0In, amount1In, amount0Out, amount1Out, toAddress)

    handleSwap(swapEvent)

    // should equal current spot price from getReserves
    assert.fieldEquals('Pair', NCT_USDC_PAIR.toHex(), 'currentprice', '0.4427864244831998538451559952378756')
  })

  afterEach(() => {
    clearStore()
  })
})
