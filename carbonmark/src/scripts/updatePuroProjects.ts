import axios from 'axios'
import fs from 'fs'
import { PROJECT_INFO } from '../Projects'
import { ProjectInfo } from './types'
import dotenv from 'dotenv'
import { fetchCMSProject, fetchCMSProjects } from './CMSQueries'
dotenv.config()

const PURO_EARTH_SUBGRAPH_ID = 'FU5APMSSCqcRy9jy56aXJiGV3PQmFQHg2tzukvSJBgwW'

async function fetchSubgraphProjectVintages() {
  const { data } = await axios.post(
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.GRAPH_API_KEY}/subgraphs/id/${PURO_EARTH_SUBGRAPH_ID}`,
    {
      query: `
        {
          projects(where: {standard: "PURO"}) {
            vintages {
              endTime
              tco2Token {
                address
              }
            }
            id
            projectId
          }
        }
      `,
    }
  )

  return data.data.projects
}

async function updatePuroProjects() {
  const updated_PROJECT_INFO = [...PROJECT_INFO]
  const updatedProjects: ProjectInfo[] = []
  const registry = 'PUR'

  const cmsInfo = await fetchCMSProjects(registry)

  const subgraphVintageData = await fetchSubgraphProjectVintages()
  const libSet = new Set<string>()
  for (const project of cmsInfo) {
    const projectId = registry + '-' + project.registryProjectId

    const subgraphProject = subgraphVintageData.find((p) => {
      return p.projectId === projectId
    })

    if (subgraphProject) {
      for (const vintage of subgraphProject.vintages) {
        const date = new Date(parseInt(vintage.endTime) * 1000)

        const libList = [projectId, project.name, project.country]

        libSet.add(JSON.stringify(libList))

        const newProject = new ProjectInfo(
          vintage.tco2Token.address,
          projectId,
          date.getUTCFullYear().toString(),
          project.name,
          project.methodologies?.[0]?.id || '',
          project.methodologies?.[0]?.category || '',
          project.country,
          '0',
          false
        )

        updatedProjects.push(newProject)
      }
    }
  }

  console.log(
    'libSet',
    Array.from(libSet).map((item: string) => JSON.parse(item))
  )

  updatedProjects.forEach((project) => {
    updated_PROJECT_INFO.push(project)
  })

  const finalProjects = [...PROJECT_INFO, ...updatedProjects]

  const importStatement = 'import { ProjectInfo } from "./scripts/types";\n'
  const arrayDeclaration = 'export const PROJECT_INFO: ProjectInfo[] = [\n'
  const projectInstances = finalProjects
    .map(
      (project) =>
        `    new ProjectInfo('${project.address}', '${project.projectId}', '${project.vintage}', '${project.name}', '${project.methodology}', '${project.category}', '${project.country}', '${project.tokenId}', ${project.isExAnte})`
    )
    .join(',\n')
  const closingBracket = '\n];'

  const finalContent = importStatement + arrayDeclaration + projectInstances + closingBracket

  fs.writeFile('src/Projects.ts', finalContent, 'utf8', (err) => {
    if (err) return console.error('Failed to write file:', err)
    console.log('Project info updated and saved successfully!')
  })
}
updatePuroProjects()
