import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { toDecimal } from '../../../lib/utils/Decimals'
import { KlimaRetire } from '../../generated/schema'

export function saveKlimaRetire(
  account: Address,
  retire: Bytes,
  index: BigInt,
  feeAmount: BigInt,
  specific: boolean
): KlimaRetire {
  let id = account.concatI32(index.toI32())
  let klimaRetire = KlimaRetire.load(id)
  if (klimaRetire == null) {
    klimaRetire = new KlimaRetire(id)
    klimaRetire.retire = retire
    klimaRetire.index = index
    klimaRetire.feeAmount = feeAmount
    klimaRetire.feeAmountTonnes = toDecimal(feeAmount)
    klimaRetire.specific = specific
    klimaRetire.save()
  }
  return klimaRetire as KlimaRetire
}

export function loadKlimaRetire(id: string): KlimaRetire | null {
  return KlimaRetire.load(Bytes.fromUTF8(id))
}
