import { Bytes, BigInt } from '@graphprotocol/graph-ts'
import { Debug } from '../../generated/schema'

export function createDebug(functionName: string, error: string, blockNumber: BigInt, transactionHash: Bytes): void {
  let debug = new Debug(functionName)
  debug.functionName = functionName
  debug.error = error
  debug.blockNumber = blockNumber
  debug.transactionHash = transactionHash
  debug.save()
}
