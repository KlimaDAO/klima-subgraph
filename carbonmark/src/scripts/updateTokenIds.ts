import axios from 'axios'
import fs from 'fs'
import { PROJECT_INFO } from '../Projects'

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
  
      `,
  })
  return {
    exPosts: data.data.exPosts,
    exAntes: data.data.exAntes,
  }
}

async function updateProjectsTokenIds() {
  const updatedProjects: Project[] = []

  const { exPosts, exAntes } = await fetchTokenIds()

  PROJECT_INFO.forEach((project) => {
    const exPost = exPosts.find((exPost) => {
      return exPost.project.projectAddress.toLowerCase() === project[0].toLowerCase() && exPost.vintage === project[2]
    })
    const exAnte = exAntes.find((exAnte) => {
      const parts = exAnte.serialization.split('-')
      const vintage = parts[parts.length - 1]

      return exAnte.project.projectAddress.toLowerCase() === project[0].toLowerCase() && vintage === project[2]
    })

    if (exPost || exAnte) {
      const tokenId = exPost ? exPost.tokenId : exAnte ? exAnte.tokenId : '0'

      const updatedProject: Project = [
        project[0],
        project[1],
        project[2],
        project[3],
        project[4],
        project[5],
        project[6],
        tokenId,
      ]
      updatedProjects.push(updatedProject)
    } else {
      const updatedProject: Project = [...project, '0'] as Project
      updatedProjects.push(updatedProject)
    }
  })

  const newFileContents = `export const PROJECT_INFO = ${JSON.stringify(updatedProjects, null, 2)};`

  fs.writeFileSync('./Test.ts', newFileContents, 'utf8')
}

updateProjectsTokenIds()
