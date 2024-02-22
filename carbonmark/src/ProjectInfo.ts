import { Bytes, dataSource, log, json, JSONValueKind, DataSourceContext } from '@graphprotocol/graph-ts'
import { IpfsProjectInfoVersion } from '../generated/schema'
import { AllIpfsProject } from '../generated/schema'
import { Project } from '../generated/schema'

export function handleCreateProjects(content: Bytes): void {
  let result = json.try_fromBytes(content)

  if (result.isError) {
    log.error('JSON parsing error {}', [dataSource.stringParam()])
    return
  } else {
    log.info('JSON parsing succeeded {}', [dataSource.stringParam()])
  }

  let data = result.value

  if (data.kind === JSONValueKind.ARRAY) {
    let projectsArray = data.toArray()

    for (let i = 0; i < projectsArray.length; i++) {
      let projectArray = projectsArray[i].toArray()

      let projectLogMessage = `Project ${i}: [`

      for (let j = 0; j < projectArray.length; j++) {
        let element = projectArray[j]

        let elementValue = ''
        if (element.kind == JSONValueKind.STRING) {
          elementValue = element.toString()
        } else if (element.kind == JSONValueKind.NUMBER) {
          elementValue = element.toI64().toString()
        } else {
          elementValue = '<complex type or unsupported>'
        }

        projectLogMessage += elementValue

        if (j < projectArray.length - 1) {
          projectLogMessage += ', '
        }
      }

      projectLogMessage += ']'

      // let project = new Project(id.toString())
      // project.key = PROJECT_INFO[projectIndex][1]
      // project.name = PROJECT_INFO[projectIndex][3]
      // project.methodology = PROJECT_INFO[projectIndex][4]
      // project.vintage = BigInt.fromString(PROJECT_INFO[projectIndex][2])
      // project.projectAddress = token
      // project.registry = registry
      // project.category = PROJECT_INFO[projectIndex][5]
      // project.country = PROJECT_INFO[projectIndex][6]
      // project.save()
  
      // createCountry(project.country)
      // createCategory(project.category)
    }
  } else {
    log.info('Parsed content of different kind (not array): {}', [data.kind.toString()])
  }

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
    // project = new Project(id.toString())
    // project.key = PROJECT_INFO[projectIndex][1]
    // project.name = PROJECT_INFO[projectIndex][3]
    // project.methodology = PROJECT_INFO[projectIndex][4]
    // project.vintage = BigInt.fromString(PROJECT_INFO[projectIndex][2])
    // project.projectAddress = token
    // project.registry = registry
    // project.category = PROJECT_INFO[projectIndex][5]
    // project.country = PROJECT_INFO[projectIndex][6]
    // project.save()

    // createCountry(project.country)
    // createCategory(project.category)
  // }
  // return project
}
