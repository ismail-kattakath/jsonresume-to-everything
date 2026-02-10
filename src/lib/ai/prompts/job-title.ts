import type { ResumeData } from '@/types'

/**
 * Builds a prompt for AI job title generation
 * Analyzes job description and candidate's background to suggest appropriate job title
 */
export function buildJobTitlePrompt(
  resumeData: ResumeData,
  jobDescription: string
): string {
  const { position, workExperience, skills } = resumeData

  // Extract recent positions
  const recentPositions =
    workExperience
      ?.slice(0, 3)
      .map((exp) => exp.position)
      .join(', ') || 'No experience provided'

  // Extract key skills
  const keySkills =
    skills
      ?.flatMap((group) => group.skills.map((s) => s.text))
      .slice(0, 10)
      .join(', ') || 'No skills provided'

  const prompt = `You are an expert recruiter specializing in job title optimization for resumes.

CANDIDATE'S BACKGROUND:
Current Title: ${position}
Recent Positions: ${recentPositions}
Key Skills: ${keySkills}

TARGET JOB DESCRIPTION:
${jobDescription}

YOUR TASK:
Generate a single, concise job title that positions the candidate optimally for this specific role.

CRITICAL INSTRUCTIONS:
1. Analyze the job description to identify the EXACT title or key role terminology used
2. Mirror the job description's language and seniority level (e.g., "Senior", "Lead", "Principal", "Staff")
3. Use only standard, professional job titles that match the candidate's experience level
4. DO NOT invent titles or use overly creative language
5. Keep it concise: 2-6 words maximum (e.g., "Senior Full Stack Engineer", "Lead Product Designer")
6. If the job title in the description is clear, use it (or a close variant) directly
7. Match the domain/specialization mentioned in the job (Frontend, Backend, Full Stack, DevOps, etc.)

EXAMPLES OF GOOD TITLES:
- "Senior Software Engineer"
- "Lead Frontend Developer"
- "Principal Full Stack Engineer"
- "Staff Software Engineer"
- "Senior React Developer"
- "Engineering Manager"

WHAT TO AVOID:
❌ Generic titles that don't match the job ("Software Developer" for a Senior role)
❌ Overly specific titles with too many qualifications ("Senior Full Stack React/Node.js Cloud Engineer")
❌ Creative or non-standard titles ("Code Wizard", "Tech Ninja", "Solutions Architect III")
❌ Mismatched seniority levels (claiming "Principal" when experience suggests "Senior")

OUTPUT REQUIREMENTS:
- Return ONLY the job title as plain text (no quotes, no formatting, no explanation)
- Maximum 60 characters
- Title case (each major word capitalized)
- No periods or special characters at the end`

  return prompt
}

/**
 * Validates the generated job title
 */
export function validateJobTitle(title: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check minimum length
  if (title.length < 3) {
    errors.push('Job title is too short')
  }

  // Check maximum length
  if (title.length > 60) {
    errors.push('Job title exceeds 60 character limit')
  }

  // Check for suspicious patterns
  if (title.includes('[') || title.includes(']')) {
    errors.push('Job title contains placeholder brackets')
  }

  // Check for quotes
  if (title.startsWith('"') || title.startsWith("'")) {
    errors.push('Job title should not include quotes')
  }

  // Check for multiple lines
  if (title.includes('\n')) {
    errors.push('Job title should be a single line')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Post-processes the generated job title
 */
export function postProcessJobTitle(title: string): string {
  let processed = title.trim()

  // Remove leading quotes
  while (processed.startsWith('"') || processed.startsWith("'")) {
    processed = processed.substring(1).trim()
  }

  // Remove trailing quotes
  while (processed.endsWith('"') || processed.endsWith("'")) {
    processed = processed.substring(0, processed.length - 1).trim()
  }

  // Remove trailing periods
  processed = processed.replace(/\.+$/, '').trim()

  // Remove any remaining trailing quotes after period removal
  while (processed.endsWith('"') || processed.endsWith("'")) {
    processed = processed.substring(0, processed.length - 1).trim()
  }

  // Ensure proper capitalization (title case)
  processed = processed.replace(/\b\w/g, (char) => char.toUpperCase())

  return processed.trim()
}
