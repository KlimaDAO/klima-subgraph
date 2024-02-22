import {
  Bytes,
  dataSource,
  log,
  json,
  JSONValueKind,
  BigInt,
  DataSourceContext,
  DataSourceTemplate,
} from '@graphprotocol/graph-ts'
import { Project } from '../generated/schema'
import { createCategory, createCountry } from './Entities'

export function handleCreateProjects(content: Bytes): void {
  let result = json.try_fromBytes(content)

  if (result.isError) {
    log.error('JSON parsing error {}', [dataSource.stringParam()])
    return
  } else {
    log.info('JSON parsing succeeded {}', [dataSource.stringParam()])
  }
  let context = new DataSourceContext()
  let data = result.value

  if (data.kind === JSONValueKind.ARRAY) {
    let projectsArray = data.toArray()

    for (let i = 0; i < projectsArray.length; i++) {
      let projectData = projectsArray[i].toArray()

      // // debug logging, can eventually come out
      // let projectLogMessage = `Project ${i}: [`

      // for (let j = 0; j < projectData.length; j++) {
      //   let element = projectData[j]

      //   let elementValue = ''
      //   if (element.kind == JSONValueKind.STRING) {
      //     elementValue = element.toString()
      //   } else if (element.kind == JSONValueKind.NUMBER) {
      //     elementValue = element.toI64().toString()
      //   } else {
      //     elementValue = '<complex type or unsupported>'
      //   }

      //   projectLogMessage += elementValue

      //   if (j < projectData.length - 1) {
      //     projectLogMessage += ', '
      //   }
      // }

      // projectLogMessage += ']'

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
        project.save()

        createCountry(project.country)
        createCategory(project.category)
        project.save()
    

        context.setBytes('projectID', Bytes.fromHexString(project.id))

        DataSourceTemplate.createWithContext('IpfsContent', [project.id], context)
      }
    }
  } else {
    log.info('Parsed content of different kind (not array): {}', [data.kind.toString()])
  }
}
