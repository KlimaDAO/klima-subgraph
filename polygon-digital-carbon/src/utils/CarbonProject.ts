import { PROJECT_INFO } from '../../../lib/projects/Projects'

import { CarbonProject } from '../../generated/schema'
import { Address, log } from '@graphprotocol/graph-ts'

export function loadOrCreateCarbonProject(registry: string, projectID: string, projectAddress: string | null = null): CarbonProject {
  // Find the project + vintage ID from token address
  let project = CarbonProject.load(projectID)

  if (project == null) {
    project = new CarbonProject(projectID)
    project.registry = registry
    project.projectID = projectID
    project.name = ''
    project.methodologies = ''
    project.category = ''
    project.country = ''
    project.region = ''

    for (let i = 0; i < PROJECT_INFO.length; i++) {
      if ((projectID && projectID.toLowerCase() == PROJECT_INFO[i].projectId.toLowerCase())
        || (projectAddress && projectAddress.toLowerCase() == PROJECT_INFO[i].address.toLowerCase())
      ) {
        project.projectID = projectID
        project.name = PROJECT_INFO[i].name
        project.methodologies = PROJECT_INFO[i].methodology
        project.category = PROJECT_INFO[i].category
        project.country = PROJECT_INFO[i].country
        project.region = PROJECT_INFO[i].region
        break
      }
    }
    project.dataSource = 'CSV'
    project.save()
  }
  return project as CarbonProject
}
