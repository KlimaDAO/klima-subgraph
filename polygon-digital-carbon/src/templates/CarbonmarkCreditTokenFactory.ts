import { log } from '@graphprotocol/graph-ts'

import { CarbonmarkCreditToken } from '../../generated/templates'
import { CarbonmarkCreditToken as CarbonmarkCreditTokenContract } from '../../generated/CarbonmarkCreditTokenFactory/CarbonmarkCreditToken'
import { loadOrCreateCarbonCredit, updateCarbonCreditWithCall } from '../utils/CarbonCredit'
import { createTokenWithCall } from '../utils/Token'
import { Issued } from '../../generated/CarbonmarkCreditTokenFactory/CarbonmarkCreditTokenFactory'


export function handleNewCarbonmarkCredit(event: Issued): void {
  // Start indexing the Carbonmak tokens; `event.params.tokenAddress` is the
  // address of the new token contract
  CarbonmarkCreditToken.create(event.params.creditTokenAddress)

  let symbol = CarbonmarkCreditTokenContract.bind(event.params.creditTokenAddress).try_symbol()

  let prefix: string;
  if (!symbol.reverted) {
    prefix = symbol.value.split('-')[0]
  } else {
    prefix = 'CMARK'
    log.error('Failed to get prefix for token: {}', [event.params.creditTokenAddress.toHexString()])
  }

  loadOrCreateCarbonCredit(event.params.creditTokenAddress, prefix, null)
  createTokenWithCall(event.params.creditTokenAddress, event.block)
  updateCarbonCreditWithCall(event.params.creditTokenAddress, prefix) // <--- also need to add prefix here to create carbonProject
}
