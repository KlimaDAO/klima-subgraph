import { ICRProjectToken } from '../../generated/templates'
import { ProjectCreated } from '../../generated/ICRCarbonContractRegistry/ICRCarbonContractRegistry'
import { loadOrCreateCarbonCredit } from '../utils/CarbonCredit'
import { loadOrCreateCarbonProject } from '../utils/CarbonProject'
import { BigInt, log } from '@graphprotocol/graph-ts'

export function handleNewICC(event: ProjectCreated): void {
  // Start indexing the C3T tokens; `event.params.tokenAddress` is the
  // address of the new token contract

  const projectAddress = event.params.projectAddress

  ICRProjectToken.create(projectAddress)

  let project = loadOrCreateCarbonProject('ICR', event.params.projectId.toString(), projectAddress.toHexString())

  // Load a default credit with ID 0 for future use
  let credit = loadOrCreateCarbonCredit(projectAddress, 'ICR', BigInt.fromI32(0))
  credit.project = project.id

  log.info('Created new ICR Project Datasource', [])
  credit.save()
}
