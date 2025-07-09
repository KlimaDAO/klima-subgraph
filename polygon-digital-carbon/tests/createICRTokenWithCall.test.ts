import {
  clearStore,
  test,
  log,
  afterAll,
  describe,
  createMockedFunction,
  newMockEvent,
  beforeEach,
  assert,
} from 'matchstick-as'
import { Address, BigInt, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { ICRProjectContract } from '../generated/ICRCarbonContractRegistry/ICRProjectContract'
import { ExPostCreated } from '../generated/templates/ICRProjectContract/ICRProjectContract'
import { handleExPostCreated } from '../src/TransferHandler'
import { createICRTokenWithCall, createICRTokenID, createICRProjectId } from '../src/utils/Token'
import { ProjectCreated } from '../generated/ICRCarbonContractRegistry/ICRCarbonContractRegistry'
import { handleNewICC } from '../src/templates/ICRCarbonContractRegistry'

test(
  'Should throw an error. Confirm test is working',
  () => {
    throw new Error()
  },
  true
)

const tokenAddress = Address.fromString('0xae63fbd056512fc4b1d15b58a98f9aaea44b18a9')

const tokenContract = ICRProjectContract.bind(tokenAddress)

const exPostTokenId = 6

const exAnteTokenId = 51

const estimatedAmount = 115221

export function createNewProjectCreatedEvent(): ProjectCreated {
  let mockEvent = newMockEvent()
  let newProjectCreatedEvent = new ProjectCreated(
    tokenAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  newProjectCreatedEvent.parameters = new Array()
  let projectId = new ethereum.EventParam(
    'unusable-ICR-project-id',
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))
  )
  let projectAddress = new ethereum.EventParam('projectAddress', ethereum.Value.fromAddress(tokenAddress))
  let projectName = new ethereum.EventParam('projectName', ethereum.Value.fromString('Descriptive Project Name'))
  newProjectCreatedEvent.parameters.push(projectId)
  newProjectCreatedEvent.parameters.push(projectAddress)
  newProjectCreatedEvent.parameters.push(projectName)

  return newProjectCreatedEvent
}

