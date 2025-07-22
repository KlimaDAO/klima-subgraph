import { clearStore, test, describe, newMockEvent, beforeEach, assert, createMockedFunction } from 'matchstick-as'
import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Address, ethereum } from '@graphprotocol/graph-ts'
import { CreditAdded } from '../generated/CreditManager/CreditManager'
import { ListingCreated } from '../generated/Carbonmark/Carbonmark'
import { handleCreditAdded } from '../src/CreditManager'
import { handleListingCreated } from '../src/Carbonmark'

// credit added

const ACTOR_ADDRESS = '0x3Da300661Eb0f04a4044A4fB01d79E66C8c81ED9'
const ActorAddress = Address.fromString(ACTOR_ADDRESS)
const TOKEN_ADDRESS = '0xCcAcC6099debD9654C6814fCb800431Ef7549b10'
const tokenAddress = Address.fromString(TOKEN_ADDRESS)
const TOKEN_ID = 0
const IS_EX_ANTE = false
const PROJECT_ID = 'POC-999'
const REGISTRY = 'POC'
const VINTAGE = '3000'
const NAME = 'Project that cannot be found in the PROJECT_INFO array'
const SYMBOL = 'POC-999-3000'
const METHODOLOGIES = ['ACM0001']
const CATEGORY = 'Coal Mine'
const COUNTRY = 'Antartica'
const REGION = 'unknown'
const DESCRIPTION = 'description'

// listing

const LISTING_ID = '0x1234567890'
const SELLER_ADDRESS = '0xAbC1230000000000000000000000000000000000'
const TOTAL_AMOUNT = BigInt.fromI32(100)
const UNIT_PRICE = BigInt.fromI32(50)
const EXPIRATION = BigInt.fromI32(1_763_000_000) // arbitrary
const MIN_FILL = BigInt.fromI32(1)

export function newCreditAddedEvent(): CreditAdded {
  let mockEvent = newMockEvent()

  let creditAddedEvent = new CreditAdded(
    ActorAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )

  let eventTokenAddress = new ethereum.EventParam('tokenAddress', ethereum.Value.fromAddress(tokenAddress))
  let tokenId = new ethereum.EventParam('tokenId', ethereum.Value.fromI32(TOKEN_ID))
  let isExAnte = new ethereum.EventParam('isExAnte', ethereum.Value.fromBoolean(IS_EX_ANTE))
  let projectId = new ethereum.EventParam('projectId', ethereum.Value.fromString(PROJECT_ID))
  let vintage = new ethereum.EventParam('vintage', ethereum.Value.fromString(VINTAGE))
  let name = new ethereum.EventParam('name', ethereum.Value.fromString(NAME))
  let methodologies = new ethereum.EventParam('methodologies', ethereum.Value.fromStringArray(METHODOLOGIES))
  let category = new ethereum.EventParam('category', ethereum.Value.fromString(CATEGORY))
  let country = new ethereum.EventParam('country', ethereum.Value.fromString(COUNTRY))
  let region = new ethereum.EventParam('region', ethereum.Value.fromString(REGION))
  let description = new ethereum.EventParam('description', ethereum.Value.fromString(DESCRIPTION))

  creditAddedEvent.parameters = new Array()
  creditAddedEvent.parameters.push(eventTokenAddress)
  creditAddedEvent.parameters.push(tokenId)
  creditAddedEvent.parameters.push(isExAnte)
  creditAddedEvent.parameters.push(projectId)
  creditAddedEvent.parameters.push(vintage)
  creditAddedEvent.parameters.push(name)
  creditAddedEvent.parameters.push(methodologies)
  creditAddedEvent.parameters.push(category)
  creditAddedEvent.parameters.push(country)
  creditAddedEvent.parameters.push(region)
  creditAddedEvent.parameters.push(description)

  return creditAddedEvent
}

function newListingCreatedEvent(): ListingCreated {
  let mock = newMockEvent()
  let listingCreatedEvent = new ListingCreated(
    Address.fromString(SELLER_ADDRESS),
    mock.logIndex,
    mock.transactionLogIndex,
    mock.logType,
    mock.block,
    mock.transaction,
    mock.parameters,
    mock.receipt
  )
  listingCreatedEvent.parameters = [
    // assume your event signature is:
    // event ListingCreated(string id, address seller, address token, uint256 tokenId, uint256 totalAmount, uint256 unitPrice, uint256 expiration, uint256 minFill)
    new ethereum.EventParam('id', ethereum.Value.fromBytes(Bytes.fromHexString(LISTING_ID))),
    new ethereum.EventParam('account', ethereum.Value.fromAddress(Address.fromString(SELLER_ADDRESS))),
    new ethereum.EventParam('token', ethereum.Value.fromAddress(Address.fromString(TOKEN_ADDRESS))),
    new ethereum.EventParam('tokenId', ethereum.Value.fromI32(TOKEN_ID)),
    new ethereum.EventParam('price', ethereum.Value.fromUnsignedBigInt(UNIT_PRICE)),
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(TOTAL_AMOUNT)),
    new ethereum.EventParam('minFillAmount', ethereum.Value.fromUnsignedBigInt(MIN_FILL)),
    new ethereum.EventParam('deadline', ethereum.Value.fromUnsignedBigInt(EXPIRATION)),
  ]
  return listingCreatedEvent
}

