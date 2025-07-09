import { ICRProjectContract } from '../../generated/templates'
import { ProjectCreated } from '../../generated/ICRCarbonContractRegistry/ICRCarbonContractRegistry'
import { log } from '@graphprotocol/graph-ts'
import { ICRProjectIntermediate } from '../../generated/schema'

export function handleNewICC(event: ProjectCreated): void {
  // Start indexing the C3T tokens; `event.params.tokenAddress` is the
  // address of the new token contract

  ICRProjectContract.create(event.params.projectAddress)

  let project = ICRProjectIntermediate.load(event.params.projectAddress)

  if (project == null) {
    project = new ICRProjectIntermediate(event.params.projectAddress)
  }

  project.projectName = event.params.projectName
  project.save()

  log.info('Created new ICR Project Datasource', [])
}
