import { KlimaRetire, DailyKlimaRetireSnapshot, Account } from '../generated/schema'
import { MossRetired } from '../generated/RetireMossCarbon/RetireMossCarbon'
import { ToucanRetired } from '../generated/RetireToucanCarbon/RetireToucanCarbon'
import { C3Retired } from '../generated/RetireC3Carbon/RetireC3Carbon'
import { CarbonRetired, CarbonRetired1 as CarbonRetiredTokenId } from '../generated/KlimaInfinity/KlimaInfinity'
import { KlimaCarbonRetirements } from '../generated/RetireC3Carbon/KlimaCarbonRetirements'
import { Address, BigInt, Bytes, dataSource, ethereum, log } from '@graphprotocol/graph-ts'
import { CarbonMetricUtils } from './utils/CarbonMetrics'
import { PoolTokenFactory } from './utils/pool_token/PoolTokenFactory'
import { loadOrCreateAccount } from './utils/Account'
import { loadRetire } from './utils/Retire'
import { loadOrCreateDailyKlimaRetireSnapshot } from './utils/DailyKlimaRetireSnapshot'
import { dayTimestamp as dayTimestampString } from '../../lib/utils/Dates'
import { ZERO_ADDRESS } from '../../lib/utils/Constants'
import { saveKlimaRetire } from './utils/KlimaRetire'
import { ZERO_BI } from '../../lib/utils/Decimals'
import { getRetirementsContractAddress } from '../utils/helpers'
import { SubgraphVersion } from '../generated/schema'
import { PUBLISHED_VERSION, SCHEMA_VERSION } from '../utils/version'

function processRetirement(
  sender: Account,
  beneficiary: Account,
  beneficiaryAddress: Address,
  beneficiaryName: string,
  retiringAddress: Address,
  retirementMessage: string,
  carbonPool: Address,
  retiredAmount: BigInt,
  timestamp: BigInt
): void {
  let retireId = sender.id.concatI32(sender.totalRetirements - 1)

  let retire = loadRetire(retireId)

  // Update the retire entity
  if (carbonPool != ZERO_ADDRESS) retire.pool = carbonPool
  retire.source = 'KLIMA'
  retire.beneficiaryAddress = beneficiaryAddress
  retire.beneficiaryName = beneficiaryName
  retire.retiringAddress = retiringAddress
  retire.retirementMessage = retirementMessage
  retire.save()

  const klimaRetire = saveKlimaRetire(
    beneficiaryAddress,
    retire.id,
    beneficiary.klimaRetirementsIndex,
    retiredAmount.div(BigInt.fromI32(100)), // hard-coded 1% fee
    false
  )

  // increment the klima retirements index for beneficiary
  beneficiary.klimaRetirementsIndex = beneficiary.klimaRetirementsIndex.plus(BigInt.fromI32(1))
  beneficiary.save()

  // Generate daily retirement data if needed
  if (klimaRetire !== null) {
    const dailyRetirement = generateDailyKlimaRetirement(klimaRetire)
    if (dailyRetirement !== null) {
      dailyRetirement.save()
    }
  }

  // Update protocol metrics if needed
  if (retire.pool !== null && Address.fromBytes(retire.pool as Bytes) != ZERO_ADDRESS) {
    updateKlimaRetirementProtocolMetrics(retire.pool as Bytes, timestamp, retiredAmount)
  }
}

export function handleMossRetired(event: MossRetired): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return

  let sender = loadOrCreateAccount(event.transaction.from)
  let beneficiary = loadOrCreateAccount(event.params.beneficiaryAddress)
  loadOrCreateAccount(event.params.retiringAddress)

  processRetirement(
    sender,
    beneficiary,
    event.params.beneficiaryAddress,
    event.params.beneficiaryString,
    event.params.retiringAddress,
    event.params.retirementMessage,
    event.params.carbonPool,
    event.params.retiredAmount,
    event.block.timestamp
  )
}

