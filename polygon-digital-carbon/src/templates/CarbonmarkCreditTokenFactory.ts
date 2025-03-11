import { CarbonmarkCreditToken } from '../../generated/templates'
import { loadOrCreateCarbonCredit, updateCarbonCreditWithCall } from '../utils/CarbonCredit'
import { createTokenWithCall } from '../utils/Token'
import { Issued } from '../../generated/CarbonmarkCreditTokenFactory/CarbonmarkCreditTokenFactory'


export function handleNewCarbonmarkCredit(event: Issued): void {
  // Start indexing the Carbonmak tokens; `event.params.tokenAddress` is the
  // address of the new token contract
  CarbonmarkCreditToken.create(event.params.creditTokenAddress)
  const prefix = event.params.creditId.toString().split('-')[0]
  loadOrCreateCarbonCredit(event.params.creditTokenAddress, prefix, null)
  createTokenWithCall(event.params.creditTokenAddress, event.block)
  updateCarbonCreditWithCall(event.params.creditTokenAddress, '')
}
