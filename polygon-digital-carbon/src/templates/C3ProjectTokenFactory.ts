import { C3ProjectToken } from '../../generated/templates'
import {
  NewTokenProject,
  StartAsyncToken,
  EndAsyncToken,
} from '../../generated/C3ProjectTokenFactory/C3ProjectTokenFactory'
import { loadOrCreateCarbonCredit, updateCarbonCreditWithCall } from '../utils/CarbonCredit'
import { createTokenWithCall } from '../utils/Token'
import { ZERO_BI } from '../../../lib/utils/Decimals'
import { saveStartAsyncToken, completeC3RetireRequest } from '../RetirementHandler'
import { ethereum, log, Address } from '@graphprotocol/graph-ts'
import { loadOrCreateCarbonPool } from '../utils/CarbonPool'

export function handleNewC3T(event: NewTokenProject): void {
  // Start indexing the C3T tokens; `event.params.tokenAddress` is the
  // address of the new token contract
  C3ProjectToken.create(event.params.tokenAddress)
  loadOrCreateCarbonCredit(event.params.tokenAddress, 'C3', null)
  createTokenWithCall(event.params.tokenAddress, event.block)
  updateCarbonCreditWithCall(event.params.tokenAddress, '')
}

export function initializeC3Credits(block: ethereum.Block): void {
  // Eco-114
  let ecoTokenAddress = Address.fromString('0xa8853ffc5a0aeab7d31631a4b87cb12c0b289c6c')

  C3ProjectToken.create(ecoTokenAddress)
  loadOrCreateCarbonCredit(ecoTokenAddress, 'C3', null)
  createTokenWithCall(ecoTokenAddress, block)
  updateCarbonCreditWithCall(ecoTokenAddress, '')

  // initalize cco2
  loadOrCreateCarbonPool(Address.fromString('0x82b37070e43c1ba0ea9e2283285b674ef7f1d4e2'));
}

// asyncToken handling

export function handleStartAsyncToken(event: StartAsyncToken): void {
  // Ignore retirements of zero value
  if (event.params.amount == ZERO_BI) return

  log.info('handleStartAsyncToken event fired {}', [event.transaction.hash.toHexString()])
  saveStartAsyncToken(event)
}

export function handleEndAsyncToken(event: EndAsyncToken): void {
  // load request and set status to completed
  completeC3RetireRequest(event)
}
