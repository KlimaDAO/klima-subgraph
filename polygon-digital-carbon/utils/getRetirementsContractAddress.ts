import { AMOY_KLIMA_CARBON_RETIREMENTS_CONTRACT, KLIMA_CARBON_RETIREMENTS_CONTRACT } from '../../lib/utils/Constants'
import { Address, Bytes, ByteArray, BigInt } from '@graphprotocol/graph-ts'

export function getRetirementsContractAddress(network: string): Address {
  return network == 'matic' ? KLIMA_CARBON_RETIREMENTS_CONTRACT : AMOY_KLIMA_CARBON_RETIREMENTS_CONTRACT
}

export function getC3OffsetRequestId(fromToken: Address, beneficiaryAddress: Address, index: BigInt): string {
  return fromToken.toHexString() + '-' + beneficiaryAddress.toHexString() + '-' + index.toString()
}
