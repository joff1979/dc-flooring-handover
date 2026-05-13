const SIMPRO_BASE_URL = process.env.SIMPRO_BASE_URL!
const SIMPRO_API_KEY  = process.env.SIMPRO_API_KEY!
const SIMPRO_COMPANY_ID = process.env.SIMPRO_COMPANY_ID!

export async function simproGet<T>(path: string): Promise<T> {
  const url = `${SIMPRO_BASE_URL}/api/v1.0/companies/${SIMPRO_COMPANY_ID}${path}`
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SIMPRO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 }
  })
  if (res.status === 404) return null as T
  if (!res.ok) throw new Error(`Simpro API error: ${res.status} ${res.statusText} — ${url}`)
  return res.json() as Promise<T>
}