describe('CreditManager tests', () => {
  beforeEach(() => {
    // ERC20 mocks
    createMockedFunction(Address.fromString(TOKEN_ADDRESS), 'name', 'name():(string)').returns([
      ethereum.Value.fromString(NAME),
    ])

    createMockedFunction(Address.fromString(TOKEN_ADDRESS), 'symbol', 'symbol():(string)').returns([
      ethereum.Value.fromString(SYMBOL),
    ])

    createMockedFunction(Address.fromString(TOKEN_ADDRESS), 'decimals', 'decimals():(uint8)').returns([
      ethereum.Value.fromI32(18),
    ])

    // 1155 mocks
    createMockedFunction(Address.fromString(TOKEN_ADDRESS), 'supportsInterface', 'supportsInterface(bytes4):(bool)')
      .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString('0xd9b67a26'))])
      .returns([ethereum.Value.fromBoolean(true)])

    clearStore()
  })

  test('CreditAdded event', () => {
    // Issuance event
    const event = newCreditAddedEvent()
    const id = event.params.projectId + '-' + event.params.vintage

    handleCreditAdded(event)
    assert.fieldEquals('Project', id, 'key', PROJECT_ID)
    assert.fieldEquals('Project', id, 'name', NAME)
    assert.fieldEquals('Project', id, 'methodology', METHODOLOGIES[0])
    assert.fieldEquals('Project', id, 'isExAnte', IS_EX_ANTE.toString())
    assert.fieldEquals('Project', id, 'vintage', VINTAGE)
    assert.fieldEquals('Project', id, 'projectAddress', TOKEN_ADDRESS.toLowerCase())
    assert.fieldEquals('Project', id, 'registry', REGISTRY)
    assert.fieldEquals('Project', id, 'tokenId', TOKEN_ID.toString())
    assert.fieldEquals('Project', id, 'category', CATEGORY)
    assert.fieldEquals('Project', id, 'country', COUNTRY)
    assert.fieldEquals('Project', id, 'creditDataSource', 'Event')
  })

  test('CreditAdded populates Project & ProjectByToken', () => {
    const creditAddedEvent = newCreditAddedEvent()
    const id = PROJECT_ID + '-' + VINTAGE

    handleCreditAdded(creditAddedEvent)

    assert.fieldEquals('Project', id, 'key', PROJECT_ID)
    assert.fieldEquals('Project', id, 'name', NAME)
    assert.fieldEquals('Project', id, 'methodology', METHODOLOGIES[0])
    assert.fieldEquals('Project', id, 'isExAnte', 'false')
    assert.fieldEquals('Project', id, 'vintage', VINTAGE)
    assert.fieldEquals('Project', id, 'projectAddress', TOKEN_ADDRESS.toLowerCase())
    assert.fieldEquals('Project', id, 'registry', REGISTRY)
    assert.fieldEquals('Project', id, 'tokenId', TOKEN_ID.toString())
    assert.fieldEquals('Project', id, 'category', CATEGORY)
    assert.fieldEquals('Project', id, 'country', COUNTRY)
    assert.fieldEquals('Project', id, 'creditDataSource', 'Event')

    assert.fieldEquals('ProjectByToken', TOKEN_ADDRESS.toLowerCase() + '-' + TOKEN_ID.toString(), 'project', id)
  })

  test('ListingCreated uses that Project from store', () => {
    handleCreditAdded(newCreditAddedEvent())

    const listingEvent = newListingCreatedEvent()
    handleListingCreated(listingEvent)

    const projectId = PROJECT_ID + '-' + VINTAGE
    assert.fieldEquals('Listing', LISTING_ID, 'project', projectId)

    assert.fieldEquals('Listing', LISTING_ID, 'seller', SELLER_ADDRESS.toLowerCase())
    assert.fieldEquals('Listing', LISTING_ID, 'tokenAddress', TOKEN_ADDRESS.toLowerCase())
    assert.fieldEquals('Listing', LISTING_ID, 'tokenId', TOKEN_ID.toString())
    assert.fieldEquals('Listing', LISTING_ID, 'totalAmountToSell', TOTAL_AMOUNT.toString())
    assert.fieldEquals('Listing', LISTING_ID, 'singleUnitPrice', UNIT_PRICE.toString())
    assert.fieldEquals('Listing', LISTING_ID, 'expiration', EXPIRATION.toString())
    assert.fieldEquals('Listing', LISTING_ID, 'minFillAmount', MIN_FILL.toString())
  })
})
