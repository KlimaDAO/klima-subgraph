import { PROJECT_INFO } from '../../../lib/projects/Projects'

import { CarbonProject } from '../../generated/schema'

export function loadOrCreateCarbonProject(registry: string, projectID: string): CarbonProject {
  // Find the project + vintage ID from token address
  let project = CarbonProject.load(projectID)

  if (project == null) {
    project = new CarbonProject(projectID)
    project.registry = registry
    project.projectID = projectID

    for (let i = 0; i < PROJECT_INFO.length; i++) {
      if (projectID.toLowerCase() == PROJECT_INFO[i].projectId) {
        registry = PROJECT_INFO[i].projectId.split('-')[0]
        project.registry = registry
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
