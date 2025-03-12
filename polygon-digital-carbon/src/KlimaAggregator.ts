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

class ChunkParams {
  start: i32
  end: i32
  CHUNK_SIZE: i32
}

function getChunkParams(sender: Account, diff: i32): ChunkParams {
  let params = new ChunkParams()
  params.CHUNK_SIZE = 100
  params.start = sender.totalRetirements - diff
  params.end = sender.totalRetirements
  return params
}

function getOnchainRetirementIndex(beneficiaryAddress: Address): BigInt {
  let network = dataSource.network()
  let retirementsContractAddress = getRetirementsContractAddress(network)
  let klimaRetirements = KlimaCarbonRetirements.bind(retirementsContractAddress)
  let index = klimaRetirements.retirements(beneficiaryAddress).value0.minus(BigInt.fromI32(1))
  return index
}

function processRetirement(
  sender: Account,
  iterationCount: i32,
  diff: i32,
  retirementIndex: i32,
  beneficiaryAddress: Address,
  beneficiaryName: string,
  retiringAddress: Address,
  retirementMessage: string,
  carbonPool: Address,
  retiredAmount: BigInt,
  timestamp: BigInt
): void {
  let retireId = sender.id.concatI32((sender.totalRetirements - diff) + iterationCount)
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
    BigInt.fromI32(retirementIndex),
    retiredAmount.div(BigInt.fromI32(100)), // hard-coded 1% fee
    false
  )

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

function processRetirementChunk(
  sender: Account,
  onchainIndex: BigInt,
  retirementStartIndex: i32,
  retirementEndIndex: i32,
  diff: i32,
  beneficiaryAddress: Address,
  beneficiaryName: string,
  retiringAddress: Address,
  retirementMessage: string,
  carbonPool: Address,
  retiredAmount: BigInt,
  timestamp: BigInt
): void {
  let iterationCount = 0

  for (let i = retirementStartIndex; i < retirementEndIndex; i++) {
    /** subtract diff amount from onchain index. However need to account for the increment so we subtract diff - 1 
     *  and then add the iteration count
    */
    const retirementIndex = onchainIndex.minus(BigInt.fromI32(diff - 1)).plus(BigInt.fromI32(iterationCount)).toI32()
    log.info('retirementIndex: {}', [retirementIndex.toString()])
    processRetirement(
      sender,
      iterationCount,
      diff,
      retirementIndex,
      beneficiaryAddress,
      beneficiaryName,
      retiringAddress,
      retirementMessage,
      carbonPool,
      retiredAmount,
      timestamp
    )

    iterationCount++
  }
}

export function handleMossRetired(event: MossRetired): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return
  let network = dataSource.network()

  let retirementsContractAddress = getRetirementsContractAddress(network)

  let klimaRetirements = KlimaCarbonRetirements.bind(retirementsContractAddress)
  let index = klimaRetirements.retirements(event.params.beneficiaryAddress).value0.minus(BigInt.fromI32(1))

  let sender = loadOrCreateAccount(event.transaction.from)
  loadOrCreateAccount(event.params.beneficiaryAddress)
  loadOrCreateAccount(event.params.retiringAddress)

  let retire = loadRetire(sender.id.concatI32(sender.totalRetirements - 1))

  if (event.params.carbonPool != ZERO_ADDRESS) retire.pool = event.params.carbonPool

  retire.source = 'KLIMA'
  retire.beneficiaryAddress = event.params.beneficiaryAddress
  retire.beneficiaryName = event.params.beneficiaryString
  retire.retiringAddress = event.params.retiringAddress
  retire.retirementMessage = event.params.retirementMessage

  retire.save()

  saveKlimaRetire(
    event.params.beneficiaryAddress,
    retire.id,
    index,
    event.params.retiredAmount.div(BigInt.fromI32(100)),
    false
  )
}

export function handleToucanRetired(event: ToucanRetired): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return
  let network = dataSource.network()

  let retirementsContractAddress = getRetirementsContractAddress(network)
  let klimaRetirements = KlimaCarbonRetirements.bind(retirementsContractAddress)

  let index = klimaRetirements.retirements(event.params.beneficiaryAddress).value0.minus(BigInt.fromI32(1))

  let sender = loadOrCreateAccount(event.transaction.from)
  loadOrCreateAccount(event.params.beneficiaryAddress)
  loadOrCreateAccount(event.params.retiringAddress)

  let retire = loadRetire(sender.id.concatI32(sender.totalRetirements - 1))

  if (event.params.carbonPool != ZERO_ADDRESS) retire.pool = event.params.carbonPool

  retire.source = 'KLIMA'
  retire.beneficiaryAddress = event.params.beneficiaryAddress
  retire.beneficiaryName = event.params.beneficiaryString
  retire.retiringAddress = event.params.retiringAddress
  retire.retirementMessage = event.params.retirementMessage
  retire.save()

  saveKlimaRetire(
    event.params.beneficiaryAddress,
    retire.id,
    index,
    event.params.retiredAmount.div(BigInt.fromI32(100)),
    false
  )
}

