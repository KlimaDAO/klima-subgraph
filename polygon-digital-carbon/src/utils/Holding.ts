import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Holding } from '../../generated/schema'
import { ZERO_BI } from '../../../lib/utils/Decimals'

export function loadOrCreateHolding(account: Address, token: Address, tokenId: BigInt | null): Holding {
  let id = tokenId !== null ? account.concat(token).concatI32(tokenId.toI32()) : account.concat(token)

  let holding = Holding.load(id)
  if (holding) return holding as Holding

  holding = new Holding(id)
  holding.account = account
  holding.token = token
  holding.tokenId = tokenId
  holding.amount = ZERO_BI
  holding.activeProvenanceRecords = []
  holding.historicalProvenanceRecords = []
  holding.lastUpdated = ZERO_BI
  holding.save()
  return holding as Holding
}
