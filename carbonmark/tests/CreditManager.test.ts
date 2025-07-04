import {
  clearStore,
  test,
  describe,
  newMockEvent,
  beforeEach,
  assert,
} from 'matchstick-as'
import { Address, ethereum } from '@graphprotocol/graph-ts'
import { CreditAdded } from '../generated/CreditManager/CreditManager'
import { handleCreditAdded } from '../src/CreditManager'


const ACTOR_ADDRESS = '0x3Da300661Eb0f04a4044A4fB01d79E66C8c81ED9'
const ActorAddress=Address.fromString(ACTOR_ADDRESS)
const TOKEN_ADDRESS = '0xCcAcC6099debD9654C6814fCb800431Ef7549b10'
const tokenAddress=Address.fromString(TOKEN_ADDRESS)
const TOKEN_ID = 0
const IS_EX_ANTE = false
const PROJECT_ID = 'VCS-191'
const REGISTRY = 'VCS'
const VINTAGE = '2009'
const NAME = '4×50 MW Dayingjiang- 3 Hydropower Project Phases 1&2'
const METHODOLOGIES = ['ACM0002']
const CATEGORY = 'Renewable Energy'
const COUNTRY = 'China'
const REGION = 'unknown'
const DESCRIPTION = 'description'

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

describe('CreditManager tests', () => {

  beforeEach(() => {
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
})
