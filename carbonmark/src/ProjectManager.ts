import { log } from '@graphprotocol/graph-ts'
import {
  ProjectAdded as ProjectAddedEvent,
  ProjectRemoved as ProjectRemovedEvent,
} from '../generated/ProjectManager/ProjectManager'

export function handleProjectAdded(event: ProjectAddedEvent): void {
  log.info('fuck yeah', [])
}

export function handleProjectRemoved(event: ProjectRemovedEvent): void {
  log.info('gone baybee', [])
}
