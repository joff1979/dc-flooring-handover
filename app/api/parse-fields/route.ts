import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { SECTION_PROMPTS } from '@/lib/dictation/fieldMaps'
import { validateParsedFields } from '@/lib/dictation/parseResponse'

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.DCF_ANTHROPIC_KEY })

export async function POST(req: NextRequest) {
  const { transcript, section } = await req.json()

  if (!transcript || !section) {
    return NextResponse.json({ error: 'Missing transcript or section' }, { status: 400 })
  }

  const sectionConfig = SECTION_PROMPTS[section]

  if (!sectionConfig) {
    return NextResponse.json({ error: `Invalid section: ${section}` }, { status: 400 })
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are parsing a voice transcript from a flooring contractor's site survey into structured form fields.

Extract the following fields from the transcript. Return ONLY valid JSON with these exact keys: ${sectionConfig.fieldKeys.join(', ')}.

Field descriptions:
${sectionConfig.fieldDescriptions}

Rules:
- If a field is not mentioned, return an empty string "" for that field — do not guess or invent
- Do not assume information not explicitly stated in the transcript
- For dates, format as DD/MM/YYYY
- For contract_value, return numbers only with no currency symbol (e.g. 45000 not £45,000)
- Return nothing but the raw JSON object — no markdown, no backticks, no explanation

Transcript:
"${transcript}"`
    }]
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(jsonStr)
    const validated = validateParsedFields(parsed, sectionConfig.fieldKeys)
    return NextResponse.json({ fields: validated })
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw }, { status: 422 })
  }
}
