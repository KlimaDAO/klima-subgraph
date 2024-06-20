import { BigInt } from '@graphprotocol/graph-ts'
import { C3OffsetRequest } from '../../generated/schema'

export function loadOrCreateC3OffsetBridgeRequest(requestId: string): C3OffsetRequest {
  let request = C3OffsetRequest.load(requestId)

  if (request == null) {
    request = new C3OffsetRequest(requestId)
    request.status = 'AWAITING'
    request.index = BigInt.fromI32(0)
    request.c3OffsetNftIndex = BigInt.fromI32(0)
    request.tokenURI = ''
    request.save()
  }

  return request
}

export function loadC3OffsetBridgeRequest(requestId: string): C3OffsetRequest | null {
  let request = C3OffsetRequest.load(requestId)
  return request
}
