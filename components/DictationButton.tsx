'use client'
import { useState, useRef } from 'react'
import { mergeFields } from '@/lib/dictation/mergeFields'
import { SECTION_KEY_MAPS } from '@/lib/dictation/fieldMaps'
import './DictationButton.css'

type DictationButtonProps = {
  section: 1 | 2 | 3 | 4
  existingValues: Record<string, string>
  onFieldsFilled: (fields: Record<string, string>) => void
}

type RecordingState = 'idle' | 'recording' | 'transcribing' | 'parsing' | 'conflict' | 'error'

function getSupportedMimeType(): string {
  const types = ['audio/webm', 'audio/mp4', 'audio/ogg']
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) return type
  }
  return 'audio/webm'
}

const isDictationSupported =
  typeof window !== 'undefined' &&
  !!navigator?.mediaDevices?.getUserMedia &&
  typeof MediaRecorder !== 'undefined'

// Convert snake_case API response keys to camelCase form keys for the given section
function toFormKeys(
  snakeCaseFields: Record<string, string>,
  section: number
): Record<string, string> {
  const keyMap = SECTION_KEY_MAPS[section] || {}
  const result: Record<string, string> = {}
  for (const [snakeKey, value] of Object.entries(snakeCaseFields)) {
    const formKey = keyMap[snakeKey] || snakeKey
    result[formKey] = value
  }
  return result
}

export function DictationButton({ section, existingValues, onFieldsFilled }: DictationButtonProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pendingFields, setPendingFields] = useState<Record<string, string>>({})
  const [conflictKeys, setConflictKeys] = useState<string[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef<string>('audio/webm')

  if (!isDictationSupported) return null

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()
      mimeTypeRef.current = mimeType

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorder.onstop = handleRecordingStop

      mediaRecorder.start()
      setState('recording')
    } catch (err) {
      const msg = err instanceof Error && err.name === 'NotAllowedError'
        ? 'Microphone access denied. Please allow mic access in your browser settings.'
        : 'Could not start recording. Please try again.'
      setErrorMsg(msg)
      setState('error')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop())
  }

  const handleRecordingStop = async () => {
    setState('transcribing')

    const mimeType = mimeTypeRef.current
    const audioBlob = new Blob(chunksRef.current, { type: mimeType })
    const formData = new FormData()
    formData.append('audio', audioBlob)
    formData.append('mimeType', mimeType)

    try {
      const transcribeRes = await fetch('/api/transcribe', { method: 'POST', body: formData })
      if (!transcribeRes.ok) throw new Error(`Transcription failed: ${transcribeRes.status}`)
      const { transcript, error: tError } = await transcribeRes.json()
      if (tError) throw new Error(tError)

      setState('parsing')
      const parseRes = await fetch('/api/parse-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, section })
      })
      if (!parseRes.ok) throw new Error(`Field parsing failed: ${parseRes.status}`)
      const { fields, error: pError } = await parseRes.json()
      if (pError) throw new Error(pError)

      // Convert snake_case API keys to camelCase form keys
      const formFields = toFormKeys(fields, section)

      const { merged, conflicts } = mergeFields(existingValues, formFields, 'fill-empty-only')

      if (conflicts.length > 0) {
        setPendingFields(formFields)
        setConflictKeys(conflicts)
        onFieldsFilled(merged)
        setState('conflict')
      } else {
        onFieldsFilled(merged)
        setState('idle')
      }
    } catch (err) {
      console.error('Dictation error:', err)
      setErrorMsg('Something went wrong. Please try again.')
      setState('error')
    }
  }

  const handleOverwriteConfirm = () => {
    const { merged } = mergeFields(existingValues, pendingFields, 'overwrite-all')
    onFieldsFilled(merged)
    setPendingFields({})
    setConflictKeys([])
    setState('idle')
  }

  const handleOverwriteDecline = () => {
    setPendingFields({})
    setConflictKeys([])
    setState('idle')
  }

  if (state === 'recording') return (
    <button onClick={stopRecording} className="dictation-btn dictation-btn--recording">
      <span className="dictation-btn__pulse" aria-hidden="true" />
      Stop Recording
    </button>
  )

  if (state === 'transcribing') return (
    <button disabled className="dictation-btn dictation-btn--loading">
      <span className="dictation-btn__spinner" aria-hidden="true" />
      Transcribing...
    </button>
  )

  if (state === 'parsing') return (
    <button disabled className="dictation-btn dictation-btn--loading">
      <span className="dictation-btn__spinner" aria-hidden="true" />
      Filling fields...
    </button>
  )

  if (state === 'conflict') return (
    <div className="dictation-conflict">
      <p className="dictation-conflict__message">
        {conflictKeys.length} field{conflictKeys.length > 1 ? 's' : ''} already
        {conflictKeys.length > 1 ? ' have' : ' has'} content. Replace with dictation results?
      </p>
      <div className="dictation-conflict__actions">
        <button onClick={handleOverwriteDecline} className="dictation-btn dictation-btn--secondary">
          Keep existing
        </button>
        <button onClick={handleOverwriteConfirm} className="dictation-btn dictation-btn--primary">
          Replace all
        </button>
      </div>
    </div>
  )

  if (state === 'error') return (
    <button onClick={() => setState('idle')} className="dictation-btn dictation-btn--error">
      {errorMsg} — Tap to retry
    </button>
  )

  return (
    <button onClick={startRecording} className="dictation-btn dictation-btn--idle">
      <span className="dictation-btn__icon" aria-hidden="true">🎙</span>
      Dictate Section
    </button>
  )
}
