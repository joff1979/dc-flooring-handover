// Maps section numbers to API field keys (snake_case) and form field keys (camelCase)

export const SECTION_PROMPTS: Record<number, {
  fieldKeys: string[]
  fieldDescriptions: string
}> = {
  1: {
    fieldKeys: [
      'project_name',
      'client',
      'site_address',
      'contract_value',
      'anticipated_start',
      'programme_duration'
    ],
    fieldDescriptions: `
- project_name: The name or reference for this project
- client: The client or company name
- site_address: Full site address where work will be carried out
- contract_value: The monetary value of the contract (numbers only, no £ symbol)
- anticipated_start: When work is expected to begin (DD/MM/YYYY)
- programme_duration: How long the works will take (e.g. "6 weeks", "3 months")`
  },
  2: {
    fieldKeys: [
      'main_scope_of_works',
      'key_inclusions',
      'key_exclusions'
    ],
    fieldDescriptions: `
- main_scope_of_works: Summary of the primary flooring works being carried out
- key_inclusions: What is specifically included in the contract scope
- key_exclusions: What is specifically excluded from the contract scope`
  },
  3: {
    fieldKeys: [
      'pricing_assumptions',
      'commercial_risks',
      'programme_concerns'
    ],
    fieldDescriptions: `
- pricing_assumptions: Assumptions made when pricing this job
- commercial_risks: Any commercial or financial risks identified
- programme_concerns: Any concerns about the delivery programme or timeline`
  },
  4: {
    fieldKeys: [
      'site_access_restrictions',
      'labour_requirements',
      'specialist_materials_lead_times',
      'client_commitments',
      'items_for_immediate_action'
    ],
    fieldDescriptions: `
- site_access_restrictions: Details about site access hours and any restrictions
- labour_requirements: Labour needed for this project (headcount, trades, etc.)
- specialist_materials_lead_times: Any specialist materials and their lead times
- client_commitments: Any promises or commitments made by the client
- items_for_immediate_action: Things the contract manager must action immediately`
  }
}

// Maps snake_case API keys → camelCase form field keys
export const SECTION_KEY_MAPS: Record<number, Record<string, string>> = {
  1: {
    project_name: 'projectName',
    client: 'client',
    site_address: 'siteAddress',
    contract_value: 'contractValue',
    anticipated_start: 'startDate',
    programme_duration: 'duration',
  },
  2: {
    main_scope_of_works: 'scopeMain',
    key_inclusions: 'inclusions',
    key_exclusions: 'exclusions',
  },
  3: {
    pricing_assumptions: 'pricingAssumptions',
    commercial_risks: 'commercialRisks',
    programme_concerns: 'programmeRisks',
  },
  4: {
    site_access_restrictions: 'siteAccess',
    labour_requirements: 'labourRequirements',
    specialist_materials_lead_times: 'specialistMaterials',
    client_commitments: 'clientCommitments',
    items_for_immediate_action: 'immediateActions',
  },
}
