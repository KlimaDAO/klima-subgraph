import { log } from '@graphprotocol/graph-ts'
import {
  CreditAdded as CreditAddedEvent,
} from '../generated/CreditManager/CreditManager'
import { CarbonProject } from '../generated/schema'

export function handleCreditAdded(event: CreditAddedEvent): void {
  log.info('handleProjectAdded fired {}-{}', [event.params.tokenAddress.toHexString(), event.params.tokenId.toString()])

  const id = event.params.projectId
  let project = new CarbonProject(id)

  // Need to convert registry to the values we have previsouly hard coded in CarbonProject.ts
  let registry = ''
  const registryEvent = event.params.projectId.split('-')[0]
  if (registryEvent == 'PURO') {
    registry = 'PURO_EARTH'
  } else if (registryEvent == 'VCS') {
    registry = 'VERRA'
  } else if (registryEvent == 'ECO') {
    registry = 'ECO_REGISTRY'
  } else {
    registry = registryEvent
  }

    
  project.projectID = event.params.projectId
  project.name = event.params.name
  project.methodologies = event.params.methodologies[0] // CarbonProject supports only one methodology
  project.registry = registry
  project.category = event.params.category
  project.region = event.params.region
  project.country = event.params.country
  project.projectDataSource = 'Event'
  project.save()
}
