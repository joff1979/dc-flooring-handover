export type MergeStrategy = 'fill-empty-only' | 'overwrite-all'

export type MergeResult = {
  merged: Record<string, string>
  conflicts: string[]
}

export function mergeFields(
  existing: Record<string, string>,
  incoming: Record<string, string>,
  strategy: MergeStrategy = 'fill-empty-only'
): MergeResult {
  const merged = { ...existing }
  const conflicts: string[] = []

  for (const [key, value] of Object.entries(incoming)) {
    if (!value) continue

    if (strategy === 'overwrite-all') {
      merged[key] = value
    } else {
      if (existing[key] && existing[key].trim() !== '') {
        conflicts.push(key)
      } else {
        merged[key] = value
      }
    }
  }

  return { merged, conflicts }
}