export function handleC3Retired(event: C3Retired): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return

  let network = dataSource.network()
  let retirementsContractAddress = getRetirementsContractAddress(network)

  let klimaRetirements = KlimaCarbonRetirements.bind(retirementsContractAddress)
  let index = klimaRetirements.retirements(event.params.beneficiaryAddress).value0.minus(BigInt.fromI32(1))

  let sender = loadOrCreateAccount(event.transaction.from)
  loadOrCreateAccount(event.params.retiringAddress)
  loadOrCreateAccount(event.params.beneficiaryAddress)

  let retire = loadRetire(sender.id.concatI32(sender.totalRetirements - 1))

  if (event.params.carbonPool != ZERO_ADDRESS) retire.pool = event.params.carbonPool

  retire.source = 'KLIMA'
  retire.beneficiaryAddress = event.params.beneficiaryAddress
  retire.beneficiaryName = event.params.beneficiaryString
  retire.retiringAddress = event.params.retiringAddress
  retire.retirementMessage = event.params.retirementMessage
  retire.save()

  const klimaRetire = saveKlimaRetire(
    event.params.beneficiaryAddress,
    retire.id,
    index,
    event.params.retiredAmount.div(BigInt.fromI32(100)),
    false
  )
}

export function handleCarbonRetired(event: CarbonRetired): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return

  let sender = loadOrCreateAccount(event.transaction.from)
  loadOrCreateAccount(event.params.retiringAddress)
  let beneficiary = loadOrCreateAccount(event.params.beneficiaryAddress)

  // need to include the index here as we need to get the diff between the stored local retirement index  and onchain
  //  and go back that from the total retirements to get the correct index to start from
  let index = getOnchainRetirementIndex(Address.fromBytes(beneficiary.id))
  let diff = sender.totalRetirements - sender.previousTotalRetirements

  log.info('sender.totalRetirements: {}', [sender.totalRetirements.toString()])
  log.info('index: {}', [index.toString()])
  log.info('diff: {}', [diff.toString()])

  const params = getChunkParams(sender, diff)

  log.info('params.start: {}', [params.start.toString()])
  log.info('params.end: {}', [params.end.toString()])

  for (let chunkStart: i32 = params.start; chunkStart < params.end; chunkStart += params.CHUNK_SIZE) {
    let chunkEnd: i32 = Math.min(chunkStart + params.CHUNK_SIZE, params.end) as i32
    processRetirementChunk(
      sender,
      index,
      chunkStart,
      chunkEnd,
      diff,
      event.params.beneficiaryAddress,
      event.params.beneficiaryString,
      event.params.retiringAddress,
      event.params.retirementMessage,
      event.params.carbonPool,
      event.params.retiredAmount,
      event.block.timestamp
    )
  }

  sender.previousTotalRetirements = sender.totalRetirements
  sender.save()
}

export function handleCarbonRetiredWithTokenId(event: CarbonRetiredTokenId): void {
  // Ignore zero value retirements
  if (event.params.retiredAmount == ZERO_BI) return
  let network = dataSource.network()

  let retirementsContractAddress = getRetirementsContractAddress(network)
  let klimaRetirements = KlimaCarbonRetirements.bind(retirementsContractAddress)
  let index = klimaRetirements.retirements(event.params.beneficiaryAddress).value0.minus(BigInt.fromI32(1))

  let sender = loadOrCreateAccount(event.transaction.from)
  loadOrCreateAccount(event.params.retiringAddress)
  loadOrCreateAccount(event.params.beneficiaryAddress)

  let retire = loadRetire(sender.id.concatI32(sender.totalRetirements - 1))

  if (event.params.carbonPool != ZERO_ADDRESS) retire.pool = event.params.carbonPool

  retire.source = 'KLIMA'
  retire.beneficiaryAddress = event.params.beneficiaryAddress
  retire.beneficiaryName = event.params.beneficiaryString
  retire.retiringAddress = event.params.retiringAddress
  retire.retirementMessage = event.params.retirementMessage
  retire.save()

  const klimaRetire = saveKlimaRetire(
    event.params.beneficiaryAddress,
    retire.id,
    index,
    event.params.retiredAmount.div(BigInt.fromI32(100)), // hard-coded 1% fee
    false
  )

  if (klimaRetire !== null) {
    const dailyRetirement = generateDailyKlimaRetirement(klimaRetire)
    if (dailyRetirement !== null) {
      dailyRetirement.save()
    }
  }

  if (retire.pool !== null && Address.fromBytes(retire.pool as Bytes) != ZERO_ADDRESS) {
    updateKlimaRetirementProtocolMetrics(retire.pool as Bytes, event.block.timestamp, event.params.retiredAmount)
  }
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
