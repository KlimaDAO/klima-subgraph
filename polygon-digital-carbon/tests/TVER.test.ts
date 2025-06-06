import {
  clearStore,
  test,
  afterAll,
  describe,
  createMockedFunction,
  newMockEvent,
  beforeEach,
  assert,
} from 'matchstick-as'
import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { Issued } from '../generated/CarbonmarkCreditTokenFactory/CarbonmarkCreditTokenFactory'
import { handleNewCarbonmarkCredit } from '../src/templates/CarbonmarkCreditTokenFactory'
import { PROJECT_INFO } from '../../lib/projects/Projects'
import { Transfer } from '../generated/BCT/ERC20'
import { ZERO_ADDRESS } from '../../lib/utils/Constants'
import { Retired } from '../generated/CarbonmarkCreditTokenFactory/CarbonmarkCreditToken'
import { handleCarbonmarkCreditRetirement, handleCarbonmarkCreditTransfer } from '../src/templates/CarbonmarkCreditToken'
import { ProjectInfo } from '../../lib/types'


const ISSUED_TOKEN_ADDRESS = '0xae63fbd056512fc4b1d15b58a98f9aaea44b18a9'
const ISSUED_TOKEN_BENEFICIARY = '0x3Da300661Eb0f04a4044A4fB01d79E66C8c81ED9'
const ISSUED_TOKEN_PROJECT_ID = 'TVER-0'
const ISSUED_TOKEN_VINTAGE = '2025'
const ISSUED_TOKEN_CREDIT_ID = `${ISSUED_TOKEN_PROJECT_ID}-${ISSUED_TOKEN_VINTAGE}`
const ISSUED_TOKEN_SYMBOL = ISSUED_TOKEN_CREDIT_ID
const ISSUED_TOKEN_NAME = `TVER: ${ISSUED_TOKEN_CREDIT_ID}`
const ISSUED_TOKEN_DECIMALS = 18
const ISSUED_TOKEN_AMOUNT = 115221

const ISSUED_TOKEN_TRANSFER_TO = '0xBFEE1A7e6cB1DC7164910914c8971388D2521142'
const ISSUED_TOKEN_TRANSFER_VALUE = 55435

const RETIREMENT_AMOUNT = 5786
const RETIREMENT_BENEFICIARY_ADDRESS = "0x585bf96a8b7b0b3fbB59BCd656e64BeFe0B34490"
const RETIREMENT_BENEFICIARY_NAME = "Legolas"
const RETIREMENT_BENEFICIARY_MESSAGE = "For Mirkwood!"
const RETIREMENT_CONSUMPTION_CODE = "fr"

const issuedTokenAddress=Address.fromString(ISSUED_TOKEN_ADDRESS)
const issuedTokenOwner=Address.fromString(ISSUED_TOKEN_BENEFICIARY)
const issuedTokenTransferTo=Address.fromString(ISSUED_TOKEN_TRANSFER_TO)
const retirementBeneficiaryAddress=Address.fromString(RETIREMENT_BENEFICIARY_ADDRESS)

export function newIssuedEvent(): Issued {
  let mockEvent = newMockEvent()

  let issuedEvent = new Issued(
    issuedTokenAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )

  let creditId = new ethereum.EventParam('creditId', ethereum.Value.fromString(ISSUED_TOKEN_CREDIT_ID))
  let amount = new ethereum.EventParam('amount', ethereum.Value.fromI32(ISSUED_TOKEN_AMOUNT))
  let to = new ethereum.EventParam('to', ethereum.Value.fromAddress(issuedTokenOwner))
  let creditTokenAddress = new ethereum.EventParam('creditTokenAddress', ethereum.Value.fromAddress(issuedTokenAddress))
  issuedEvent.parameters = new Array()
  issuedEvent.parameters.push(creditId)
  issuedEvent.parameters.push(amount)
  issuedEvent.parameters.push(to)
  issuedEvent.parameters.push(creditTokenAddress)

  return issuedEvent
}

export function createNewTransferEvent(from: Address, to: Address, value: i32): Transfer {
  let mockEvent = newMockEvent()

  let transferEvent = new Transfer(
    issuedTokenAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )

  let eventFrom = new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  let eventTo = new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  let eventValue = new ethereum.EventParam('value', ethereum.Value.fromI32(value))
  transferEvent.parameters = new Array()
  transferEvent.parameters.push(eventFrom)
  transferEvent.parameters.push(eventTo)
  transferEvent.parameters.push(eventValue)

  return transferEvent
}

