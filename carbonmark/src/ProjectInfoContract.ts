import { log, ipfs, json, JSONValueKind, BigInt, Bytes, Address, ValueKind, dataSource } from '@graphprotocol/graph-ts'
import { ProjectInfoUpdated, ProjectInfo, TestEvent } from '../generated/ProjectInfo/ProjectInfo'
import { IpfsProjectInfo, Project } from '../generated/schema'
import { createCategory, createCountry } from './Entities'
import { IpfsContent as IpfsContentTemplate } from '../generated/templates'

// this is for debugging only and will be removed
export function handleTestEvent(event: TestEvent): void {
  log.info('Test event fired: {}', [event.transaction.hash.toHexString()])

  // this vintage can't be used though as it's not in any event. need better way get to get vintage for 1155 tokens
  let test = Project.load('0x0044c5a5a6f626b673224a3c0d71e851ad3d5153-2013')
  // test will be null as the project entity was created in an ipfs handler
  if (test !== null) {
    log.info('fix: {}', [test.name])
  }

  const address = Address.fromString('0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775')

  let contract = ProjectInfo.bind(address)

  let hash = contract.getProjectInfoHash()

  let ipfsData = IpfsProjectInfo.load(hash)

  if (ipfsData == null) {
    log.error('IPFS data not found for hash: {}', [hash])
    return
  }
  if (ipfsData !== null && ipfsData.projectList) {
    let projects = ipfsData.projectList.load()
    log.info('Project count: {}', [projects.length.toString()])
    // projects are stored here as Project[]

    for (let i = 0; i < projects.length; i++) {
      let projectData = projects[i]
      let project = Project.load(projectData.id)
      log.info('Project ID: {}', [projectData.id])
      if (project == null) {
        project = new Project(projectData.id)
        project.key = projectData.key
        project.name = projectData.name
        project.methodology = projectData.methodology
        project.vintage = BigInt.fromString(projectData.vintage.toString())
        project.projectAddress = Bytes.fromHexString(projectData.projectAddress.toHexString())
        project.registry = 'TEST THIS'
        project.category = projectData.category
        project.country = projectData.country

        createCountry(project.country)
        createCategory(project.category)
        project.save()
      }
    }
  } else {
    log.error('IPFS data not found or projectList is undefined for hash: {}', [hash])
  }
}

export function handleProjectInfoUpdated(event: ProjectInfoUpdated): void {
  let hash = event.params.projectInfoHash
  log.info('ProjectInfoUpdated fired: {}', [hash])

  IpfsContentTemplate.create(hash)

  const projectInfo = IpfsProjectInfo.load(hash)

  if (projectInfo === null) {
    let info = new IpfsProjectInfo(hash)
    info.save()
    return
  }
}
