import { ProjectDataProvider, ProjectData, ProjectNotFoundError } from '../types'
import { simproGet } from './client'
import { mapJobToProjectData, SimproJob, SimproJobSummary, SimproSite } from './mappers'

export class SimproAdapter implements ProjectDataProvider {
  async fetchByJobNumber(jobNumber: string): Promise<ProjectData> {
    const jobs = await simproGet<SimproJobSummary[]>(`/jobs/?Name=${encodeURIComponent(jobNumber)}&pageSize=1`)
    if (!jobs || jobs.length === 0) throw new ProjectNotFoundError(jobNumber)
    const jobSummary = jobs[0]
    const job = await simproGet<SimproJob | null>(`/jobs/${jobSummary.ID}`)
    if (!job) throw new ProjectNotFoundError(jobNumber)
    const siteID = job.Site?.ID
    const site = siteID ? await simproGet<SimproSite | null>(`/sites/${siteID}`) : null
    return mapJobToProjectData(job, site)
  }
}
