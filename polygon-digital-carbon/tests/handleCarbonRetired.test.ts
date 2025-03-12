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
import { Address, BigInt, Bytes, ethereum, store } from '@graphprotocol/graph-ts'
import { burnedCO2Token } from '../generated/CCO2/CCO2'
import { CarbonRetired } from '../generated/KlimaInfinity/KlimaInfinity'
import { handleCarbonRetired } from '../src/KlimaAggregator'
import { KLIMA_CARBON_RETIREMENTS_CONTRACT } from '../../lib/utils/Constants'
import { handleCCO2Retired } from '../src/TransferHandler'
import { incrementAccountRetirements, loadOrCreateAccount } from '../src/utils/Account'
import { convertToAmountTonnes } from '../utils/helpers'
import { Account, DailyKlimaRetireSnapshot, Retire } from '../generated/schema'
import { dayTimestamp } from '../../lib/utils/Dates'
import { Retired } from '../generated/templates/ToucanCarbonOffsets/ToucanCarbonOffsets'
import { saveToucanRetirement } from '../src/RetirementHandler'
import { loadOrCreateCarbonCredit } from '../src/utils/CarbonCredit'

const cco2 = Address.fromString('0x82b37070e43c1ba0ea9e2283285b674ef7f1d4e2')

const senderAddress = Address.fromString('0x1234567890123456789012345678901234567890')

const globalBeneficiaryAddress = Address.fromString('0x0987654321098765432109876543210987654321')

const retiredAmount = BigInt.fromString('1000000000000000000')

const tco2 = Address.fromString('0xb139C4cC9D20A3618E9a2268D73Eff18C496B991')

// testing variables
const randomToken = Address.fromString('0x1234567890123456789012345678901234567890')
const randomToken2 = Address.fromString('0x0987654321098765432109876543210987654321')
const randomToken3 = Address.fromString('0x3456789012345678901234567890123456789012')
const randomTxnHash = Bytes.fromHexString('0xa1b2c3d4e5f6078c9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7089a0b1c2d3')

function newRetiredEvent(amount: BigInt): Retired {
  let mockEvent = newMockEvent()

  let newRetiredEvent = new Retired(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )

  newRetiredEvent.address = tco2
  newRetiredEvent.transaction.from = senderAddress
  newRetiredEvent.transaction.hash = randomTxnHash

  newRetiredEvent.parameters = new Array()

  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(senderAddress))
  newRetiredEvent.parameters.push(senderParam)

  let tokenIdParam = new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)))
  newRetiredEvent.parameters.push(tokenIdParam)

  return newRetiredEvent
}

