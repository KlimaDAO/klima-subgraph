import {
  ICR_MIGRATION_BLOCK,
  KLIMA_INFINITY_DIAMOND,
  MCO2_ERC20_CONTRACT,
  ZERO_ADDRESS,
} from '../../lib/utils/Constants'
import { BIG_INT_1E18, ZERO_BI } from '../../lib/utils/Decimals'

import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import { C3OffsetNFT, VCUOMinted } from '../generated/C3-Offset/C3OffsetNFT'
import { CarbonOffset } from '../generated/MossCarbonOffset/CarbonChain'
import { RetiredVintage } from '../generated/templates/ICRProjectToken/ICRProjectToken'
import { Retired, Retired1 as Retired_1_4_0 } from '../generated/templates/ToucanCarbonOffsets/ToucanCarbonOffsets'
import { incrementAccountRetirements, loadOrCreateAccount } from './utils/Account'
import { loadCarbonCredit, loadOrCreateCarbonCredit } from './utils/CarbonCredit'
import { loadOrCreateCarbonProject } from './utils/CarbonProject'
import { recordProvenance, updateProvenanceForRetirement } from './utils/Provenance'
import { saveRetire } from './utils/Retire'
import { Account, C3OffsetRequest } from '../generated/schema'
import { C3ProjectToken } from '../generated/templates/C3ProjectToken/C3ProjectToken'

export function saveToucanRetirement(event: Retired): void {
  // Disregard events with zero amount
  if (event.params.tokenId == ZERO_BI) {
    return
  }

  let credit = loadCarbonCredit(event.address)

  credit.retired = credit.retired.plus(event.params.tokenId)
  credit.save()

  // Ensure account entities are created for all addresses
  let sender = loadOrCreateAccount(event.transaction.from)
  let senderAddress = event.transaction.from
  loadOrCreateAccount(event.params.sender) // Beneficiary address

  saveRetire(
    sender.id.concatI32(sender.totalRetirements),
    credit.id,
    ZERO_ADDRESS,
    'OTHER',
    event.params.tokenId,
    event.params.sender,
    '',
    senderAddress,
    '',
    event.block.timestamp,
    event.transaction.hash
  )

  incrementAccountRetirements(senderAddress)
}

export function saveToucanRetirement_1_4_0(event: Retired_1_4_0): void {
  // Disregard events with zero amount
  if (event.params.amount == ZERO_BI) {
    return
  }

  let credit = loadCarbonCredit(event.address)

  credit.retired = credit.retired.plus(event.params.amount)
  credit.save()

  // Ensure account entities are created for all addresses
  let sender = loadOrCreateAccount(event.transaction.from)
  let senderAddress = event.transaction.from
  loadOrCreateAccount(event.params.sender) // Beneficiary address

  saveRetire(
    sender.id.concatI32(sender.totalRetirements),
    credit.id,
    ZERO_ADDRESS,
    'OTHER',
    event.params.amount,
    event.params.sender,
    '',
    senderAddress,
    '',
    event.block.timestamp,
    event.transaction.hash,
    event.params.eventId.toString()
  )

  incrementAccountRetirements(senderAddress)
}

