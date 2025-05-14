import { log, Address, BigInt, store } from '@graphprotocol/graph-ts'
import {
  CreditAdded as CreditAddedEvent,
} from '../generated/CreditManager/CreditManager'
import { Project } from '../generated/schema'
import { createCategory, createCountry } from './Entities'

export function handleCreditAdded(event: CreditAddedEvent): void {
  log.info('handleProjectAdded fired {}', [event.params.id.toHexString()])

  const registry = event.params.projectId.split('-')[0]

  const id = event.params.projectId + '-' + event.params.vintage
  let project = Project.load(id)
  if (project == null) {
    project = new Project(id)
    project.key = event.params.projectId 
    project.name = event.params.name
    project.methodology = event.params.methodologies[0]
    project.vintage = BigInt.fromString(event.params.vintage)
    project.projectAddress = event.params.id
    project.registry = registry
    project.category = event.params.category
    project.country = event.params.country
    project.save()

    createCountry(project.country)
    createCategory(project.category)
  }
}
