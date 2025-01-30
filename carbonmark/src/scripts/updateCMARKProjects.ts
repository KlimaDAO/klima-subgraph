import fs from 'fs'
import 'dotenv/config';
import { CMSProjectInfo } from './CMSQueries';
import { fetchCMSProjects } from './CMSQueries';


(async function updateMainnetCMARKProjects() {
  // Fetch and format projects
  const projects: CMSProjectInfo[] = (await fetchCMSProjects('CMARK'))
  
  const mappedProjects = projects.map(
    p => { return [
      p.id,
      p.name ?? '',
      p.methodologies[0].rid.current ?? '',
      p.methodologies[0].category ?? '',
      p.country ?? '',
      p.region ?? '',
    ]}
  )
  
  // Write file
  const newFileContents = `export const CMARK_PROJECT_INFO = ${JSON.stringify(mappedProjects, null, 2)};`
  fs.writeFileSync('../lib/utils/CMARKProjectInfo.ts', newFileContents, 'utf8')
  
})();

