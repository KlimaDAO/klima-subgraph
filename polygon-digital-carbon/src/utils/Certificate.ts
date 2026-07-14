import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { RetirementCertificate } from '../../generated/schema'
import { ZERO_BI } from '../../../lib/utils/Decimals'
import { CERTIFICATE_MINTED_TOPIC0, RETIRED_1_4_0_TOPIC0, RETIRED_LEGACY_TOPIC0 } from './Constants'

function decodeCertificateTokenId(txLog: ethereum.Log): BigInt {
  let decoded = ethereum.decode('uint256', txLog.data)
  return decoded ? decoded.toBigInt() : ZERO_BI
}

// ASYNC PURO PATH: Scan a transaction receipt BACKWARDS for the nearest Toucan CertificateMinted log emitted before `logIndex`
// Used for the async path where the certificate is minted immediately BEFORE RetirementFinalized.
export function findMintedCertificateIdBefore(receipt: ethereum.TransactionReceipt | null, logIndex: BigInt): BigInt {
  if (receipt == null) return ZERO_BI

  let logs = receipt.logs
  for (let i = logs.length - 1; i >= 0; i--) {
    let txLog = logs[i]
    if (txLog.logIndex.ge(logIndex)) continue // only logs before the boundary
    if (txLog.topics.length > 0 && txLog.topics[0].equals(CERTIFICATE_MINTED_TOPIC0)) {
      return decodeCertificateTokenId(txLog)
    }
  }
  return ZERO_BI
}

// SYNC PATH: Scan a transaction receipt FORWARD for the nearest Toucan CertificateMinted log emitted after `logIndex`.
// Used for the synchronous path, where retireAndMintCertificate emits Retired first and CertificateMinted right after.
// The scan stops AT THE NEXT Retired event so a retirement that minted no certificate cannot claim one belonging to a later retirement in the same transaction.
export function findMintedCertificateIdAfter(receipt: ethereum.TransactionReceipt | null, logIndex: BigInt): BigInt {
  if (receipt == null) return ZERO_BI

  let logs = receipt.logs
  for (let i = 0; i < logs.length; i++) {
    let txLog = logs[i]
    if (txLog.logIndex.le(logIndex)) continue // only logs after the boundary
    if (txLog.topics.length == 0) continue
    let topic0 = txLog.topics[0]
    if (topic0.equals(CERTIFICATE_MINTED_TOPIC0)) {
      return decodeCertificateTokenId(txLog)
    }
    if (topic0.equals(RETIRED_1_4_0_TOPIC0) || topic0.equals(RETIRED_LEGACY_TOPIC0)) {
      return ZERO_BI // next retirement began without this one minting a certificate
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
