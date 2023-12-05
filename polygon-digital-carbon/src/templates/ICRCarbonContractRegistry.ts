import { ICRProjectToken } from '../../generated/templates'
import { ICRProjectToken as TokenCall } from '../../generated/templates/ICRProjectToken/ICRProjectToken'
import { ProjectCreated } from '../../generated/ICRCarbonContractRegistry/ICRCarbonContractRegistry'
import { loadOrCreateCarbonCredit } from '../utils/CarbonCredit'
import { loadOrCreateCarbonProject } from '../utils/CarbonProject'
import { MethodologyCategories } from '../utils/MethodologyCategories'
import { Address, BigInt, log } from '@graphprotocol/graph-ts'

export function handleNewICC(event: ProjectCreated): void {
  // Start indexing the C3T tokens; `event.params.tokenAddress` is the
  // address of the new token contract

  ICRProjectToken.create(event.params.projectAddress)

  let project = loadOrCreateCarbonProject('ICR', event.params.projectId.toString())
  // let projectCall = TokenCall.bind(event.params.projectAddress)

  project.name = event.params.projectName
  //   project.methodologies = projectCall.methodology()
  //   project.category = MethodologyCategories.getMethodologyCategory(project.methodologies)
  project.save()

  // Load a default credit with ID 0 for future use
  let credit = loadOrCreateCarbonCredit(event.params.projectAddress, 'ICR', BigInt.fromI32(0))
  credit.project = project.id

  log.info('Created new ICR Project Datasource', [])
  credit.save()
}
