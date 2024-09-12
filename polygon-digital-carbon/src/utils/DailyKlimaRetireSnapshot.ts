import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { DailyKlimaRetireSnapshot } from '../../generated/schema'

export function loadOrCreateDailyKlimaRetireSnapshot(id: string): DailyKlimaRetireSnapshot {
  let retire = DailyKlimaRetireSnapshot.load(id)
  if (retire == null) {
    retire = new DailyKlimaRetireSnapshot(id)
    retire.timestamp = BigInt.zero()
    retire.pool = ""
    retire.credit = new Bytes()
    retire.amount = BigDecimal.fromString('0')
    retire.feeAmount = BigDecimal.fromString('0')
  }

  return retire as DailyKlimaRetireSnapshot
}