function newBurnedCO2TokenEvent(amount: BigInt): burnedCO2Token {
  let mockEvent = newMockEvent()

  let newBurnedCO2TokenEvent = new burnedCO2Token(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  newBurnedCO2TokenEvent.parameters = new Array()

  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  newBurnedCO2TokenEvent.parameters.push(amountParam)

  return newBurnedCO2TokenEvent
}

function createNewCarbonRetiredEvent(amount: BigInt): CarbonRetired {
  let mockEvent = newMockEvent()

  let newCarbonRetiredEvent = new CarbonRetired(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )

  newCarbonRetiredEvent.parameters = new Array()

  let carbonBridgeParam = new ethereum.EventParam('carbonBridge', ethereum.Value.fromI32(1))
  let retiringAddressParam = new ethereum.EventParam(
    'retiringAddress',
    ethereum.Value.fromAddress(Address.fromString('0x1234567890123456789012345678901234567890'))
  )
  let retiringEntityStringParam = new ethereum.EventParam('retiringEntityString', ethereum.Value.fromString(''))
  let beneficiaryAddressParam = new ethereum.EventParam(
    'beneficiaryAddress',
    ethereum.Value.fromAddress(globalBeneficiaryAddress)
  )
  let beneficiaryStringParam = new ethereum.EventParam('beneficiaryString', ethereum.Value.fromString('Beneficiary'))
  let retirementMessageParam = new ethereum.EventParam(
    'retirementMessage',
    ethereum.Value.fromString('Retirement Message')
  )
  let carbonPoolParam = new ethereum.EventParam('carbonPool', ethereum.Value.fromAddress(cco2))
  let carbonTokenParam = new ethereum.EventParam('carbonToken', ethereum.Value.fromAddress(cco2))
  let retiredAmountParam = new ethereum.EventParam('retiredAmount', ethereum.Value.fromUnsignedBigInt(amount))

  newCarbonRetiredEvent.parameters.push(carbonBridgeParam)
  newCarbonRetiredEvent.parameters.push(retiringAddressParam)
  newCarbonRetiredEvent.parameters.push(retiringEntityStringParam)
  newCarbonRetiredEvent.parameters.push(beneficiaryAddressParam)
  newCarbonRetiredEvent.parameters.push(beneficiaryStringParam)
  newCarbonRetiredEvent.parameters.push(retirementMessageParam)
  newCarbonRetiredEvent.parameters.push(carbonPoolParam)
  newCarbonRetiredEvent.parameters.push(carbonTokenParam)
  newCarbonRetiredEvent.parameters.push(retiredAmountParam)

  return newCarbonRetiredEvent
}

describe('Carbon Retired Tests', () => {
  beforeEach(() => {
    clearStore()

    createMockedFunction(cco2, 'projectName', 'projectName():(string)').returns([
      ethereum.Value.fromString('CCO2 Project'),
    ])

    createMockedFunction(cco2, 'totalSupply', 'totalSupply():(uint256)').returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
    ])

    // create necessary credits
    let credit = loadOrCreateCarbonCredit(tco2, 'TOUCAN', null)
    credit.tokenAddress = tco2
    credit.save()
  })

  afterAll(() => {
    clearStore()
  })

  test('handleCarbonRetired: CCO2', () => {
    createMockedFunction(
      KLIMA_CARBON_RETIREMENTS_CONTRACT,
      'retirements',
      'retirements(address):(uint256,uint256,uint256)'
    )
      .withArgs([ethereum.Value.fromAddress(senderAddress)])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1234567890)),
      ])

    createMockedFunction(
      KLIMA_CARBON_RETIREMENTS_CONTRACT,
      'retirements',
      'retirements(address):(uint256,uint256,uint256)'
    )
      .withArgs([ethereum.Value.fromAddress(globalBeneficiaryAddress)])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
      ])
    let sender = loadOrCreateAccount(senderAddress)
    let timestamp = BigInt.fromI32(0)

    let burnedCO2TokenEvent = newBurnedCO2TokenEvent(retiredAmount)
    burnedCO2TokenEvent.transaction.from = senderAddress
    burnedCO2TokenEvent.address = cco2

    handleCCO2Retired(burnedCO2TokenEvent)

    let carbonRetiredEvent = createNewCarbonRetiredEvent(retiredAmount)
    carbonRetiredEvent.block.timestamp = timestamp
    carbonRetiredEvent.transaction.from = senderAddress

    handleCarbonRetired(carbonRetiredEvent)

    const retiringAddress = carbonRetiredEvent.parameters[1].value.toAddress()
    const retiringEntityString = carbonRetiredEvent.parameters[2].value.toString()
    const beneficiaryAddress = carbonRetiredEvent.parameters[3].value.toAddress()
    const beneficiaryString = carbonRetiredEvent.parameters[4].value.toString()
    const retirementMessage = carbonRetiredEvent.parameters[5].value.toString()
    const carbonPool = carbonRetiredEvent.parameters[6].value.toAddress()
    const carbonToken = carbonRetiredEvent.parameters[7].value.toAddress()
    const retiredAmountTotal = carbonRetiredEvent.parameters[8].value.toBigInt()

    sender = loadOrCreateAccount(senderAddress)
    const beneficiary = loadOrCreateAccount(beneficiaryAddress)
    const retireId = sender.id.concatI32(sender.totalRetirements - 1).toHexString()
    const klimaRetireId = beneficiaryAddress.concatI32(beneficiary.totalRetirements).toHexString()
    let snapshotId = dayTimestamp(timestamp).toString() + carbonToken.toHexString()
    const snapshot = DailyKlimaRetireSnapshot.load(snapshotId)

    assert.assertNotNull(snapshot)
    assert.fieldEquals('KlimaRetire', klimaRetireId, 'retire', retireId)
    assert.fieldEquals('KlimaRetire', klimaRetireId, 'index', '0')
    assert.fieldEquals('KlimaRetire', klimaRetireId, 'feeAmount', '10000000000000000')
    assert.fieldEquals('KlimaRetire', klimaRetireId, 'specific', 'false')

    assert.fieldEquals('Retire', retireId, 'credit', carbonToken.toHexString())
    assert.fieldEquals('Retire', retireId, 'pool', carbonPool.toHexString())
    assert.fieldEquals('Retire', retireId, 'source', 'KLIMA')
    assert.fieldEquals('Retire', retireId, 'amount', retiredAmount.toString())
    assert.fieldEquals('Retire', retireId, 'amountTonnes', convertToAmountTonnes(carbonToken, retiredAmount).toString())
    assert.fieldEquals('Retire', retireId, 'beneficiaryAddress', beneficiaryAddress.toHexString())
    assert.fieldEquals('Retire', retireId, 'beneficiaryName', beneficiaryString)
    assert.fieldEquals('Retire', retireId, 'retirementMessage', retirementMessage)
    assert.fieldEquals('Retire', retireId, 'retiringAddress', retiringAddress.toHexString())
    assert.fieldEquals('Retire', retireId, 'retiringName', retiringEntityString)

    clearStore()
  })

  test('handleCarbonRetired: multiple retirements in one txn. no third party retirements', () => {
    // testing multiple retirements in one txn. Set retirement index to 6 to simulate four retirements in one txn
    createMockedFunction(
      KLIMA_CARBON_RETIREMENTS_CONTRACT,
      'retirements',
      'retirements(address):(uint256,uint256,uint256)'
    )
      .withArgs([ethereum.Value.fromAddress(globalBeneficiaryAddress)])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(6)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
      ])

    let sender = loadOrCreateAccount(senderAddress)
    sender.totalRetirements = 2
    sender.previousRetirementIndex = 2
    sender.save()

    // all retirements process underlying retirement than handle CarbonRetired event for that retirement
    let retiredEvent = newRetiredEvent(retiredAmount)
    retiredEvent.transaction.from = senderAddress
    saveToucanRetirement(retiredEvent)

    let newCarbonRetiredEvent = createNewCarbonRetiredEvent(retiredAmount)
    newCarbonRetiredEvent.transaction.from = senderAddress
    handleCarbonRetired(newCarbonRetiredEvent)

    let retiredEvent2 = newRetiredEvent(retiredAmount)
    retiredEvent2.transaction.from = senderAddress
    saveToucanRetirement(retiredEvent2)

    let newCarbonRetiredEvent2 = createNewCarbonRetiredEvent(retiredAmount)
    newCarbonRetiredEvent2.transaction.from = senderAddress
    handleCarbonRetired(newCarbonRetiredEvent2)

    let retiredEvent3 = newRetiredEvent(retiredAmount)
    retiredEvent3.transaction.from = senderAddress
    saveToucanRetirement(retiredEvent3)

    let newCarbonRetiredEvent3 = createNewCarbonRetiredEvent(retiredAmount)
    newCarbonRetiredEvent3.transaction.from = senderAddress
    handleCarbonRetired(newCarbonRetiredEvent3)

    let retiredEvent4 = newRetiredEvent(retiredAmount)
    retiredEvent4.transaction.from = senderAddress
    saveToucanRetirement(retiredEvent4)

    let newCarbonRetiredEvent4 = createNewCarbonRetiredEvent(retiredAmount)
    newCarbonRetiredEvent4.transaction.from = senderAddress
    handleCarbonRetired(newCarbonRetiredEvent4)

    sender = loadOrCreateAccount(senderAddress)

    for (let i = 2; i < 6; i++) {
      let retireId = sender.id.concatI32(i).toHexString()
      assert.fieldEquals('Retire', retireId, 'source', 'KLIMA')
    }

    for (let i = 2; i < 6; i++) {
      let klimaRetireId = globalBeneficiaryAddress.concatI32(i).toHexString()
      assert.fieldEquals('KlimaRetire', klimaRetireId, 'index', i.toString())
    }
  })

  test('handleCarbonRetired: multiple retirements in one txn w/ third party retirements', () => {
    // testing multiple retirements in one txn. Set retirement index to 6 to simulate four retirements in one txn
    createMockedFunction(
      KLIMA_CARBON_RETIREMENTS_CONTRACT,
      'retirements',
      'retirements(address):(uint256,uint256,uint256)'
    )
      .withArgs([ethereum.Value.fromAddress(globalBeneficiaryAddress)])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(8)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
      ])

    let sender = loadOrCreateAccount(senderAddress)
    // simulate 4 previous retirements, two direct retirements (not through RA) and then the four more RA retirements (below)
    sender.totalRetirements = 6
    sender.previousRetirementIndex = 4
    sender.save()

    // all retirements process underlying retirement than handle CarbonRetired event for that retirement
    let retiredEvent = newRetiredEvent(retiredAmount)
    retiredEvent.transaction.from = senderAddress
    saveToucanRetirement(retiredEvent)

    let newCarbonRetiredEvent = createNewCarbonRetiredEvent(retiredAmount)
    newCarbonRetiredEvent.transaction.from = senderAddress
    handleCarbonRetired(newCarbonRetiredEvent)

    let retiredEvent2 = newRetiredEvent(retiredAmount)
    retiredEvent2.transaction.from = senderAddress
    saveToucanRetirement(retiredEvent2)

    let newCarbonRetiredEvent2 = createNewCarbonRetiredEvent(retiredAmount)
    newCarbonRetiredEvent2.transaction.from = senderAddress
    handleCarbonRetired(newCarbonRetiredEvent2)

    let retiredEvent3 = newRetiredEvent(retiredAmount)
    retiredEvent3.transaction.from = senderAddress
    saveToucanRetirement(retiredEvent3)

    let newCarbonRetiredEvent3 = createNewCarbonRetiredEvent(retiredAmount)
    newCarbonRetiredEvent3.transaction.from = senderAddress
    handleCarbonRetired(newCarbonRetiredEvent3)

    let retiredEvent4 = newRetiredEvent(retiredAmount)
    retiredEvent4.transaction.from = senderAddress
    saveToucanRetirement(retiredEvent4)

    let newCarbonRetiredEvent4 = createNewCarbonRetiredEvent(retiredAmount)
    newCarbonRetiredEvent4.transaction.from = senderAddress
    handleCarbonRetired(newCarbonRetiredEvent4)

    sender = loadOrCreateAccount(senderAddress)

    for (let i = 6; i < 10; i++) {
      let retireId = sender.id.concatI32(i).toHexString()
      assert.fieldEquals('Retire', retireId, 'source', 'KLIMA')
    }

    for (let i = 4; i < 8; i++) {
      let klimaRetireId = globalBeneficiaryAddress.concatI32(i).toHexString()
      assert.fieldEquals('KlimaRetire', klimaRetireId, 'index', i.toString())
    }
  })
})
