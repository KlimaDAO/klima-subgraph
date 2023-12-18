import { VERRA_PROJECT_NAMES } from '../../../lib/utils/VerraProjectInfo'
import { ICR_PROJECT_NAMES } from '../../../lib/utils/ICRProjectInfo'

import { CarbonProject } from '../../generated/schema'

export function loadOrCreateCarbonProject(registry: string, projectID: string): CarbonProject {
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

    // Set known values for Verra projects
    if (registry == 'VERRA') {
      for (let i = 0; i < VERRA_PROJECT_NAMES.length; i++) {
        if (projectID == VERRA_PROJECT_NAMES[i][0]) {
          project.name = VERRA_PROJECT_NAMES[i][1]
          project.country = VERRA_PROJECT_NAMES[i][2]
          break
        }
      }
    }

    if (registry == 'ICR') {
      for (let i = 0; i < ICR_PROJECT_NAMES.length; i++) {
        if (projectID == ICR_PROJECT_NAMES[i][0]) {
          project.name = ICR_PROJECT_NAMES[i][1]
          project.country = ICR_PROJECT_NAMES[i][2]
          break
        }
      }
    }

    project.save()
  }
  return project as CarbonProject
}
