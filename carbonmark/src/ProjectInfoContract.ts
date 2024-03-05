import { log } from '@graphprotocol/graph-ts'
import { ProjectInfoUpdated, TestEvent } from '../generated/ProjectInfo/ProjectInfo'
import { IpfsProjectInfo } from '../generated/schema'
import { IpfsContent as IpfsContentTemplate } from '../generated/templates'

// this is for debugging only and will be removed
export function handleTestEvent(event: TestEvent): void {
  log.info('Test event fired: {}', [event.transaction.hash.toHexString()])
}

export function handleProjectInfoUpdated(event: ProjectInfoUpdated): void {
  let hash = event.params.projectInfoHash
  log.info('ProjectInfoUpdated fired {}', [hash])

  const projectInfo = IpfsProjectInfo.load(hash)

  if (projectInfo === null) {
    let info = new IpfsProjectInfo(hash)
    info.save()

    IpfsContentTemplate.create(hash)
    log.info('IpfsProjectInfo created {}', [hash])
  }

  if (projectInfo !== null) {
    log.info('IpfsProjectInfo already exists: {}', [hash])
  }
}
