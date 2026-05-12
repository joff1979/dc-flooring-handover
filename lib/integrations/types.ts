export type ProjectData = {
  projectName: string
  client: string
  siteAddress: string
  contractValue: string      // numeric string, no currency symbol
  anticipatedStart: string   // DD/MM/YYYY
  programmeDuration: string  // free text, empty string if not available
}

export interface ProjectDataProvider {
  fetchByJobNumber(jobNumber: string): Promise<ProjectData>
}

export class ProjectNotFoundError extends Error {
  constructor(jobNumber: string) {
    super(`No project found for job number: ${jobNumber}`)
    this.name = 'ProjectNotFoundError'
  }
}
