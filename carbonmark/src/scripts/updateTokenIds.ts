import axios from 'axios'
import fs from 'fs'
import { PROJECT_INFO } from '../Projects'

require('dotenv').config()

type Project = [
  address: string,
  projectID: string,
  vintage: string,
  name: string,
  methodology: string,
  category: string,
  country: string,
  tokenId: string
]

async function fetchTokenIds() {
  const { data } = await axios.post('https://api.thegraph.com/subgraphs/name/skjaldbaka17/carbon-registry-polygon', {
    query: `
    {
        projects(first: 1000) {
          exPosts {
            tokenId
            vintage
            project {
              projectAddress
            }
          }
          exAntes {
            tokenId
            serialization
            project {
              projectAddress
            }
          }
        }
      }
      `,
  })

  return data.data.projects[0]
}

async function updateProjectsTokenIds() {
  const updated_PROJECT_INFO: Project[] = [...PROJECT_INFO] as Project[]
  const updatedProjects: Project[] = []
  const limit = 1000
  let totalFetched = 0

  const tokenIds = await fetchTokenIds()

  try {
    while (true) {

      const projects = PROJECT_INFO
      totalFetched += projects.length

      for (const project of projects) {
        const serialization = project.carbonCredits[0].serialization
        const elements = serialization.split('-')
        const registry = 'ICR'
        const registryProjectId = elements[3]

    

        for (const credit of project.carbonCredits) {
          const newProject: Project = [
            project.projectContracts[0].address,
            registry + '-' + registryProjectId,
            credit.vintage,
            project.fullName,
            project.methodology.id,
            cmsInfo.methodologies[0].category,
            cmsInfo.country,
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

updateProjectsTokenIds()
