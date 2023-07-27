import { BatchMinted, BatchUpdated, Transfer } from '../generated/ToucanCarbonOffsetBatch/ToucanCarbonOffsetBatches'
import { CarbonOffset } from '../generated/schema'
import { loadOrCreateToucanBatch } from './utils/ToucanBatch'

export function handleBatchMinted(event: BatchMinted): void {
  let batch = loadOrCreateToucanBatch(event.params.tokenId)
  batch.creationTransactionHash = event.transaction.hash
  batch.save()
}

export function handleBatchUpdated(event: BatchUpdated): void {
  let batch = loadOrCreateToucanBatch(event.params.tokenId)
  let serials = event.params.serialNumber.split(',')
  batch.registrySerialNumbers = serials
  batch.save()
}

export function handleBatchTransfer(event: Transfer): void {
  let offset = CarbonOffset.load(event.params.to)
  if (offset == null) return

  offset.lastBatchId = event.params.tokenId
  offset.save()
}
