import { AMOY_KLIMA_CARBON_RETIREMENTS_CONTRACT, KLIMA_CARBON_RETIREMENTS_CONTRACT } from '../../lib/utils/Constants'
import { Address } from '@graphprotocol/graph-ts'

export function getRetirementsContractAddress(network: string): Address {
  return network == 'matic' ? KLIMA_CARBON_RETIREMENTS_CONTRACT : AMOY_KLIMA_CARBON_RETIREMENTS_CONTRACT
}
