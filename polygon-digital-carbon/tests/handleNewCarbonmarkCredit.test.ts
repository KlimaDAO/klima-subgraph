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
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { ICRProjectToken } from '../generated/ICRCarbonContractRegistry/ICRProjectToken'
import { ExPostCreated } from '../generated/templates/ICRProjectToken/ICRProjectToken'
import { handleExPostCreated } from '../src/TransferHandler'
import { createICRTokenWithCall, createICRTokenID } from '../src/utils/Token'
import { CarbonmarkCreditToken } from '../generated/templates'
import {Issued} from '../generated/CarbonmarkCreditTokenFactory/CarbonmarkCreditTokenFactory'
import { handleNewCarbonmarkCredit } from '../src/templates/CarbonmarkCreditTokenFactory'
import { Token } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts'


const ISSUED_TOKEN_ADDRESS = '0xae63fbd056512fc4b1d15b58a98f9aaea44b18a9'
//const ISSUED_TOKEN_CONTRACT = CarbonmarkCreditToken.bind(ISSUED_TOKEN_ADDRESS)
const ISSUED_TOKEN_BENEFICIARY = '0x3Da300661Eb0f04a4044A4fB01d79E66C8c81ED9'
const ISSUED_TOKEN_CREDIT_ID = "CMARK-15-2025"
const ISSUED_TOKEN_SYMBOL = `CMARK-${ISSUED_TOKEN_CREDIT_ID}`
const ISSUED_TOKEN_NAME = `CMARK: ${ISSUED_TOKEN_CREDIT_ID}`
const ISSUED_TOKEN_DECIMALS = 18
const ISSUED_AMOUNT = 115221

const issuedTokenAddress=Address.fromString(ISSUED_TOKEN_ADDRESS)

export function createNewIssuedEvent(): Issued {
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
  let amount = new ethereum.EventParam('amount', ethereum.Value.fromI32(ISSUED_AMOUNT))
  let to = new ethereum.EventParam('to', ethereum.Value.fromAddress(Address.fromString(ISSUED_TOKEN_BENEFICIARY)))
  let creditTokenAddress = new ethereum.EventParam('creditTokenAddress', ethereum.Value.fromAddress(issuedTokenAddress))
  issuedEvent.parameters = new Array()
  issuedEvent.parameters.push(creditId)
  issuedEvent.parameters.push(amount)
  issuedEvent.parameters.push(to)
  issuedEvent.parameters.push(creditTokenAddress)
  
  return issuedEvent
}

describe('handleNewCarbonmarkCredit Tests', () => {
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

  test('Create Carbonmark Token entity', () => {
    const event = createNewIssuedEvent()

    handleNewCarbonmarkCredit(event)
    let token = Token.load(issuedTokenAddress)
    if (token)
    log.debug(token.name, [])
    
    assert.fieldEquals('Token', issuedTokenAddress.toHexString(), 'tokenAddress', ISSUED_TOKEN_ADDRESS)
    assert.fieldEquals('Token', issuedTokenAddress.toHexString(), 'name', ISSUED_TOKEN_NAME)
    assert.fieldEquals('Token', issuedTokenAddress.toHexString(), 'symbol', ISSUED_TOKEN_SYMBOL)
    assert.fieldEquals('Token', issuedTokenAddress.toHexString(), 'decimals', ISSUED_TOKEN_DECIMALS.toString())
    assert.fieldEquals('Token', issuedTokenAddress.toHexString(), 'isExAnte', 'false')

    clearStore()
  })
})
