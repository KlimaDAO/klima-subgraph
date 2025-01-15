import { Transfer } from '../../generated/BCT/ERC20'
import { handleCreditTransfer } from '../TransferHandler'
import { Retired } from '../../generated/CarbonmarkCreditTokenFactory/CarbonmarkCreditToken'
import { ZERO_BI } from '../../../lib/utils/Decimals'
import { loadCarbonCredit } from '../utils/CarbonCredit'
import { incrementAccountRetirements, loadOrCreateAccount } from '../utils/Account'
import { saveRetire } from '../utils/Retire'
import { ZERO_ADDRESS } from '../../../lib/utils/Constants'
import { log } from 'matchstick-as'


export function handleCarbonmarkCreditTransfer(event: Transfer): void {
  return handleCreditTransfer(event)  
}


export function handleCarbonmarkCreditRetirement(event: Retired): void {
  // Don't process zero amount events
  if (event.params.amount == ZERO_BI) return

  let credit = loadCarbonCredit(event.params.creditId)

  credit.retired = credit.retired.plus(event.params.amount)
  credit.save()

  // Ensure account entities are created for all addresses
  let sender = loadOrCreateAccount(event.transaction.from)
  let senderAddress = event.transaction.from
  loadOrCreateAccount(event.params.beneficiary) // Beneficiary address

  saveRetire(
    sender.id.concatI32(sender.totalRetirements),
    credit.id,
    credit.tokenAddress,
    ZERO_ADDRESS,
    'OTHER',
    event.params.amount,
    event.params.beneficiary,
    event.params.beneficiaryName,
    senderAddress,
    '',
    event.block.timestamp,
    event.transaction.hash,
    null,
    event.params.message
  )

  incrementAccountRetirements(senderAddress)
}