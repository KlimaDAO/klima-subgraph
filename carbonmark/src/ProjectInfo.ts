import { Bytes, dataSource, log, json } from '@graphprotocol/graph-ts'
import { JSONValueKind, BigInt } from '@graphprotocol/graph-ts'
import { Project } from '../generated/schema'

export function handleCreateProjects(content: Bytes): void {
  let hash = dataSource.stringParam()
  let result = json.try_fromBytes(content)
  let count = 0
  let data = result.value
  if (data.kind === JSONValueKind.ARRAY) {
    let projectsArray = data.toArray()

    log.info('Parsed content of kind array: {}', [projectsArray.length.toString()])

    for (let i = 0; i < projectsArray.length; i++) {
      log.info('create loop index {}', [i.toString()])
      let projectData = projectsArray[i].toArray()

      let vintage = projectData[2].toString()
      let registry = projectData[1].toString().split('-')[0]
      /**
       * in order to not collide with the on-chain entity,
       * add -ipfs to the id here in order to designate as ipfs entity and to remove in the on-chain entity
       */

      // do not need to load/null check pattern as ipfs created entities are immutable
      let projectId = projectData[0].toString() + '-' + vintage + '-' + hash

      let project = new Project(projectId)
      project.key = projectData[1].toString()
      project.name = projectData[3].toString()
      project.methodology = projectData[4].toString()
      project.vintage = BigInt.fromString(vintage)
      project.projectAddress = Bytes.fromHexString(projectData[0].toString())
      project.registry = registry
      project.category = projectData[5].toString()
      project.country = projectData[6].toString()
      project.ipfsProjectInfo = hash
      project.shortDescription = 'placeholder short description'
      project.ipfsProjectInfo = hash
      project.save()
      count += 1
    }
  } else {
    log.info('loop error {}', [data.kind.toString()])
  }
  log.info('total-projects-created {}', [count.toString()])
}
