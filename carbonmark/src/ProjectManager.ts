import { log, Bytes, BigInt, store } from '@graphprotocol/graph-ts'
import {
  ProjectAdded as ProjectAddedEvent,
  ProjectRemoved as ProjectRemovedEvent,
} from '../generated/ProjectManager/ProjectManager'
import { Project } from '../generated/schema'
import { createCategory, createCountry } from './Entities'

export function handleProjectAdded(event: ProjectAddedEvent): void {
  log.info('handleProjectAdded fired {}', [event.params.id.toHexString()])
  const projectAddress = event.params.id.toHexString()
  let project = Project.load(projectAddress)

  const registry = event.params.projectId.split('-')[0]

  if (project == null) {
    project = new Project(projectAddress)
    project.key = event.params.projectId
    project.name = event.params.name
    project.methodology = event.params.methodologies[0]
    project.vintage = BigInt.fromString(event.params.vintages[0])
    project.projectAddress = Bytes.fromHexString(projectAddress)
    project.registry = registry
    project.category = event.params.category
    project.country = event.params.country
    project.save()

    createCountry(project.country)
    createCategory(project.category)
  }
}

export function handleProjectRemoved(event: ProjectRemovedEvent): void {
  log.info('handleProjectRemoved fired {}', [event.params.id.toHexString()])
  let project = Project.load(event.params.id.toHexString())
  if (project != null) {
    store.remove('Project', event.params.id.toHexString())
    log.info('handleProjectRemoved: project successfully removed {}', [event.params.id.toHexString()])
  } else {
    log.info('handleProjectRemoved: project not found {}', [event.params.id.toHexString()])
  }
}
