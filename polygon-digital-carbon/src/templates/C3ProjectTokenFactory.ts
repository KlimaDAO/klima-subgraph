import { C3ProjectToken } from '../../generated/templates'
import { NewTokenProject } from '../../generated/C3ProjectTokenFactory/C3ProjectTokenFactory'
import { loadOrCreateCarbonCredit, updateCarbonCreditWithCall } from '../utils/CarbonCredit'
import { createTokenWithCall } from '../utils/Token'
import { log } from '@graphprotocol/graph-ts'
import { ZERO_BI } from '../../../lib/utils/Decimals'
import { saveStartAsyncToken } from '../RetirementHandler'
import { recordProvenance } from '../utils/Provenance'
import { ZERO_ADDRESS } from '../../../lib/utils/Constants'
import { completeC3OffsetRequest } from '../RetirementHandler'
import { StartAsyncToken, EndAsyncToken } from '../../generated/C3ProjectTokenFactory/C3ProjectTokenFactory'

export function handleNewC3T(event: NewTokenProject): void {
  // Start indexing the C3T tokens; `event.params.tokenAddress` is the
  // address of the new token contract
  C3ProjectToken.create(event.params.tokenAddress)
  loadOrCreateCarbonCredit(event.params.tokenAddress, 'C3', null)
  createTokenWithCall(event.params.tokenAddress)
  updateCarbonCreditWithCall(event.params.tokenAddress)
}

// asyncToken handling

export function handleStartAsyncToken(event: StartAsyncToken): void {
  // Ignore retirements of zero value
  if (event.params.amount == ZERO_BI) return

  saveStartAsyncToken(event)

  recordProvenance(
    event.transaction.hash,
    event.params.fromToken,
    null,
    event.transaction.from,
    ZERO_ADDRESS,
    'RETIREMENT',
    event.params.amount,
    event.block.timestamp
  )
}

export function handleEndAsyncToken(event: EndAsyncToken): void {
  // load request and set status to completed
  completeC3OffsetRequest(event)
}
