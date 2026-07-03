export function parseWords(input: string) {
  const seen = new Set<string>()
  return input
    .split(/[\n,，]+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => {
      const key = word.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}
