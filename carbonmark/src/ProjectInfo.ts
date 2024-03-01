import { log, ipfs, json, JSONValueKind, BigInt, Bytes, Address, ValueKind, dataSource } from '@graphprotocol/graph-ts'
import { ProjectInfoUpdated, TestEvent, ProjectInfo} from '../generated/ProjectInfo/ProjectInfo';
import { IpfsProjectInfo, Project } from '../generated/schema'
import { createCategory, createCountry } from './Entities'

// this is for debugging only and will be removed
export function handleTestEvent(event: TestEvent): void {
  log.info('Test event fired: {}', [event.transaction.hash.toHexString()])

  // // let network = dataSource.network()
  // // let projectInfoFacetAddress = netWorkAddresses[network]["projectInfoFacet"]
  // // const address = Address.fromString(projectInfoFacetAddress)

  // const address = Address.fromString('0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775')

  // let infoContract = ProjectInfo.bind(address)

  // let hash = infoContract.getProjectInfoHash()

  // log.info('IPFS hash: {}', [hash])

  // let ipfsData = IpfsProjectInfo.load(hash)

  // if (ipfsData === null) {
  //   log.error('IPFS data not found for hash: {}', [hash])
  //   return
  // }

  // if (ipfsData !== null && ipfsData.projectList) {
  //   let projects = ipfsData.projectList.load()
  //   log.info('Project count: {}', [projects.length.toString()])
  //   for (let i = 0; i < projects.length; i++) {
  //     let projectData = projects[i]
  //     let project = Project.load(projectData.id)
  //     if (project == null) {
  //       project = new Project(projectData.id)
  //       project.key = projectData.key
  //       project.name = projectData.name
  //       project.methodology = projectData.methodology
  //       project.vintage = BigInt.fromString(projectData.vintage.toString())
  //       project.projectAddress = Bytes.fromHexString(projectData.projectAddress.toHexString())
  //       project.registry = 'TEST THIS'
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

  let ipfsData = ipfs.cat(hash)

  if (ipfsData === null) {
    return log.info('IPFS data not found for hash: {}', [hash])
  }

  let result = json.try_fromBytes(ipfsData)

  let data = result.value
  if (data.kind === JSONValueKind.ARRAY) {
    let projectsArray = data.toArray()

    for (let i = 0; i < projectsArray.length; i++) {
      let projectData = projectsArray[i].toArray()

      let registry = ''
      // check if project exists from previous upload
      let project = Project.load(projectData[0].toString())

      if (project == null) {
        project = new Project(projectData[0].toString())
        project.key = projectData[1].toString()
        project.name = projectData[3].toString()
        project.methodology = projectData[4].toString()
        project.vintage = BigInt.fromString(projectData[2].toString())
        project.projectAddress = Bytes.fromHexString(projectData[0].toString())
        project.registry = registry
        project.category = projectData[5].toString()
        project.country = projectData[6].toString()
        project.ipfsProjectInfo = hash
        project.save()

        createCountry(project.country)
        createCategory(project.category)
        project.save()
      }
    }
    let ipfsProjectInfo = new IpfsProjectInfo(hash)
    ipfsProjectInfo.updatedAt = event.block.timestamp
    ipfsProjectInfo.save()
  } else {
    log.info('Parsed content of different kind (not array): {}', [data.kind.toString()])
  }
}
