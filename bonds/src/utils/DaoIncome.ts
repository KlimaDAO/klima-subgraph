import { BondV1 } from '../../generated/BCTBondV1/BondV1'
import { Address, BigDecimal, log } from '@graphprotocol/graph-ts'

export function getDaoIncome(bondAddress: string, payout : BigDecimal): BigDecimal {
    const bondContract = BondV1.bind(Address.fromString(bondAddress))
    const terms_call = bondContract.try_terms()
    
    let daoIncome = BigDecimal.fromString("0")
    if (terms_call.reverted === false) {

        const feePercentage = terms_call.value.value4.toBigDecimal().div(BigDecimal.fromString("100"))
        const feeDecimal = feePercentage.div(BigDecimal.fromString("100"))
        daoIncome = feeDecimal.times(payout)
    
        log.debug("Payout {} - Dao Income {} - Fee Percentage {}%",
        [payout.toString(), daoIncome.toString(), feePercentage.toString()])
    }


    return daoIncome
}
