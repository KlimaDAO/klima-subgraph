import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { ToucanCarbonOffsets, ToucanPuroCarbonOffsets } from '../../generated/templates'
import { TokenCreated } from '../../generated/ToucanFactory/ToucanCarbonOffsetsFactory'
import { loadOrCreateCarbonCredit, updateCarbonCreditWithCall } from '../utils/CarbonCredit'
import { createTokenWithCall } from '../utils/Token'
import { loadOrCreateCarbonProject } from '../utils/CarbonProject'

export function handleNewTCO2(event: TokenCreated): void {
  ToucanCarbonOffsets.create(event.params.tokenAddress)
  setupNewToucanCredit(event.params.tokenAddress, 'VERRA')
}

export function handleNewPuroTCO2(event: TokenCreated): void {
  ToucanPuroCarbonOffsets.create(event.params.tokenAddress)
  setupNewToucanCredit(event.params.tokenAddress, 'PURO_EARTH')
}

// testing initialization only to avoid full sync. Remove from production version
export function initializePuroCredit(block: ethereum.Block): void {
  let tokenAddress = Address.fromString("0x6960cE1d21f63C4971324B5b611c4De29aCF980C")
  ToucanPuroCarbonOffsets.create(tokenAddress)
  setupNewToucanCredit(tokenAddress, 'PURO_EARTH')
  loadOrCreateCarbonProject('PURO_EARTH', '558')
}

function setupNewToucanCredit(tokenAddress: Address, registry: string, tokenId: BigInt | null = null): void {
  loadOrCreateCarbonCredit(tokenAddress, 'TOUCAN', null)
  createTokenWithCall(tokenAddress)
  updateCarbonCreditWithCall(tokenAddress, registry)
}
