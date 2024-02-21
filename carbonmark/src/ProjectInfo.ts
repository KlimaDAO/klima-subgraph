import { Bytes, dataSource, log, json } from '@graphprotocol/graph-ts'
import { IpfsProjectInfoVersion } from '../generated/schema'
import { AllIpfsProject } from '../generated/schema'

export function handleCreateProjects(content: Bytes): void {
  log.info('zip {}', [dataSource.stringParam()])
  let hash = dataSource.stringParam()
  let context = dataSource.context();
  let id = context.getBytes('IpfsContent');
  let ipfsProjectInfo = new AllIpfsProject(id.toString())
  const value = json.fromBytes(content).toArray()

  // if (value) {
  //   log.info('value {}', [value.toString()])
  // }
  // ipfsProjectInfo.save()
  // let id = ''
  // let registry = ''
  // let projectIndex = 0
  // for (let i = 0; i < PROJECT_INFO.length; i++) {
  //   if (tokenAddress == PROJECT_INFO[i][0]) {
  //     id = PROJECT_INFO[i][1] + '-' + PROJECT_INFO[i][2]
  //     registry = PROJECT_INFO[i][1].split('-')[0]
  //     projectIndex = i
  //     break
  //   }
  // }

  // let project = Project.load(id)

  // if (project == null) {
  //   project = new Project(id.toString())
  //   project.key = PROJECT_INFO[projectIndex][1]
  //   project.name = PROJECT_INFO[projectIndex][3]
  //   project.methodology = PROJECT_INFO[projectIndex][4]
  //   project.vintage = BigInt.fromString(PROJECT_INFO[projectIndex][2])
  //   project.projectAddress = token
  //   project.registry = registry
  //   project.category = PROJECT_INFO[projectIndex][5]
  //   project.country = PROJECT_INFO[projectIndex][6]
  //   project.save()

  //   createCountry(project.country)
  //   createCategory(project.category)
  // }
  // return project
}
