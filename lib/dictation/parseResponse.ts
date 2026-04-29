export function validateParsedFields(
  parsed: Record<string, unknown>,
  expectedKeys: string[]
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const key of expectedKeys) {
    const value = parsed[key]
    result[key] = typeof value === 'string' ? value.trim() : ''
  }

  return result
}
