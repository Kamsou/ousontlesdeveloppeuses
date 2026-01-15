export function parseTopics(topics: string | null | undefined): string[] {
  if (!topics) return []
  try {
    const parsed = JSON.parse(topics)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
