import axios from 'axios'
import { PROJECT_INFO } from '../Projects.ts'

const subgraphs = {
  polygon: {
    carbonmark: '...',
  },
  mumbai: {
    carbonmark: 'https://api.thegraph.com/subgraphs/name/psparacino/sepolia-smart-invoices',
  },
}

interface Project {
  id: string
}

const fetchProjectsFromSubgraph = async (networkType: string): Promise<string[]> => {
  const subgraphUrl = subgraphs[networkType]?.carbonmark

  let allProjects: Project[] = []
  let lastFetchedCount = 0
  let skip = 0
  const first = 1000

  do {
    const response = await axios.post(subgraphUrl, {
      query: `
          {
            projects(first: ${first}, skip: ${skip}) {
              id
            }
          }
        `,
    })

    const projects: Project[] = response.data.data.projects
    allProjects = [...allProjects, ...projects]
    lastFetchedCount = projects.length
    skip += first
  } while (lastFetchedCount === first)

  return allProjects.map((project) => project.id)
}

export const findMissingProjects = async (networkType: string) => {
  const subgraphProjects = await fetchProjectsFromSubgraph(networkType)

  const projectIds = PROJECT_INFO.map((info) => info[1] + '-' + info[2])

  const missingProjects = projectIds.filter((projectId) => !subgraphProjects.includes(projectId))

  const missingProjectDetails = missingProjects.map((missingProjectId) => {
    const elements = missingProjectId.split('-')
    const id = elements.slice(0, 2).join('-')

    const vintage = elements[elements.length - 1]

    const projectInfo = PROJECT_INFO.find((info) => info[1] === id && info[2] === vintage)

    if (!projectInfo) {
      throw new Error(`Project info not found for ${id}`)
    }

    return {
      id: projectInfo[0],
      projectId: projectInfo[1],
      vintages: [projectInfo[2]],
      name: projectInfo[3],
      methodologies: [projectInfo[4]],
      category: projectInfo[5],
      country: projectInfo[6],
      description: `Details for ${projectInfo[1]}.`,
    }
  })

  if (missingProjectDetails.length === 0) {
    console.log('No missing projects found.')
  }

  return missingProjectDetails
}
