/**
 * Safely parses a JSON string from an agent response, handling markdown formatting
 * like ````json ... ```` blocks.
 *
 * @param rawText The raw response from the agent
 * @param fallback The fallback value to return if parsing fails
 * @returns The parsed object or the fallback value
 */
export function safeParseJson<T>(rawText: string, fallback: T): T {
  try {
    const jsonStr = rawText
      .trim()
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(jsonStr) as T
  } catch (error) {
    console.error('JSON parse error:', error, rawText)
    // Attempt fallback regex match for objects
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {
        return fallback
      }
    }
    return fallback
  }
}
