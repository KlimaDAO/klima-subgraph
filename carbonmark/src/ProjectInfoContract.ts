import {
  log,
  ipfs,
  json,
  JSONValueKind,
  store,
  BigInt,
  Bytes,
  Address,
  ValueKind,
  dataSource,
} from '@graphprotocol/graph-ts'
import { ProjectInfoUpdated, ProjectInfo, TestEvent } from '../generated/ProjectInfo/ProjectInfo'
import { IpfsProjectInfo, Project } from '../generated/schema'
import { createCategory, createCountry } from './Entities'
import { IpfsContent as IpfsContentTemplate } from '../generated/templates'

// this is for debugging only and will be removed
export function handleTestEvent(event: TestEvent): void {
  log.info('Test event fired: {}', [event.transaction.hash.toHexString()])

  // // this vintage can't be used though as it's not in any event. need better way get to get vintage for 1155 tokens
  // let project = Project.load('0x0044c5a5a6f626b673224a3c0d71e851ad3d5153')

  // // project will be null as the project entity was created in an ipfs handler
  // if (project !== null) {
  //   log.info('fix: {}', [project.name])
  // }
  // if (project === null) {
  //   log.info('test is null', [])
  // }

  // const address = Address.fromString('0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775')

  // let contract = ProjectInfo.bind(address)

  // let hash = contract.getProjectInfoHash()

  // let ipfsData = IpfsProjectInfo.load(hash)

  // if (ipfsData == null) {
  //   log.error('IPFS data not found for hash: {}', [hash])
  //   return
  // }
  // if (ipfsData !== null && ipfsData.projectList) {
  //   let projects = ipfsData.projectList.load()
  //   log.info('Project count: {}', [projects.length.toString()])
  //   // projects are stored here as Project[]

  //   for (let i = 0; i < projects.length; i++) {
  //     let projectData = projects[i]
  //     let project = Project.load(projectData.id)
  //     // remove the -ipfs from the id to create on-chain accessible entity
  //     let projectId = projectData.id.split('-')[0]

  //     if (project == null) {
  //       project = new Project(projectId)

  //       project = new Project(projectData.id)
  //       project.key = projectData.key
  //       project.name = projectData.name
  //       project.methodology = projectData.methodology
  //       project.vintage = BigInt.fromString(projectData.vintage.toString())
  //       project.projectAddress = Bytes.fromHexString(projectData.projectAddress.toHexString())
  //       project.registry = 'REGISTRY'
  //       project.category = projectData.category
  //       project.country = projectData.country

  //       createCountry(project.country)
  //       createCategory(project.category)
  //       project.save()
  //     }
  //   }
  // } else {
  //   log.error('IPFS data not found or projectList is undefined for hash: {}', [hash])
  // }
}

export function handleProjectInfoUpdated(event: ProjectInfoUpdated): void {
  let hash = event.params.projectInfoHash
  log.info('ProjectInfoUpdated fired: {}', [hash])

  IpfsContentTemplate.create(hash)

  const projectInfo = IpfsProjectInfo.load(hash)

  if (projectInfo === null) {
    let info = new IpfsProjectInfo(hash)
    info.save()
    log.info('IpfsProjectInfo created: {}', [hash])
    return
  }
}