export function createNewTokenRetiredEvent(): Retired {
  let mockEvent = newMockEvent()

  let retiredEvent = new Retired(
    issuedTokenAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  let amount = new ethereum.EventParam('amount', ethereum.Value.fromI32(RETIREMENT_AMOUNT))
  let address = new ethereum.EventParam('address', ethereum.Value.fromAddress(retirementBeneficiaryAddress))
  let beneficiaryName = new ethereum.EventParam('beneficiaryName', ethereum.Value.fromString(RETIREMENT_BENEFICIARY_NAME))
  let message = new ethereum.EventParam('message', ethereum.Value.fromString(RETIREMENT_BENEFICIARY_MESSAGE))
  let creditId = new ethereum.EventParam('creditId', ethereum.Value.fromBytes(Bytes.fromHexString(ISSUED_TOKEN_ADDRESS)))
  let account = new ethereum.EventParam('account', ethereum.Value.fromAddress(issuedTokenOwner))
  let consumptionCountryCode = new ethereum.EventParam('consumptionCountryCode', ethereum.Value.fromString(RETIREMENT_CONSUMPTION_CODE))

  retiredEvent.parameters = new Array()
  retiredEvent.parameters.push(amount)
  retiredEvent.parameters.push(address)
  retiredEvent.parameters.push(beneficiaryName)
  retiredEvent.parameters.push(message)
  retiredEvent.parameters.push(creditId)
  retiredEvent.parameters.push(account)
  retiredEvent.parameters.push(consumptionCountryCode)

  return retiredEvent
}
/**
 * Sets up an environment with a token created and transfered to the project owner
 */
export function setup(): void {
  const createTokenEvent = newIssuedEvent()
  handleNewCarbonmarkCredit(createTokenEvent)

  // Initial transfer to beneficiary
  const createInitialTransferEvent = createNewTransferEvent(ZERO_ADDRESS, issuedTokenOwner, ISSUED_TOKEN_AMOUNT)
  handleCarbonmarkCreditTransfer(createInitialTransferEvent)

}

describe('TVER tests', () => {
  beforeEach(() => {
    clearStore()

    createMockedFunction(issuedTokenAddress, 'name', 'name():(string)')
      .returns([ethereum.Value.fromString(ISSUED_TOKEN_NAME)])

      createMockedFunction(issuedTokenAddress, 'symbol', 'symbol():(string)')
      .returns([ethereum.Value.fromString(ISSUED_TOKEN_SYMBOL)])

      createMockedFunction(issuedTokenAddress, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromI32(ISSUED_TOKEN_DECIMALS)])
    })

  afterAll(() => {
    clearStore()
  })

  test('Issuance of a Carbonmark TVER Token entity', () => {
    // Issuance event
    const event = newIssuedEvent()
    let id = issuedTokenAddress.toHexString()

    let projectInfo: ProjectInfo | null = null
    for (let i = 0; i < PROJECT_INFO.length; i++) {
      if (PROJECT_INFO[i].projectId === ISSUED_TOKEN_PROJECT_ID) {
        projectInfo = PROJECT_INFO[i]
        break
      }
    }

    if (!projectInfo) {
      throw new Error('Project info not found')
    }

    handleNewCarbonmarkCredit(event)
    assert.fieldEquals('CarbonCredit', id, 'tokenAddress', ISSUED_TOKEN_ADDRESS)
    assert.fieldEquals('CarbonCredit', id, 'bridgeProtocol', 'TVER')
    assert.fieldEquals('CarbonCredit', id, 'project', ISSUED_TOKEN_PROJECT_ID)
    assert.fieldEquals('CarbonCredit', id, 'vintage', ISSUED_TOKEN_VINTAGE)
    assert.fieldEquals('CarbonCredit', id, 'currentSupply', '0')
    assert.fieldEquals('CarbonCredit', id, 'crossChainSupply', '0')
    assert.fieldEquals('CarbonCredit', id, 'bridged', '0')
    assert.fieldEquals('CarbonCredit', id, 'retired', '0')
    assert.fieldEquals('CarbonCredit', id, 'provenanceCount', '0')
    assert.fieldEquals('CarbonCredit', id, 'lastBatchId', '0')
    assert.fieldEquals('CarbonCredit', id, 'isExAnte', 'false')

    assert.fieldEquals('CarbonProject', ISSUED_TOKEN_PROJECT_ID, 'registry', 'TVER')
    assert.fieldEquals('CarbonProject', ISSUED_TOKEN_PROJECT_ID, 'name', projectInfo.name)
    assert.fieldEquals('CarbonProject', ISSUED_TOKEN_PROJECT_ID, 'methodologies', projectInfo.methodology)
    assert.fieldEquals('CarbonProject', ISSUED_TOKEN_PROJECT_ID, 'category', projectInfo.category)
    assert.fieldEquals('CarbonProject', ISSUED_TOKEN_PROJECT_ID, 'country', projectInfo.country)
    assert.fieldEquals('CarbonProject', ISSUED_TOKEN_PROJECT_ID, 'region', projectInfo.region)

    assert.fieldEquals('Token', id, 'tokenAddress', ISSUED_TOKEN_ADDRESS)
    assert.fieldEquals('Token', id, 'name', ISSUED_TOKEN_NAME)
    assert.fieldEquals('Token', id, 'symbol', ISSUED_TOKEN_SYMBOL)
    assert.fieldEquals('Token', id, 'decimals', ISSUED_TOKEN_DECIMALS.toString())
    assert.fieldEquals('Token', id, 'isExAnte', 'false')

    // Initial transfer to owner event
    const createInitialTransferEvent = createNewTransferEvent(ZERO_ADDRESS, issuedTokenOwner, ISSUED_TOKEN_AMOUNT)
    handleCarbonmarkCreditTransfer(createInitialTransferEvent)

    let creditId = issuedTokenAddress.toHexString()
    assert.fieldEquals('CarbonCredit', creditId, 'currentSupply', ISSUED_TOKEN_AMOUNT.toString())

    let provenanceId = issuedTokenAddress.concat(issuedTokenOwner).concat(Bytes.fromI32(0)).toHexString()
    assert.fieldEquals('ProvenanceRecord', provenanceId, 'transactionType', 'ORIGINATION')

    clearStore()
  })

  test('Transfer from beneficiary to third party', () => {
    setup();
    let creditId = issuedTokenAddress.toHexString()

    const transferEvent = createNewTransferEvent(issuedTokenOwner, issuedTokenTransferTo, ISSUED_TOKEN_TRANSFER_VALUE)
    handleCarbonmarkCreditTransfer(transferEvent)
    assert.fieldEquals('CarbonCredit', creditId, 'currentSupply', ISSUED_TOKEN_AMOUNT.toString())

    let provenanceId = issuedTokenAddress.concat(issuedTokenTransferTo).concat(Bytes.fromI32(1)).toHexString()
    assert.fieldEquals('ProvenanceRecord', provenanceId, 'transactionType', 'TRANSFER')

  })

  test('Token owner retires with the TVER Token contract', () => {
    setup();

    // Transfer to Zero address event
    let creditId = issuedTokenAddress.toHexString()
    const zeroTransferEvent = createNewTransferEvent(issuedTokenTransferTo, ZERO_ADDRESS, ISSUED_TOKEN_TRANSFER_VALUE)
    handleCarbonmarkCreditTransfer(zeroTransferEvent)
    assert.fieldEquals('CarbonCredit', creditId, 'currentSupply', (ISSUED_TOKEN_AMOUNT - ISSUED_TOKEN_TRANSFER_VALUE).toString())

    let provenanceId = issuedTokenAddress.concat(ZERO_ADDRESS).concat(Bytes.fromI32(1)).toHexString()
    assert.fieldEquals('ProvenanceRecord', provenanceId, 'transactionType', 'TRANSFER')

    // Retire with the TVER Token contract event
    const retirementEvent = createNewTokenRetiredEvent()
    handleCarbonmarkCreditRetirement(retirementEvent)

    let id = retirementEvent.transaction.from.concatI32(0).toHexString()
    assert.fieldEquals('Retire', id, 'id', id)
    assert.fieldEquals('Retire', id, 'credit', ISSUED_TOKEN_ADDRESS)
    assert.fieldEquals('Retire', id, 'source', 'OTHER')
    assert.fieldEquals('Retire', id, 'amount', RETIREMENT_AMOUNT.toString())
    assert.fieldEquals('Retire', id, 'amountTonnes', '0.000000000000005786')
    assert.fieldEquals('Retire', id, 'beneficiaryAddress', RETIREMENT_BENEFICIARY_ADDRESS.toLowerCase())
    assert.fieldEquals('Retire', id, 'beneficiaryName', RETIREMENT_BENEFICIARY_NAME)
    assert.fieldEquals('Retire', id, 'beneficiaryLocation', '')
    assert.fieldEquals('Retire', id, 'consumptionCountryCode', '')
    assert.fieldEquals('Retire', id, 'consumptionPeriodStart', '0')
    assert.fieldEquals('Retire', id, 'consumptionPeriodEnd', '0')
    assert.fieldEquals('Retire', id, 'retirementMessage', RETIREMENT_BENEFICIARY_MESSAGE)
    assert.fieldEquals('Retire', id, 'retiringAddress', retirementEvent.transaction.from.toHexString().toLowerCase())
    assert.fieldEquals('Retire', id, 'retiringName', '')
    assert.fieldEquals('Retire', id, 'hash', retirementEvent.transaction.hash.toHexString().toLowerCase())
    assert.fieldEquals('Retire', id, 'timestamp', retirementEvent.block.timestamp.toString())
    assert.fieldEquals('Retire', id, 'provenance', provenanceId)

    assert.fieldEquals('ProvenanceRecord', provenanceId, 'transactionType', 'RETIREMENT')

  })

})
