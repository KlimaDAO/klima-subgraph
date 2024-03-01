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
