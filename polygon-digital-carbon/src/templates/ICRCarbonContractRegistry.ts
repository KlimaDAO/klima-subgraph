import { ICRProjectToken } from '../../generated/templates'
import { ProjectCreated } from '../../generated/ICRCarbonContractRegistry/ICRCarbonContractRegistry'
import { log } from '@graphprotocol/graph-ts'

export function handleNewICC(event: ProjectCreated): void {
  // Start indexing the C3T tokens; `event.params.tokenAddress` is the
  // address of the new token contract

  ICRProjectToken.create(event.params.projectAddress)

  log.info('Created new ICR Project Datasource', [])
}
