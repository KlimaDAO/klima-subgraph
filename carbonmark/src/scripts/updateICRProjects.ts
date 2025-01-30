import axios from 'axios'
import fs from 'fs'
import { PROJECT_INFO } from '../Projects'
import { fetchCMSProject } from './CMSQueries'

require('dotenv').config()


async function updateMainnetICRProjects() {
  const updated_PROJECT_INFO = [...PROJECT_INFO] 
  const updatedProjects = []
  const limit = 100
  let totalFetched = 0


  try {
    while (true) {
      const { data } = await axios.get('https://api.carbonregistry.com/projects', {
        headers: {
          Authorization: `Bearer ${process.env.ICR_MAINNET_ACCESS_TOKEN}`,
        },
        params: {
          limit,
          offset: totalFetched,
        },
      })

      const projects = data.projects
      totalFetched += projects.length

      for (const project of projects) {
        const serialization = project.carbonCredits[0].serialization
        const elements = serialization.split('-')
        const registry = 'ICR'
        const registryProjectId = elements[3]

        const cmsInfo = await fetchCMSProject(registry, registryProjectId)

        for (const credit of project.carbonCredits) {
          const newProject = [
            project.projectContracts[0].address,
            registry + '-' + registryProjectId,
            credit.vintage,
            project.fullName,
            project.methodology.id,
            cmsInfo.methodologies[0].category,
            cmsInfo.country,
            '0',
            'false'
          ]

          updatedProjects.push(newProject)
        }
      }
      if (projects.length < limit) {
        break
      }
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
  }

  updatedProjects.forEach((project) => {
    updated_PROJECT_INFO.push(project)
  })

  const newFileContents = `export const PROJECT_INFO = ${JSON.stringify(updated_PROJECT_INFO, null, 2)};`

  fs.writeFileSync('src/Projects.ts', newFileContents, 'utf8')
}

updateMainnetICRProjects()
