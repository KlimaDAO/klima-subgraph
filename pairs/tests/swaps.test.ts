import {
  clearStore,
  test,
  describe,
  newMockEvent,
  beforeEach,
  assert,
  log,
  afterEach,
  createMockedFunction,
} from 'matchstick-as'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Swap as SwapEvent } from '../generated/KLIMA_USDC/Pair'
import { PairTwapState } from '../generated/schema'
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
  to: Address,
  blockTimestamp: BigInt = BigInt.fromI32(0) // default to 0
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

  // Set block timestamp to 0 to avoid TWAP logic and use reserves to set price
  swapEvent.block.timestamp = blockTimestamp

  return swapEvent
}

describe('handleSwap', () => {
  beforeEach(() => {
    create_SWAP_EVENT_MOCKS()

    // Set up realistic TWAP mocks for KLIMA_CCO2_PAIR
    // Simulate price0 cumulative that increased by 1e18 over 600 seconds (10 minutes)
    // This represents a price change from 1.0 to 2.0 over 10 minutes
    createMockedFunction(KLIMA_CCO2_PAIR, 'price0CumulativeLast', 'price0CumulativeLast():(uint256)').returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString('2000000000000000000000000')), // Current cumulative
    ])
    createMockedFunction(KLIMA_CCO2_PAIR, 'price1CumulativeLast', 'price1CumulativeLast():(uint256)').returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1500000000000000000000000')), // Different cumulative
    ])

    // Set up realistic TWAP mocks for NCT_USDC_PAIR
    // Simulate a more stable price with smaller changes
    createMockedFunction(NCT_USDC_PAIR, 'price0CumulativeLast', 'price0CumulativeLast():(uint256)').returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1100000000000000000000000')), // Small increase
    ])
    createMockedFunction(NCT_USDC_PAIR, 'price1CumulativeLast', 'price1CumulativeLast():(uint256)').returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString('900000000000000000000000')), // Small decrease
    ])
  })

  test('KLIMA_CCO2_PAIR:Initial swap updates pair price correctly. ', () => {
    let toAddress = Address.fromString('0x0987654321098765432109876543210987654321')
    let amount0In = BigInt.fromI32(1000)
    let amount1In = BigInt.fromI32(0)
    let amount0Out = BigInt.fromI32(0)
    let amount1Out = BigInt.fromI32(2000000000)

    let swapEvent = newSwapEvent(
      KLIMA_CCO2_PAIR,
      amount0In,
      amount1In,
      amount0Out,
      amount1Out,
      toAddress,
      BigInt.fromI32(0)
    )

    handleSwap(swapEvent)

    // Assert that the pair price is updated correctly (TWAP logic)
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentprice', '1002.004008016032064128256513026052')
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentpricepertonne', '1002004.008016032064128256513026052')
  })

  test('KLIMA_CCO2_PAIR:Subsequent swap updates pair price correctly', () => {
    let toAddress = Address.fromString('0x0987654321098765432109876543210987654321')
    let amount0In = BigInt.fromI32(1000)
    let amount1In = BigInt.fromI32(0)
    let amount0Out = BigInt.fromI32(0)
    let amount1Out = BigInt.fromI32(500000000)

    let swapEvent = newSwapEvent(
      KLIMA_CCO2_PAIR,
      amount0In,
      amount1In,
      amount0Out,
      amount1Out,
      toAddress,
      BigInt.fromI32(0)
    )

    handleSwap(swapEvent)

    // Assert that the pair price is updated correctly (TWAP logic)
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentprice', '1002.004008016032064128256513026052')
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentpricepertonne', '1002004.008016032064128256513026052')
  })

  // ────────────────────────────────────────────────────────────────────────────
  test('NCT_USDC_PAIR: Dust-quote swap returns spot price', () => {
    let toAddress = Address.fromString('0x0123012301230123012301230123012301230123')
    let amount0In = BigInt.fromI32(1) // 1 wei USDC
    let amount1In = BigInt.fromI32(0)
    let amount0Out = BigInt.fromI32(0)
    let amount1Out = BigInt.fromI32(1111) // 1 111 wei NCT

    let swapEvent = newSwapEvent(
      NCT_USDC_PAIR,
      amount0In,
      amount1In,
      amount0Out,
      amount1Out,
      toAddress,
      BigInt.fromI32(0)
    )

    handleSwap(swapEvent)

    // should equal current spot price from getReserves
    assert.fieldEquals('Pair', NCT_USDC_PAIR.toHex(), 'currentprice', '0.4427864244831998538451559952378756')
  })

  test('KLIMA_CCO2_PAIR: TWAP calculation with proper time window', () => {
    // Create initial TWAP state with timestamp 600 seconds ago (10 minutes)
    let twapState = new PairTwapState(KLIMA_CCO2_PAIR.toHex())
    twapState.price0Cumul = BigInt.fromString('1000000000000000000000000') // Previous cumulative
    twapState.price1Cumul = BigInt.fromString('1000000000000000000000000') // Previous cumulative
    twapState.timestamp = BigInt.fromI32(0) // 600 seconds ago
    twapState.save()

    let toAddress = Address.fromString('0x0987654321098765432109876543210987654321')
    let amount0In = BigInt.fromI32(1000)
    let amount1In = BigInt.fromI32(0)
    let amount0Out = BigInt.fromI32(0)
    let amount1Out = BigInt.fromI32(2000000000)

    // Use timestamp 600 (current time) to trigger TWAP calculation
    let swapEvent = newSwapEvent(
      KLIMA_CCO2_PAIR,
      amount0In,
      amount1In,
      amount0Out,
      amount1Out,
      toAddress,
      BigInt.fromI32(600)
    )

    handleSwap(swapEvent)

    // The TWAP calculation should be: (2000000000000000000000000 - 1000000000000000000000000) / 600 / 2^112
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentprice', '1002.004008016032064128256513026052')
    assert.fieldEquals('Pair', KLIMA_CCO2_PAIR.toHex(), 'currentpricepertonne', '1002004.008016032064128256513026052')
  })

  afterEach(() => {
    clearStore()
  })
})
