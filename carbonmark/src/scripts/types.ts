export class ProjectInfo {
    constructor(
      public address: string,
      public projectId: string,
      public vintage: string,
      public name: string,
      public methodology: string,
      public category: string,
      public country: string,
      public tokenId: string,
      public isExAnte: boolean
    ) {}
  }

export type CMSProjectInfo = {
  id: string,
  name: string,
  methodologies: [{
    id: string,
    rid: {
      current: string
    },
    category: string,
  }],
  country: string,
  region: string,
}