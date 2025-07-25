import { log, BigInt } from '@graphprotocol/graph-ts'
import { CreditAdded as CreditAddedEvent } from '../generated/CreditManager/CreditManager'
import { Project, ProjectByToken } from '../generated/schema'
import { createCategory, createCountry } from './Entities'

export function handleCreditAdded(event: CreditAddedEvent): void {
  log.info('handleCreditAdded fired {}-{}', [event.params.tokenAddress.toHexString(), event.params.tokenId.toString()])

  const registry = event.params.projectId.split('-')[0]

  const id = event.params.projectId + '-' + event.params.vintage
  let project = new Project(id)
  project.key = event.params.projectId
  project.name = event.params.name
  project.methodology = event.params.methodologies[0]
  project.isExAnte = event.params.isExAnte
  project.vintage = BigInt.fromString(event.params.vintage)
  project.projectAddress = event.params.tokenAddress
  project.registry = registry
  project.tokenId = event.params.tokenId
  project.category = event.params.category
  project.country = event.params.country
  project.creditDataSource = 'Event'
  project.save()

  let lookupId = event.params.tokenAddress.toHexString().toLowerCase() + '-' + event.params.tokenId.toString()

  let pbt = new ProjectByToken(lookupId)
  pbt.project = project.id
  pbt.save()

  createCountry(project.country)
  createCategory(project.category)
}
