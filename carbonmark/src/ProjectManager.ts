import { log, Address, BigInt, store } from '@graphprotocol/graph-ts'
import {
  ProjectAdded as ProjectAddedEvent,
  ProjectRemoved as ProjectRemovedEvent,
} from '../generated/ProjectManager/ProjectManager'
import { Project } from '../generated/schema'
import { createCategory, createCountry } from './Entities'

export function handleProjectAdded(event: ProjectAddedEvent): void {
  log.info('handleProjectAdded fired {}', [event.params.id.toHexString()])

  const registry = event.params.projectId.split('-')[0]

  for (let i = 0; i < event.params.vintages.length; i++) {
    const id = event.params.projectId + '-' + event.params.vintages[i].toString()
    let project = Project.load(id)
    if (project == null) {
      project = new Project(id)
      project.key = event.params.projectId // maybe change this on the contract for better naming
      project.name = event.params.name
      project.methodology = event.params.methodologies[0]
      project.vintage = BigInt.fromString(event.params.vintages[i])
      project.projectAddress = event.params.id // rename in contract here as well
      project.registry = registry
      project.category = event.params.category
      project.country = event.params.country
      project.save()

      createCountry(project.country)
      createCategory(project.category)
    }
  }
}

export function handleProjectRemoved(event: ProjectRemovedEvent): void {
  const projectId = event.params.id
  log.info('handleProjectRemoved fired {}', [projectId])
  let project = Project.load(projectId)
  if (project != null) {
    store.remove('Project', projectId)
    log.info('handleProjectRemoved: project successfully removed {}', [projectId])
  } else {
    log.info('handleProjectRemoved: project not found {}', [projectId])
  }
}
