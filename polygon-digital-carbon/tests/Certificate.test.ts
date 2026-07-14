import { describe, test, assert } from 'matchstick-as'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { findMintedCertificateIdAfter, findMintedCertificateIdBefore } from '../src/utils/Certificate'
import { CERTIFICATE_MINTED_TOPIC0, RETIRED_1_4_0_TOPIC0 } from '../src/utils/Constants'

function makeLog(logIndex: i32, topic0: Bytes, tokenId: i32): ethereum.Log {
  let data =
    tokenId > 0
      ? ethereum.encode(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenId)))!
      : Bytes.empty()

  return new ethereum.Log(
    Address.zero(),
    [topic0],
    data,
    Bytes.empty(),
    Bytes.empty(),
    Bytes.empty(),
    BigInt.zero(),
    BigInt.fromI32(logIndex),
    BigInt.zero(),
    '',
    null
  )
}

function makeReceipt(logs: Array<ethereum.Log>): ethereum.TransactionReceipt {
  return new ethereum.TransactionReceipt(
    Bytes.empty(),
    BigInt.zero(),
    Bytes.empty(),
    BigInt.zero(),
    BigInt.zero(),
    BigInt.zero(),
    Address.zero(),
    logs,
    BigInt.fromI32(1),
    Bytes.empty(),
    Bytes.empty()
  )
}

// Mirrors tx 0xbd936f0b...c1c0d: several TCO2 retirements in one tx, each
// emitting Retired followed by its own CertificateMinted.
function multiRetireReceipt(): ethereum.TransactionReceipt {
  return makeReceipt([
    makeLog(10, RETIRED_1_4_0_TOPIC0, 0),
    makeLog(12, CERTIFICATE_MINTED_TOPIC0, 45589),
    makeLog(20, RETIRED_1_4_0_TOPIC0, 0),
    makeLog(22, CERTIFICATE_MINTED_TOPIC0, 45591),
  ])
}

describe('Toucan certificate walkback', () => {
  test('each Retired event resolves to its own certificate, not the last one in the tx', () => {
    assert.bigIntEquals(BigInt.fromI32(45589), findMintedCertificateIdAfter(multiRetireReceipt(), BigInt.fromI32(10)))
    assert.bigIntEquals(BigInt.fromI32(45591), findMintedCertificateIdAfter(multiRetireReceipt(), BigInt.fromI32(20)))
  })

  test('a retirement without a certificate does not claim a later retirement certificate', () => {
    let receipt = makeReceipt([
      makeLog(10, RETIRED_1_4_0_TOPIC0, 0),
      makeLog(20, RETIRED_1_4_0_TOPIC0, 0),
      makeLog(22, CERTIFICATE_MINTED_TOPIC0, 45591),
    ])

    assert.bigIntEquals(BigInt.zero(), findMintedCertificateIdAfter(receipt, BigInt.fromI32(10)))
    assert.bigIntEquals(BigInt.fromI32(45591), findMintedCertificateIdAfter(receipt, BigInt.fromI32(20)))
  })

  test('returns zero when no certificate was minted or the receipt is unavailable', () => {
    let receipt = makeReceipt([makeLog(10, RETIRED_1_4_0_TOPIC0, 0)])

    assert.bigIntEquals(BigInt.zero(), findMintedCertificateIdAfter(receipt, BigInt.fromI32(10)))
    assert.bigIntEquals(BigInt.zero(), findMintedCertificateIdAfter(null, BigInt.fromI32(10)))
    assert.bigIntEquals(BigInt.zero(), findMintedCertificateIdBefore(null, BigInt.fromI32(10)))
  })

  test('the async Puro path finds the nearest certificate minted before the boundary', () => {
    // CertificateMinted precedes RetirementFinalized (the boundary) in Puro finalization
    assert.bigIntEquals(BigInt.fromI32(45589), findMintedCertificateIdBefore(multiRetireReceipt(), BigInt.fromI32(13)))
    assert.bigIntEquals(BigInt.fromI32(45591), findMintedCertificateIdBefore(multiRetireReceipt(), BigInt.fromI32(23)))
  })
})
