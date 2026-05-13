import { ProjectData } from '../types'

export type SimproJobSummary = {
  ID: number
  Name: string
}

export type SimproJob = {
  ID: number
  Name: string
  Customer: { CompanyName: string; GivenName: string; FamilyName: string }
  Site: { ID: number; Name: string }
  Total: { ExTax: number; IncTax: number }
  DateIssued: string | null
  DueDate: string | null
  CustomFields: Array<{ Name: string; Value: string }>
}

export type SimproSite = {
  Address: { Address: string; City: string; State: string; PostalCode: string; Country: string }
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function formatAddress(addr: SimproSite['Address']): string {
  return [addr.Address, addr.City, addr.State, addr.PostalCode].filter(Boolean).join(', ')
}

function getCustomField(fields: SimproJob['CustomFields'], name: string): string {
  return fields.find(f => f.Name === name)?.Value ?? ''
}

export function mapJobToProjectData(job: SimproJob, site: SimproSite | null): ProjectData {
  const client = job.Customer.CompanyName || `${job.Customer.GivenName} ${job.Customer.FamilyName}`.trim()
  return {
    projectName:       job.Name,
    client,
    siteAddress:       site ? formatAddress(site.Address) : '',
    contractValue:     job.Total.ExTax ? String(Math.round(job.Total.ExTax)) : '',
    anticipatedStart:  formatDate(job.DateIssued || job.DueDate),
    programmeDuration: getCustomField(job.CustomFields, 'Programme Duration'),
  }
}
