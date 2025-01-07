import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  clearStore,
  test,
  afterAll,
  describe,
  createMockedFunction,
  newMockEvent,
  beforeEach,
  assert,
  log,
} from 'matchstick-as'
import { handleMossRetirement } from '../src/RetirementHandler'
import { CarbonOffset } from '../generated/MossCarbonOffset/CarbonChain'
import { loadOrCreateCarbonCredit } from '../src/utils/CarbonCredit'
import { MCO2_ERC20_CONTRACT, METRICS_INIT_TIMESTAMP } from '../src/utils/Constants'
import { CarbonMetric } from '../generated/schema'
import { dayTimestamp } from '../../lib/utils/Dates'

function createCarbonOffsetEvent(
  carbonTon: BigInt,
  transactionInfo: string,
  onBehalfOf: string,
  sender: Address,
  offsetHash: Bytes,
  transactionIndex: BigInt,
  batchIndex: BigInt,
  blockTimestamp: BigInt
): CarbonOffset {
  let mockEvent = newMockEvent()

  mockEvent.block.timestamp = blockTimestamp

  let carbonOffsetEvent = new CarbonOffset(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )

  carbonOffsetEvent.parameters = new Array()

  carbonOffsetEvent.parameters.push(new ethereum.EventParam('carbonTon', ethereum.Value.fromUnsignedBigInt(carbonTon)))
  carbonOffsetEvent.parameters.push(
    new ethereum.EventParam('transactionInfo', ethereum.Value.fromString(transactionInfo))
  )
  carbonOffsetEvent.parameters.push(new ethereum.EventParam('onBehalfOf', ethereum.Value.fromString(onBehalfOf)))
  carbonOffsetEvent.parameters.push(new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender)))
  carbonOffsetEvent.parameters.push(new ethereum.EventParam('offsetHash', ethereum.Value.fromFixedBytes(offsetHash)))
  carbonOffsetEvent.parameters.push(
    new ethereum.EventParam('transactionIndex', ethereum.Value.fromUnsignedBigInt(transactionIndex))
  )
  carbonOffsetEvent.parameters.push(
    new ethereum.EventParam('batchIndex', ethereum.Value.fromUnsignedBigInt(batchIndex))
  )
  return carbonOffsetEvent
}

describe('Test handleMossRetirement', () => {
  beforeEach(() => {
    clearStore()

    createMockedFunction(Address.fromString(MCO2_ERC20_CONTRACT), 'totalSupply', 'totalSupply():(uint256)').returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
    ])
  })

  test('Test handleMossRetirement', () => {
    let carbonTon = BigInt.fromString('93657000000000000000')
    let transactionInfo = '66b3796ca6b85b4370a75016'
    let onBehalfOf = 'SOUTH SYSTEM'
    let sender = Address.fromString('0xC3A2C64a92984E7d22934460CE269bd522a22213')
    let offsetHash = Bytes.fromHexString('DFFD37F4A4335509D7C2E2DC91A53235FC2BFE6E63A7C1652CDEE6EF0A37CDBA')
    let transactionIndex = BigInt.fromI32(53072)
    let batchIndex = BigInt.fromI32(36)
    let timestamp = BigInt.fromI32(1727836800)

    let event = createCarbonOffsetEvent(
      carbonTon,
      transactionInfo,
      onBehalfOf,
      sender,
      offsetHash,
      transactionIndex,
      batchIndex,
      timestamp
    )

    handleMossRetirement(event)

    let credit = loadOrCreateCarbonCredit(Address.fromString(MCO2_ERC20_CONTRACT), 'MOSS', null)
    assert.assertNotNull(credit)
    assert.bigIntEquals(credit.retired, carbonTon)

    let carbonMetrics = CarbonMetric.load(dayTimestamp(timestamp))

    assert.assertNotNull(carbonMetrics)

    if (carbonMetrics != null) {
      assert.bigIntEquals(BigInt.fromString(carbonMetrics.mco2Retired.toString()), carbonTon)
    }
  })
})
