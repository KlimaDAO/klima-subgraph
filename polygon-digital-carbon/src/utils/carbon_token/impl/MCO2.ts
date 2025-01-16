import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { toDecimal } from '../../../../../lib/utils/Decimals'
import { CarbonMetric, CarbonPoolCreditBalanceLoader } from '../../../../generated/schema'
import { ICarbonToken } from '../ICarbonToken'

export class MCO2 implements ICarbonToken {
  getDecimals(): number {
    return 18
  }

  returnUpdatedRetirementMetrics(carbonMetrics: CarbonMetric, amount: BigInt): CarbonMetric {
    const amountTonnes = toDecimal(amount, this.getDecimals())
    carbonMetrics.mco2Retired = carbonMetrics.mco2Retired.plus(amountTonnes)
    carbonMetrics.totalRetirements = carbonMetrics.totalRetirements.plus(amountTonnes)

    return carbonMetrics
  }
}
