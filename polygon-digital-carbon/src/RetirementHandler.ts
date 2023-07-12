import { MCO2_ERC20_CONTRACT, ZERO_ADDRESS } from '../../lib/utils/Constants'
import { ZERO_BI } from '../../lib/utils/Decimals'
import { C3OffsetNFT, VCUOMinted } from '../generated/C3-Offset/C3OffsetNFT'
import { CarbonOffset } from '../generated/MossCarbonOffset/CarbonChain'
import { Retired, Retired1 as Retired_1_4_0 } from '../generated/templates/ToucanCarbonOffsets/ToucanCarbonOffsets'
import { incrementAccountRetirements, loadOrCreateAccount } from './utils/Account'
import { loadCarbonOffset, loadOrCreateCarbonOffset } from './utils/CarbonOffset'
import { loadOrCreateCarbonProject } from './utils/CarbonProject'
import { saveRetire } from './utils/Retire'

export function saveToucanRetirement(event: Retired): void {
  let offset = loadCarbonOffset(event.address)

  offset.retired = offset.retired.plus(event.params.tokenId)
  offset.save()

  // Ensure account entities are created for all addresses
  loadOrCreateAccount(event.params.sender)
  let sender = loadOrCreateAccount(event.transaction.from)

  saveRetire(
    event.transaction.from.concatI32(sender.totalRetirements),
    event.address,
    ZERO_ADDRESS,
    'OTHER',
    event.params.tokenId,
    event.params.sender,
    '',
    event.transaction.from,
    '',
    event.block.timestamp,
    null
  )

  incrementAccountRetirements(event.transaction.from)
}

export function saveToucanRetirement_1_4_0(event: Retired_1_4_0): void {
  let offset = loadCarbonOffset(event.address)

  offset.retired = offset.retired.plus(event.params.amount)
  offset.save()

  // Ensure account entities are created for all addresses
  loadOrCreateAccount(event.params.sender)
  let sender = loadOrCreateAccount(event.transaction.from)

  saveRetire(
    event.transaction.from.concatI32(sender.totalRetirements),
    event.address,
    ZERO_ADDRESS,
    'OTHER',
    event.params.amount,
    event.params.sender,
    '',
    event.transaction.from,
    '',
    event.block.timestamp,
    event.params.eventId.toString()
  )

  incrementAccountRetirements(event.transaction.from)
}

export function handleVCUOMinted(event: VCUOMinted): void {
  // Currently the NFT minting is required and happens within every offset or offsetFor transaction made against a C3T
  // This event only emits who receives the NFT and the token ID, although the data is stored.
  // Update associated entities using a call to retrieve the retirement details.

  let retireContract = C3OffsetNFT.bind(event.address)

  let projectAddress = retireContract.list(event.params.tokenId).getProjectAddress()
  let retireAmount = retireContract.list(event.params.tokenId).getAmount()

  let offset = loadCarbonOffset(projectAddress)

  offset.retired = offset.retired.plus(retireAmount)
  offset.save()

  // Ensure account entities are created for all addresses
  loadOrCreateAccount(event.params.sender)
  let sender = loadOrCreateAccount(event.transaction.from)

  saveRetire(
    event.transaction.from.concatI32(sender.totalRetirements),
    projectAddress,
    ZERO_ADDRESS,
    'OTHER',
    retireAmount,
    event.params.sender,
    '',
    event.transaction.from,
    '',
    event.block.timestamp,
    null
  )

  incrementAccountRetirements(event.transaction.from)
}

export function handleMossRetirement(event: CarbonOffset): void {
  // Don't process zero amount events
  if (event.params.carbonTon == ZERO_BI) return

  let offset = loadOrCreateCarbonOffset(MCO2_ERC20_CONTRACT, 'MOSS')

  // Set up project/default info for Moss "project"

  if (offset.vintage == 1970) {
    offset.vintage = 2021
    offset.project = 'Moss'
    offset.save()

    loadOrCreateCarbonProject('VERRA', 'Moss')
  }

  offset.retired = offset.retired.plus(event.params.carbonTon)
  offset.save()

  // Ensure account entities are created for all addresses
  loadOrCreateAccount(event.params.sender)
  let sender = loadOrCreateAccount(event.transaction.from)

  saveRetire(
    event.transaction.from.concatI32(sender.totalRetirements),
    MCO2_ERC20_CONTRACT,
    MCO2_ERC20_CONTRACT,
    'OTHER',
    event.params.carbonTon,
    event.params.sender,
    event.params.onBehalfOf,
    event.transaction.from,
    '',
    event.block.timestamp,
    null
  )

  incrementAccountRetirements(event.transaction.from)
}

// export function handleMossRetirementToMainnet(): void {}
