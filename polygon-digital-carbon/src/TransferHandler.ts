import { Address, BigInt, Bytes, ethereum, log, store } from '@graphprotocol/graph-ts'
import { MCO2_ERC20_CONTRACT, TOUCAN_CROSS_CHAIN_MESSENGER, ZERO_ADDRESS } from '../../lib/utils/Constants'
import { Transfer } from '../generated/BCT/ERC20'
import { loadCarbonCredit, loadOrCreateCarbonCredit, updateICRCredit } from './utils/CarbonCredit'
import { Retired, Retired1 as Retired_1_4_0 } from '../generated/templates/ToucanCarbonOffsets/ToucanCarbonOffsets'
import {
  TransferSingle,
  TransferBatch,
  RetiredVintage,
  ExPostCreated,
  ExAnteMinted,
} from '../generated/templates/ICRProjectToken/ICRProjectToken'
import { loadOrCreateHolding } from './utils/Holding'
import { ZERO_BI } from '../../lib/utils/Decimals'
import { loadOrCreateAccount } from './utils/Account'
import { saveICRRetirement, saveToucanRetirement, saveToucanRetirement_1_4_0 } from './RetirementHandler'
import { saveBridge } from './utils/Bridge'
import { CarbonCredit, CrossChainBridge } from '../generated/schema'
import { checkForCarbonPoolSnapshot, loadOrCreateCarbonPool } from './utils/CarbonPool'
import { checkForCarbonPoolCreditSnapshot } from './utils/CarbonPoolCreditBalance'
import { loadOrCreateEcosystem } from './utils/Ecosystem'
import { recordProvenance } from './utils/Provenance'

export function handleCreditTransfer(event: Transfer): void {
  recordTransfer(
    event.address,
    null,
    event.params.from,
    event.params.to,
    event.params.value,
    event.transaction.hash,
    event.transactionLogIndex.toI32(),
    event.block.timestamp,
    event.block.number
  )
}

export function handlePoolTransfer(event: Transfer): void {
  // Ignore transfers of zero value
  if (event.params.value == ZERO_BI) return

  if (event.params.from != ZERO_ADDRESS) {
    loadOrCreateAccount(event.params.from)
    let fromHolding = loadOrCreateHolding(event.params.from, event.address, null)
    fromHolding.amount = fromHolding.amount.minus(event.params.value)
    fromHolding.lastUpdated = event.block.timestamp
    fromHolding.save()

    // Delete holding entity if there are no tokens held
    if (fromHolding.amount == ZERO_BI) {
      store.remove('Holding', fromHolding.id.toHexString())
    }
  }

  if (event.params.to != ZERO_ADDRESS) {
    loadOrCreateAccount(event.params.to)
    let toHolding = loadOrCreateHolding(event.params.to, event.address, null)
    toHolding.amount = toHolding.amount.plus(event.params.value)
    toHolding.lastUpdated = event.block.timestamp
    toHolding.save()
  }
}

export function handleToucanRetired(event: Retired): void {
  // Ignore retirements of zero value
  if (event.params.tokenId == ZERO_BI) return

  saveToucanRetirement(event)
}

export function handleToucanRetired_1_4_0(event: Retired_1_4_0): void {
  // Ignore retirements of zero value
  if (event.params.amount == ZERO_BI) return

  saveToucanRetirement_1_4_0(event)
}

export function handle1155CreditTransfer(event: TransferSingle): void {
  recordTransfer(
    event.address,
    event.params.id,
    event.params.from,
    event.params.to,
    event.params.value,
    event.transaction.hash,
    event.transactionLogIndex.toI32(),
    event.block.timestamp,
    event.block.number
  )
}

export function handle1155CreditTransferBatch(event: TransferBatch): void {
  for (let i = 0; i < event.params.ids.length; i++) {
    recordTransfer(
      event.address,
      event.params.ids[i],
      event.params.from,
      event.params.to,
      event.params.values[i],
      event.transaction.hash,
      event.transactionLogIndex.toI32(),
      event.block.timestamp,
      event.block.number
    )
  }
}

export function handleICRRetired(event: RetiredVintage): void {
  // Ignore retirements of zero value
  if (event.params.amount == ZERO_BI) return

  saveICRRetirement(event)
}

export function handleExPostCreated(event: ExPostCreated): void {
  updateICRCredit(event.address, event.params.tokenId, event.params.verificationPeriodStart)
}

export function handleExAnteMinted(event: ExAnteMinted): void {
  let exPostCredit = loadOrCreateCarbonCredit(event.address, 'ICR', event.params.exPostTokenId)
  let exAnteCredit = loadOrCreateCarbonCredit(event.address, 'ICR', event.params.exAnteTokenId)

  exAnteCredit.exPostTokenId = exPostCredit.tokenId
  exAnteCredit.project = exPostCredit.project
  exAnteCredit.vintage = exPostCredit.vintage
  exAnteCredit.isExAnte = true
  exAnteCredit.save()
}

