import { PROJECT_INFO } from '../../../lib/projects/Projects'

import { CarbonProject } from '../../generated/schema'

function loadOrCreateCarbonProjectHelper(registry: string, projectID: string, forceUpdate: boolean): CarbonProject {
  // Find the project + vintage ID from token address
  let project = CarbonProject.load(projectID)

  if (project == null) {
    project = new CarbonProject(projectID)
    project.registry = registry
    project.projectID = projectID
  }
  if (project == null || forceUpdate) {
    for (let i = 0; i < PROJECT_INFO.length; i++) {
      if (projectID.toLowerCase() == PROJECT_INFO[i].projectId) {
        project.projectID = projectID
        project.name = PROJECT_INFO[i].name
        project.methodologies = PROJECT_INFO[i].methodology
        project.category = PROJECT_INFO[i].category
        project.country = PROJECT_INFO[i].country
        break
      }
    }
    project.save()
  }
  return project as CarbonProject
}

export function loadOrCreateCarbonProject(registry: string, projectID: string): CarbonProject {
  return loadOrCreateCarbonProjectHelper(registry, projectID, false)
}

export function loadOrCreateOrUpdateCarbonProject(registry: string, projectID: string): CarbonProject {
  return loadOrCreateCarbonProjectHelper(registry, projectID, true)
}

