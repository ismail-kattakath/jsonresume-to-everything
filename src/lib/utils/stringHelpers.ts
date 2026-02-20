/**
 * Splits a text string into an array of sentences.
 *
 * Handles various scenarios:
 * - Common abbreviations (Mr., Dr., etc.)
 * - Decimals (1.5)
 * - Ellipses (...)
 * - Quotes ("Hello.")
 * - Newlines and bullet points
 * - Messy spaces and dots
 */
export function splitTextIntoSentences(text: string): string[] {
  if (!text) return []

  // 1. Basic normalization of spaces (but keep newlines for now)
  let processed = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ') // Only non-newline whitespace
    .trim()

  // 2. Normalize 4+ messy dots to 1, but preserve 2-3 (ellipses) or etc..
  processed = processed.replace(/\.{4,}/g, '.')

  // 3. Robust Split Regex
  const abbrevs = [
    'Mr',
    'Ms',
    'Mrs',
    'Dr',
    'Prof',
    'Sr',
    'Jr',
    'vs',
    'etc',
    'eg',
    'ie',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const abbrevRegex = `(?<!\\b(?:${abbrevs.join('|')})\\.)`
  const initialRegex = '(?<!\\b[A-Z]\\.)'
  const punctuationRegex = '(?<=[.!?]["\')\\]]*)'

  // The split pattern matches:
  // A) Horizontal whitespace(s) following punctuation, IF followed by Capital/Quote/ListMarker or EndOfString
  // B) Newlines (optionally with leading/trailing spaces)

  // Pattern components:
  const spaceAfterPunct = `${abbrevRegex}${initialRegex}${punctuationRegex}\\s+(?=[A-Z"\\-•*\\d])`
  const newlineSplit = '\\s*\\n+\\s*'

  // eslint-disable-next-line security/detect-non-literal-regexp
  const pattern = new RegExp(`(${spaceAfterPunct}|${newlineSplit})`, 'g')

  return (
    processed
      .split(pattern)
      .map((s) => s.trim())
      // Remove split markers and empty strings
      .filter((s) => s && !s.match(/^(\s|\n)+$/))
  )
}
