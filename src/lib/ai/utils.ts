/**
 * Validates if the provided text is a valid job description
 */
export function validateJobDescription(text: string): boolean {
  const MIN_JD_LENGTH = 100
  if (!text) return false
  return text.trim().length >= MIN_JD_LENGTH
}
