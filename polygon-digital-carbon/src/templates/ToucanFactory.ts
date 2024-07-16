import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { ToucanCarbonOffsets, ToucanPuroCarbonOffsets } from '../../generated/templates'
import { TokenCreated } from '../../generated/ToucanFactory/ToucanCarbonOffsetsFactory'
import { loadOrCreateCarbonCredit, updateCarbonCreditWithCall } from '../utils/CarbonCredit'
import { createTokenWithCall } from '../utils/Token'
import { loadOrCreateCarbonProject } from '../utils/CarbonProject'

export function handleNewTCO2(event: TokenCreated): void {
  ToucanCarbonOffsets.create(event.params.tokenAddress)
  setupNewToucanCredit(event.params.tokenAddress, 'VERRA', event.block)
}

export function handleNewPuroTCO2(event: TokenCreated): void {
  ToucanPuroCarbonOffsets.create(event.params.tokenAddress)
  setupNewToucanCredit(event.params.tokenAddress, 'PURO_EARTH', event.block)
}

// testing initialization only to avoid full sync. Remove from production version
export function initializeToucanCredits(block: ethereum.Block): void {
  let puroTokenAddress1 = Address.fromString("0x6960ce1d21f63c4971324b5b611c4de29acf980c")
  ToucanPuroCarbonOffsets.create(puroTokenAddress1)
  setupNewToucanCredit(puroTokenAddress1, 'PURO_EARTH', block)
  loadOrCreateCarbonProject('PURO_EARTH', '862421')

  let puroTokenAddress2 = Address.fromString("0x9bbc1563fa8a2267ee0c846c591208160afb0b34")
  ToucanPuroCarbonOffsets.create(puroTokenAddress2)
  setupNewToucanCredit(puroTokenAddress2, 'PURO_EARTH', block)
  loadOrCreateCarbonProject('PURO_EARTH', '175613')
}




function setupNewToucanCredit(
  tokenAddress: Address,
  registry: string,
  block: ethereum.Block,
  tokenId: BigInt | null = null
): void {
  loadOrCreateCarbonCredit(tokenAddress, 'TOUCAN', null)
  createTokenWithCall(tokenAddress, block)
  updateCarbonCreditWithCall(tokenAddress, registry)
}
