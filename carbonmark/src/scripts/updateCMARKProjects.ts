import fs from 'fs'
import 'dotenv/config';
import { CMSProjectInfo } from './types';
import { fetchCMSProjects } from './CMSQueries';


(async function updateMainnetCMARKProjects() {
  // Fetch projects
  const projects: CMSProjectInfo[] = (await fetchCMSProjects('CMARK'))
  
  const mappedProjects = projects.map(
    p => { return [
      p.id,
      p.name ?? '',
      p.methodologies[0].id.current ?? '',
      p.methodologies[0].category ?? '',
      p.country ?? '',
      p.region ?? '',
    ]}
  )
  
  const newFileContents = `export const CMARK_PROJECT_INFO = ${JSON.stringify(mappedProjects, null, 2)};`

  fs.writeFileSync('../lib/utils/CMARKProjectInfo.ts', newFileContents, 'utf8')
  
})();

