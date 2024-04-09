import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { loadCarbonCredit } from './CarbonCredit'
import { CarbonCreditSnapshot, CarbonProject, Epoch } from '../../generated/schema'
import { ICR_MIGRATION_BLOCK, MCO2_ERC20_CONTRACT } from '../../../lib/utils/Constants'
import { BIG_INT_1E18 } from '../../../lib/utils/Decimals'

export function recordCarbonCreditSnapshot(
  creditId: Bytes,
  epochNumber: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt,
  epoch: Epoch
): Epoch {
  let credit = loadCarbonCredit(creditId)
  let project = CarbonProject.load(credit.project)

  let snapshot = new CarbonCreditSnapshot(creditId.concatI32(epochNumber.toI32()))
  snapshot.credit = creditId
  snapshot.epoch = epochNumber
  snapshot.currentSupply = credit.currentSupply
  snapshot.bridged = credit.bridged
  snapshot.retired = credit.retired
  snapshot.crossChainSupply = credit.crossChainSupply
  snapshot.createdAt = timestamp
  snapshot.save()

  if (credit.tokenAddress != MCO2_ERC20_CONTRACT) {
    // Account for the decimal change when new tokens were minted to created decimals
    if (project != null) {
      if (project.registry == 'ICR' && blockNumber < ICR_MIGRATION_BLOCK) {
        epoch.creditSupply = epoch.creditSupply.plus(
          credit.currentSupply.plus(credit.crossChainSupply).times(BIG_INT_1E18)
        )
      } else {
        epoch.creditSupply = epoch.creditSupply.plus(credit.currentSupply).plus(credit.crossChainSupply)
      }
    }
    epoch.save()
  }
  return epoch
}
