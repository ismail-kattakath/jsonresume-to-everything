/**
 * Validates that all skills mentioned in the summary exist in the allowed skills list.
 *
 * @param summary - The generated summary text
 * @param allowedSkills - List of valid technology names
 * @returns Object with validation status and list of violating mentions
 */
export function validateSkillsInSummary(summary: string, allowedSkills: string[]) {
  const normalizedAllowed = new Set(allowedSkills.map((s) => s.toLowerCase().trim()))

  const mentions = new Set<string>()
  const patterns = [
    /\b[A-Z][a-zA-Z0-9]+\b/g, // Match single capitalized words
    /\b[A-Z]{2,}\b/g, // Match acronyms
    /\b[a-zA-Z0-9]+\.[a-zA-Z0-9]+\b/g, // Match domains/technical names
  ]

  for (const pattern of patterns) {
    const matches = summary.match(pattern) || []
    matches.forEach((m) => mentions.add(m.toLowerCase()))
  }

  const ignoreList = new Set([
    'the',
    'and',
    'for',
    'with',
    'years',
    'experience',
    'senior',
    'lead',
    'engineer',
    'developer',
    'systems',
    'solutions',
    'scalable',
    'building',
    'expert',
    'specializing',
    'architecting',
    'architected',
    'focusing',
    'align',
    'innovation',
    'impact',
    'production',
  ])
  const violations: string[] = []

  mentions.forEach((mention) => {
    if (mention.length < 3 || ignoreList.has(mention)) return

    const isAllowed = Array.from(normalizedAllowed).some(
      (allowed) => allowed === mention || allowed.includes(mention) || mention.includes(allowed)
    )

    if (!isAllowed) violations.push(mention)
  })

  return {
    valid: violations.length === 0,
    violations,
  }
}