function recordTransfer(
  tokenAddress: Address,
  tokenId: BigInt | null,
  from: Address,
  to: Address,
  amount: BigInt,
  hash: Bytes,
  logIndex: i32,
  timestamp: BigInt,
  blockNumber: BigInt
): void {
  let tokenVar = ''
  if (tokenId !== null) {
    tokenVar = tokenId.toString()
  }
  // Ignore transfers of zero value
  if (amount == ZERO_BI) return

  let creditId = Bytes.fromHexString(tokenAddress.toHexString())
  if (tokenAddress == MCO2_ERC20_CONTRACT) loadOrCreateCarbonCredit(MCO2_ERC20_CONTRACT, 'MOSS', null)

  if (tokenId !== null) {
    creditId = creditId.concatI32(tokenId.toI32())
  }
  let credit = CarbonCredit.load(creditId)

  // ICR issues new token IDs on the 1155 contract address for retirements that are not actual credit tokens
  if (credit == null) return

  if (from == ZERO_ADDRESS) {
    credit.currentSupply = credit.currentSupply.plus(amount)

    // Do not flag cross chain bridging as an actual bridge event
    let crossChain = CrossChainBridge.load(hash.concatI32(logIndex - 1))
    if (crossChain == null) {
      credit.bridged = credit.bridged.plus(amount)

      saveBridge(hash, logIndex, tokenAddress, to, amount, timestamp)

      if (tokenAddress != MCO2_ERC20_CONTRACT) {
        recordProvenance(hash, tokenAddress, tokenId, from, to, 'ORIGINATION', amount, timestamp)

        credit.provenanceCount += 1
      }
    }
  } else {
    loadOrCreateAccount(from)
    let fromHolding = loadOrCreateHolding(from, tokenAddress, tokenId)
    fromHolding.amount = fromHolding.amount.minus(amount)
    fromHolding.lastUpdated = timestamp
    fromHolding.save()

    // Delete holding entity if there are no tokens held and this isn't needed for provenance records.
    if (fromHolding.amount == ZERO_BI && fromHolding.historicalProvenanceRecords.length == 0) {
      store.remove('Holding', fromHolding.id.toHexString())
    }
  }

  if (to == ZERO_ADDRESS) {
    credit.currentSupply = credit.currentSupply.minus(amount)

    recordProvenance(hash, tokenAddress, tokenId, from, to, 'TRANSFER', amount, timestamp)

    credit.provenanceCount += 1
  } else {
    loadOrCreateAccount(to)
    let toHolding = loadOrCreateHolding(to, tokenAddress, tokenId)
    toHolding.amount = toHolding.amount.plus(amount)
    toHolding.lastUpdated = timestamp
    toHolding.save()

    // Exclude MCO2 retirements that are bridged back for one final burn to the zero address on mainnet
    if (from != ZERO_ADDRESS && tokenAddress != MCO2_ERC20_CONTRACT) {
      recordProvenance(hash, tokenAddress, tokenId, from, to, 'TRANSFER', amount, timestamp)

      credit.provenanceCount += 1
    }
  }

  // Update active credits list
  let ecosystem = loadOrCreateEcosystem()
  let activeIndex = ecosystem.activeCredits.indexOf(creditId)

  if (credit.currentSupply.plus(credit.crossChainSupply) > ZERO_BI && activeIndex == -1) {
    // Add to the list of active credits
    let activeCredits = ecosystem.activeCredits
    activeCredits.push(creditId)
    ecosystem.activeCredits = activeCredits
    ecosystem.save()
  } else if (credit.currentSupply.plus(credit.crossChainSupply) == ZERO_BI && activeIndex != -1) {
    // Remove from the list of active credits
    let activeCredits = ecosystem.activeCredits
    activeCredits.splice(activeIndex, 1)
    ecosystem.activeCredits = activeCredits
    ecosystem.save()
  }

  credit.save()

  // Also save supply changes for MCO2
  if (tokenAddress == MCO2_ERC20_CONTRACT && (to == ZERO_ADDRESS || from == ZERO_ADDRESS)) {
    checkForCarbonPoolSnapshot(tokenAddress, timestamp, blockNumber)
    checkForCarbonPoolCreditSnapshot(tokenAddress, tokenAddress, timestamp, blockNumber)

    let pool = loadOrCreateCarbonPool(tokenAddress)

    if (to == ZERO_ADDRESS) pool.supply = pool.supply.minus(amount)
    else pool.supply = pool.supply.plus(amount)

    pool.save()
  }
}
