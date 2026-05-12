import { NextRequest, NextResponse } from 'next/server'
import { SimproAdapter } from '@/lib/integrations/simpro/adapter'
import { ProjectNotFoundError } from '@/lib/integrations/types'
import { getCurrentUser } from '@/lib/auth'

const provider = new SimproAdapter()

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobNumber = req.nextUrl.searchParams.get('jobNumber')
  if (!jobNumber) return NextResponse.json({ error: 'jobNumber is required' }, { status: 400 })

  try {
    const projectData = await provider.fetchByJobNumber(jobNumber)
    return NextResponse.json({ project: projectData })
  } catch (err) {
    if (err instanceof ProjectNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 })
    }
    console.error('Simpro fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch project data' }, { status: 500 })
  }
}