export function handleVCUOMinted(event: VCUOMinted): void {
  // Currently the NFT minting is required and happens within every offset or offsetFor transaction made against a C3T
  // This event only emits who receives the NFT and the token ID, although the data is stored.
  // Update associated entities using a call to retrieve the retirement details.

  log.info('asd handleVCUOMinted ; hash: {} TxIndex3: {}; LogIndex: {} Block: {}', [
    event.transaction.hash.toHexString(),
    event.transaction.index.toString(),
    event.logIndex.toString(),
    event.block.number.toString(),
  ])
  log.info('VCUO Minted: {} Sender: {}', [event.params.tokenId.toString(), event.params.sender.toHexString()])

  let retireContract = C3OffsetNFT.bind(event.address)

  let projectAddress: Address = ZERO_ADDRESS
  let retireAmount: BigInt = BigInt.fromI32(0)

  let addressResponse = retireContract.try_list(event.params.tokenId)
  let amountResponse = retireContract.try_list(event.params.tokenId)

  if (!addressResponse.reverted) {
    projectAddress = addressResponse.value.getProjectAddress()
  }
  if (!amountResponse.reverted) {
    retireAmount = amountResponse.value.getAmount()
  }

  // let credit = loadCarbonCredit(projectAddress)
  //  this was failing on this txn: https://mumbai.polygonscan.com/tx/0x6c50f6ce6a42ab71de3374eb6092ed3573062d9c5b9220960bf9fa662785240d#eventlog
  let credit = loadOrCreateCarbonCredit(projectAddress, 'C3', null)

  credit.retired = credit.retired.plus(retireAmount)
  credit.save()

  // Ensure account entities are created for all addresses
  // ALERT: Changing this here.

  let sender: Account
  let senderAddress: Address

  let paramsSender = loadOrCreateAccount(event.params.sender)

  let requestId = paramsSender.id.concatI32(paramsSender.totalRetirements).toHexString()

  let request = C3OffsetRequest.load(requestId)

  if (request != null && request.status == 'PENDING') {
    sender = paramsSender
    senderAddress = Address.fromBytes(paramsSender.id)
    loadOrCreateAccount(event.transaction.from)
  } else {
    sender = loadOrCreateAccount(event.transaction.from)
    senderAddress = event.transaction.from
    loadOrCreateAccount(event.params.sender)
  }

  // Ensure account entities are created for all addresses

  log.info('retirelogvalues {} {} {} {} {} {} {} {} {} {} {}', [
    sender.id.concatI32(sender.totalRetirements).toHexString(),
    projectAddress.toHexString(),
    ZERO_ADDRESS.toHexString(),
    'OTHER',
    retireAmount.toString(),
    event.params.sender.toHexString(),
    '',
    senderAddress.toHexString(),
    '',
    event.block.timestamp.toString(),
    event.transaction.hash.toHexString(),
  ])

  saveRetire(
    sender.id.concatI32(sender.totalRetirements),
    projectAddress,
    ZERO_ADDRESS,
    'OTHER',
    retireAmount,
    event.params.sender,
    '',
    senderAddress,
    '',
    event.block.timestamp,
    event.transaction.hash
  )
  log.info('Retirement saved: {}, senderAddress {} hash: {}', [
    event.params.tokenId.toString(),
    senderAddress.toHexString(),
    event.transaction.hash.toHexString(),
  ])

  incrementAccountRetirements(senderAddress)
}

export function handleMossRetirement(event: CarbonOffset): void {
  // Don't process zero amount events
  if (event.params.carbonTon == ZERO_BI) return

  let credit = loadOrCreateCarbonCredit(MCO2_ERC20_CONTRACT, 'MOSS', null)

  // Set up project/default info for Moss "project"

  if (credit.vintage == 1970) {
    credit.vintage = 2021
    credit.project = 'Moss'
    credit.save()

    loadOrCreateCarbonProject('VERRA', 'Moss')
  }

  credit.retired = credit.retired.plus(event.params.carbonTon)
  credit.save()

  // Ensure account entities are created for all addresses
  loadOrCreateAccount(event.params.sender)
  let sender = loadOrCreateAccount(event.transaction.from)
  let senderAddress = event.transaction.from

  saveRetire(
    sender.id.concatI32(sender.totalRetirements),
    MCO2_ERC20_CONTRACT,
    MCO2_ERC20_CONTRACT,
    'OTHER',
    event.params.carbonTon,
    event.params.sender,
    event.params.onBehalfOf,
    senderAddress,
    '',
    event.block.timestamp,
    event.transaction.hash
  )

  incrementAccountRetirements(senderAddress)
}

export function saveICRRetirement(event: RetiredVintage): void {
  let credit = loadOrCreateCarbonCredit(event.address, 'ICR', event.params.tokenId)

  let amount = event.params.amount
  if (event.block.number < ICR_MIGRATION_BLOCK) {
    amount = event.params.amount.times(BIG_INT_1E18)
  }

  credit.retired = credit.retired.plus(amount)
  credit.save()

  // Ensure account entities are created for all addresses
  loadOrCreateAccount(event.params.account)
  let sender = loadOrCreateAccount(event.transaction.from)
  let senderAddress = event.transaction.from

  saveRetire(
    sender.id.concatI32(sender.totalRetirements),
    credit.id,
    ZERO_ADDRESS,
    'OTHER',
    amount,
    event.params.account,
    '',
    senderAddress,
    '',
    event.block.timestamp,
    event.transaction.hash,
    event.params.nftTokenId.toString(),
    event.params.data.toString()
  )

  incrementAccountRetirements(senderAddress)
}
