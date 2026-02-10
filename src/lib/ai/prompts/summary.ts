import type { ResumeData } from '@/types'

/**
 * Builds a prompt for AI professional summary generation
 * Uses example-based approach for better length control and JD alignment
 */
export function buildSummaryPrompt(
  resumeData: ResumeData,
  jobDescription: string
): string {
  const { name, position, workExperience, skills } = resumeData

  console.log('Building summary prompt with resume data:', {
    name,
    position,
    experienceCount: workExperience?.length || 0,
    skillsCount: skills?.length || 0,
  })

  // Calculate total years of experience
  const lastJob = workExperience?.[workExperience.length - 1]
  const firstJobYear = lastJob?.startYear
    ? new Date(lastJob.startYear).getFullYear()
    : null
  const yearsExperience = firstJobYear
    ? new Date().getFullYear() - firstJobYear
    : null

  // Build flat skills list for anti-fabrication (only use these skills)
  const allSkills =
    skills?.flatMap((group) => group.skills.map((s) => s.text)).join(', ') ||
    'No skills provided'

  // Extract top 3 achievements with metrics from recent experience
  const topAchievements =
    workExperience
      ?.slice(0, 3)
      .flatMap((exp) =>
        exp.keyAchievements
          ?.filter((a) => /\d+%|\d+ (hours?|minutes?|users?)/.test(a.text))
          .slice(0, 2)
          .map((a) => `• ${a.text}`)
      )
      .filter(Boolean)
      .slice(0, 4)
      .join('\n') || 'No achievements provided'

  // Get current position info
  const currentRole = workExperience?.[0]
    ? `${workExperience[0].position} at ${workExperience[0].organization}`
    : position

  const prompt = `Write a 3-4 sentence professional summary following this EXACT format and length.

EXAMPLE (490 chars - use this as your length target):
Senior Backend Engineer with 12+ years building distributed systems and AI integrations. Architected scalable inference pipelines achieving 35% latency improvements. Led cloud migrations and CI/CD automation reducing deployment time 80%. Expert in Python, Node.js, Kubernetes, and AWS. Proven track record shipping production ML systems.

NOW WRITE FOR THIS CANDIDATE:

CANDIDATE PROFILE:
- Name: ${name}
- Experience: ${yearsExperience ? `${yearsExperience}+` : 'extensive'} years
- Current: ${currentRole}

KEY ACHIEVEMENTS (pick 2-3 most relevant to the JD):
${topAchievements}

ALLOWED SKILLS (use ONLY these - do NOT invent technologies):
${allSkills}

TARGET JOB (align summary to this):
${jobDescription.slice(0, 1500)}

STRICT RULES:
1. 400-550 characters MAXIMUM (count before responding)
2. Third-person voice only (no "I", "my", "me")
3. ONLY use skills/technologies from the ALLOWED SKILLS list - this is non-negotiable
4. If a JD technology isn't in allowed skills, substitute the closest match from allowed skills
5. Single paragraph, 3-4 sentences
6. Lead with a role title that matches the JD

OUTPUT: Return ONLY the summary text, no quotes or extra formatting.`

  return prompt
}

/**
 * Validates the generated summary content
 * Note: Validation is informational only - AI output is never modified/truncated
 */
export function validateSummary(content: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check minimum length
  if (content.length < 50) {
    errors.push('Summary is too short (minimum 50 characters)')
  }

  // Check maximum length (informational warning only)
  if (content.length > 600) {
    errors.push(
      `Summary exceeds 600 character limit (${content.length} chars) - may not fit in resume layout`
    )
  }

  // Check for multiple paragraphs (should be single paragraph)
  const paragraphs = content.trim().split(/\n\n+/)
  if (paragraphs.length > 1) {
    errors.push('Summary should be a single paragraph (no line breaks)')
  }

  // Check for first-person pronouns (should be third-person)
  const firstPersonPatterns = [
    /\bI\s/i,
    /\bI'm\b/i,
    /\bmy\b/i,
    /\bme\b/i,
    /\bmyself\b/i,
  ]

  for (const pattern of firstPersonPatterns) {
    if (pattern.test(content)) {
      errors.push(
        'Summary contains first-person pronouns - should use third-person voice'
      )
      break // Only report once
    }
  }

  // Check for suspicious patterns that might indicate fabrication
  const suspiciousPatterns = [
    /certified in/i,
    /degree in(?! Computer Science)/i,
    /licensed to/i,
    /awarded (the|a)/i,
    /published in/i,
    /patent for/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      console.warn(`Summary may contain unverified claim: ${pattern}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
