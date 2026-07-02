import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { RetirementCertificate } from '../../generated/schema'
import { ZERO_BI } from '../../../lib/utils/Decimals'

const CERTIFICATE_MINTED_TOPIC0 = Bytes.fromHexString(
  '0x54b249c3cd4a5f80e81d2ad036b251d58d8f5482a926f25d12eabec192cf1ecd'
)

// Scan a transaction receipt for the Toucan CertificateMinted log and decode its non-indexed
// uint256 tokenId. Returns ZERO_BI when no certificate was minted or the receipt is unavailable.
export function findMintedCertificateId(
  receipt: ethereum.TransactionReceipt | null,
  maxLogIndex: BigInt | null
): BigInt {
  if (receipt == null) return ZERO_BI

  let logs = receipt.logs
  for (let i = logs.length - 1; i >= 0; i--) {
    let txLog = logs[i]
    if (maxLogIndex !== null && txLog.logIndex.ge(maxLogIndex as BigInt)) continue // only logs before the boundary
    if (txLog.topics.length > 0 && txLog.topics[0].equals(CERTIFICATE_MINTED_TOPIC0)) {
      let decoded = ethereum.decode('uint256', txLog.data)
      if (decoded) return decoded.toBigInt()
    }
  }
  return ZERO_BI
}

// Record the minted certificate id in an entity keyed by the parent Retire id
export function saveRetirementCertificate(retireId: Bytes, retirementTokenId: BigInt): void {
  if (RetirementCertificate.load(retireId) != null) return

  let certificate = new RetirementCertificate(retireId)
  certificate.retire = retireId
  certificate.retirementTokenId = retirementTokenId
  certificate.save()
}