export function handleToucanRetired(event: ToucanRetired): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return

  let sender = loadOrCreateAccount(event.transaction.from)
  let beneficiary = loadOrCreateAccount(event.params.beneficiaryAddress)
  loadOrCreateAccount(event.params.retiringAddress)

  processRetirement(
    sender,
    beneficiary,
    event.params.beneficiaryAddress,
    event.params.beneficiaryString,
    event.params.retiringAddress,
    event.params.retirementMessage,
    event.params.carbonPool,
    event.params.retiredAmount,
    event.block.timestamp
  )
}

export function handleC3Retired(event: C3Retired): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return

  let sender = loadOrCreateAccount(event.transaction.from)
  let beneficiary = loadOrCreateAccount(event.params.beneficiaryAddress)
  loadOrCreateAccount(event.params.retiringAddress)

  processRetirement(
    sender,
    beneficiary,
    event.params.beneficiaryAddress,
    event.params.beneficiaryString,
    event.params.retiringAddress,
    event.params.retirementMessage,
    event.params.carbonPool,
    event.params.retiredAmount,
    event.block.timestamp
  )
}

export function handleCarbonRetired(event: CarbonRetired): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return

  let sender = loadOrCreateAccount(event.transaction.from)
  let beneficiary = loadOrCreateAccount(event.params.beneficiaryAddress)
  loadOrCreateAccount(event.params.retiringAddress)

  processRetirement(
    sender,
    beneficiary,
    event.params.beneficiaryAddress,
    event.params.beneficiaryString,
    event.params.retiringAddress,
    event.params.retirementMessage,
    event.params.carbonPool,
    event.params.retiredAmount,
    event.block.timestamp
  )
}

export function handleCarbonRetiredWithTokenId(event: CarbonRetiredTokenId): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return

  let sender = loadOrCreateAccount(event.transaction.from)
  let beneficiary = loadOrCreateAccount(event.params.beneficiaryAddress)
  loadOrCreateAccount(event.params.retiringAddress)

  processRetirement(
    sender,
    beneficiary,
    event.params.beneficiaryAddress,
    event.params.beneficiaryString,
    event.params.retiringAddress,
    event.params.retirementMessage,
    event.params.carbonPool,
    event.params.retiredAmount,
    event.block.timestamp
  )
}

function generateDailyKlimaRetirement(klimaRetire: KlimaRetire): DailyKlimaRetireSnapshot | null {
  const retire = loadRetire(klimaRetire.retire)
  const dayTimestamp = dayTimestampString(retire.timestamp)
  const id = dayTimestamp + retire.credit.toHexString()

  if (retire.pool !== null) {
    const dailyKlimaRetirement = loadOrCreateDailyKlimaRetireSnapshot(id)
    dailyKlimaRetirement.amount = dailyKlimaRetirement.amount.plus(retire.amountTonnes)
    dailyKlimaRetirement.feeAmount = dailyKlimaRetirement.feeAmount.plus(klimaRetire.feeAmountTonnes)
    dailyKlimaRetirement.credit = retire.credit
    dailyKlimaRetirement.pool = retire.pool as Bytes
    dailyKlimaRetirement.timestamp = BigInt.fromString(dayTimestamp)

    return dailyKlimaRetirement
  }

  return null
}

function updateKlimaRetirementProtocolMetrics(pool: Bytes, timestamp: BigInt, retiredAmount: BigInt): void {
  const token = new PoolTokenFactory().getTokenForAddress(Address.fromBytes(pool))
  CarbonMetricUtils.updateKlimaRetirements(token, timestamp, retiredAmount)
}

export function handleSetSubgraphVersion(block: ethereum.Block): void {
  let version = new SubgraphVersion('polygon-digital-carbon')
  version.schemaVersion = SCHEMA_VERSION
  version.publishedVersion = PUBLISHED_VERSION
  version.save()
}
