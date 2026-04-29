import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const audio = formData.get('audio') as File
  const mimeType = (formData.get('mimeType') as string) || 'audio/webm'

  if (!audio) {
    return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
  }

  const extension = mimeType.includes('mp4') ? 'mp4' : 'webm'
  const file = new File([audio], `recording.${extension}`, { type: mimeType })

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en',
    prompt: 'Flooring contractor site survey. May include: project names, site addresses, contract values, flooring systems, polishing, screeding, resin, site access details, labour requirements, lead times.',
  })

  return NextResponse.json({ transcript: transcription.text })
}