export function createNewExPostCreatedEvent(): ExPostCreated {
  let mockEvent = newMockEvent()

  let newExPostCreatedEvent = new ExPostCreated(
    tokenAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  newExPostCreatedEvent.parameters = new Array()
  let tokenId = new ethereum.EventParam('id', ethereum.Value.fromI32(exPostTokenId))
  let estAmount = new ethereum.EventParam('estAmount', ethereum.Value.fromI32(estimatedAmount))
  let verificationPeriodStart = new ethereum.EventParam('verificationPeriodStart', ethereum.Value.fromI32(1735689600))

  let verificationPeriodEnd = new ethereum.EventParam('verificationPeriodEnd', ethereum.Value.fromI32(1767139200))
  let serialization = new ethereum.EventParam('serialization', ethereum.Value.fromString('FCC-ISL-354-57-14-R-0-2025'))

  newExPostCreatedEvent.parameters.push(tokenId)
  newExPostCreatedEvent.parameters.push(estAmount)
  newExPostCreatedEvent.parameters.push(verificationPeriodStart)
  newExPostCreatedEvent.parameters.push(verificationPeriodEnd)
  newExPostCreatedEvent.parameters.push(serialization)

  return newExPostCreatedEvent
}

describe('Token Creation Tests', () => {
  beforeEach(() => {
    clearStore()
    // Mocking necessary contract methods. Need to mock for all potential tokenIds

    createMockedFunction(tokenAddress, 'isExPostToken', 'isExPostToken(uint256):(bool)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(exPostTokenId))])
      .returns([ethereum.Value.fromBoolean(true)])

    createMockedFunction(tokenAddress, 'exAnteToExPostTokenId', 'exAnteToExPostTokenId(uint256):(uint256)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(exAnteTokenId))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(exPostTokenId))])

    createMockedFunction(tokenAddress, 'projectName', 'projectName():(string)').returns([
      ethereum.Value.fromString('Skógálfar, Álfabrekka'),
    ])

    createMockedFunction(
      tokenAddress,
      'exPostVintageMapping',
      'exPostVintageMapping(uint256):(string,uint256,uint256,uint256,uint256)'
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(exPostTokenId))])
      .returns([
        ethereum.Value.fromString('FCC-ISL-354-57-14-R-0-2025'),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(398)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1798761600)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1830211200)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
      ])
  })

  afterAll(() => {
    clearStore()
  })

  test('Create ICR Token entities', () => {
    const isExPostToken = tokenContract.isExPostToken(BigInt.fromI32(exPostTokenId))
    const exAnteToExPostTokenId = tokenContract.exAnteToExPostTokenId(BigInt.fromI32(exAnteTokenId))
    const exPostVintageMapping = tokenContract.exPostVintageMapping(BigInt.fromI32(exPostTokenId))

    log.info('Is Ex Post Token: {}', [isExPostToken.toString()])
    log.info('Ex Ante to Ex Post Token ID: {}', [exAnteToExPostTokenId.toString()])
    log.info('Ex Post Serialization: {}', [exPostVintageMapping.value0.toString()])

    createICRTokenWithCall(tokenAddress, BigInt.fromI32(exPostTokenId))
    const id = createICRTokenID(tokenAddress, BigInt.fromI32(exPostTokenId))

    assert.fieldEquals('Token', id.toHexString(), 'name', 'ICR: ICR-57-2025')
    assert.fieldEquals('Token', id.toHexString(), 'symbol', 'ICR-57-2025')
    assert.fieldEquals('Token', id.toHexString(), 'decimals', '18')
    assert.fieldEquals('Token', id.toHexString(), 'id', id.toHexString())

    clearStore()
  })

  test('ProjectCreated event creates a new datasource', () => {
    let projectCreatedEvent = createNewProjectCreatedEvent()

    handleNewICC(projectCreatedEvent)

    assert.dataSourceExists('ICRProjectContract', tokenAddress.toHexString())

    clearStore()
  })

  test('ExPostCreated event successfully creates Token, creates accurate Project Id and updates Credit', () => {
    let projectCreatedEvent = createNewExPostCreatedEvent()

    handleExPostCreated(projectCreatedEvent)

    const id = createICRTokenID(tokenAddress, BigInt.fromI32(exPostTokenId))

    assert.fieldEquals('Token', id.toHexString(), 'name', 'ICR: ICR-57-2025')
    assert.fieldEquals('Token', id.toHexString(), 'symbol', 'ICR-57-2025')
    assert.fieldEquals('Token', id.toHexString(), 'decimals', '18')
    assert.fieldEquals('Token', id.toHexString(), 'id', id.toHexString())

    const creditId = Bytes.fromHexString(tokenAddress.toHexString()).concatI32(BigInt.fromI32(exPostTokenId).toI32())

    assert.fieldEquals('CarbonCredit', creditId.toHexString(), 'project', 'ICR-57')
    assert.fieldEquals('CarbonCredit', creditId.toHexString(), 'vintage', '2025')
    assert.fieldEquals('CarbonCredit', creditId.toHexString(), 'exPostTokenId', exPostTokenId.toString())
    assert.fieldEquals('CarbonCredit', creditId.toHexString(), 'bridgeProtocol', 'ICR')
    assert.fieldEquals('CarbonCredit', creditId.toHexString(), 'tokenAddress', tokenAddress.toHexString())
    assert.fieldEquals('CarbonCredit', creditId.toHexString(), 'id', creditId.toHexString())

    const projectId = createICRProjectId(projectCreatedEvent.params.serialization.toString())
    log.info('Project ID: {}', [projectId.toString()])
    assert.fieldEquals('CarbonProject', projectId, 'id', projectId)
    assert.fieldEquals('CarbonProject', projectId, 'name', 'Skógálfar, Álfabrekka')

    clearStore()
  })
})
