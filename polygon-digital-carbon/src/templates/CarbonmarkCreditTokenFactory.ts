import { CarbonmarkCreditToken } from '../../generated/templates'
import {
  NewTokenProject
} from '../../generated/C3ProjectTokenFactory/C3ProjectTokenFactory'
import { loadOrCreateCarbonCredit, updateCarbonCreditWithCall } from '../utils/CarbonCredit'
import { createTokenWithCall } from '../utils/Token'


export function handleNewCarbonmarkCredit(event: NewTokenProject): void {
  // Start indexing the C3T tokens; `event.params.tokenAddress` is the
  // address of the new token contract
  CarbonmarkCreditToken.create(event.params.tokenAddress)
  loadOrCreateCarbonCredit(event.params.tokenAddress, 'CMARK', null)
  createTokenWithCall(event.params.tokenAddress, event.block)
  updateCarbonCreditWithCall(event.params.tokenAddress, '')
}
