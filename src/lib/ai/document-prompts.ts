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

/**
 * Builds a comprehensive prompt for AI cover letter generation
 * Combines resume data with job description to create tailored content
 */
export function buildCoverLetterPrompt(
  resumeData: ResumeData,
  jobDescription: string
): string {
  // Extract key information from resume
  const { name, position, summary, workExperience, skills } = resumeData

  console.log('Building prompt with resume data:', {
    name,
    position,
    summaryLength: summary?.length || 0,
    experienceCount: workExperience?.length || 0,
    skillsCount: skills?.length || 0,
  })

  // Build work experience summary
  const experienceSummary =
    workExperience
      ?.slice(0, 3) // Use top 3 most recent experiences
      .map((exp) => {
        const achievements = exp.keyAchievements
          ?.map((a) => a.text)
          .filter(Boolean)
          .slice(0, 3) // Top 3 achievements per job
          .join('; ')

        return `${exp.position} at ${exp.organization}: ${achievements}`
      })
      .filter(Boolean)
      .join('\n\n') || 'No work experience provided'

  // Build skills summary
  const skillsList =
    skills
      ?.flatMap((group) => group.skills.map((s) => s.text))
      .slice(0, 15) // Top 15 skills
      .join(', ') || 'No skills provided'

  console.log('Prompt data prepared:', {
    experienceSummaryLength: experienceSummary.length,
    skillsListLength: skillsList.length,
  })

  // Build the prompt
  const prompt = `You are a professional cover letter writer with expertise in crafting concise, job-tailored cover letters that mirror target role language and prioritize relevant experience.

CANDIDATE INFORMATION:
Name: ${name}
Current Role: ${position}

Professional Summary:
${summary}

Key Experience:
${experienceSummary}

Technical Skills: ${skillsList}

JOB DESCRIPTION:
${jobDescription}

CRITICAL REQUIREMENTS - YOU MUST FOLLOW THESE EXACTLY:
1. ONLY mention qualifications, skills, and experiences that are explicitly listed in the candidate information above
2. DO NOT invent, assume, or fabricate ANY qualifications, certifications, or experiences not shown above
3. DO NOT claim the candidate has skills not listed in their technical skills
4. DO NOT reference companies, positions, or achievements not mentioned in their experience
5. If the job requires something the candidate doesn't have, DO NOT claim they have it - focus on what they DO have
6. Use ONLY the specific metrics, achievements, and details provided in the candidate's experience

WRITING INSTRUCTIONS:
1. Write a professional cover letter that is 3-4 paragraphs long (250-350 words target, prioritize conciseness)
2. Start with a strong opening that shows enthusiasm and alignment with the role
3. Mirror exact phrases and language from the job description naturally throughout the letter
4. Prioritize achievements by relevance to the job requirements (lead with most relevant experience first)
5. Highlight 2-3 relevant achievements from the candidate's ACTUAL experience that match the job requirements
6. Use ONLY the specific metrics and examples from the candidate's background provided above
7. Demonstrate how the candidate's DOCUMENTED skills and experience solve the employer's needs
8. If job emphasizes specific values or culture (e.g., "customer-obsessed", "greenfield", "pragmatic tradeoffs"), explicitly tie candidate's experience to these values
9. End with a confident call-to-action
10. Use a professional yet personable tone (first-person voice is appropriate for cover letters)
11. DO NOT include a salutation (no "Dear Hiring Manager") or signature (no "Sincerely, ${name}")
12. DO NOT include placeholders like [Company Name] - infer from job description or omit
13. Write ONLY the body content of the cover letter

CONTENT PRIORITIZATION:
- Analyze the job description to identify the TOP 3-4 requirements
- Lead with the candidate's experience that MOST directly matches these requirements
- De-emphasize impressive but less relevant work (even if recent or technically impressive)
- Use job-specific terminology and exact phrases from the job description
- Emphasize soft skills and cultural fit mentioned in the job description

ACCURACY VERIFICATION:
Before writing each sentence, verify that ANY claim about the candidate's background is explicitly stated in the candidate information above. If you cannot find it in the provided information, DO NOT include it.

OUTPUT FORMAT:
Return ONLY the cover letter content as plain text, without any additional formatting, markdown, or explanations.`

  return prompt
}

/**
 * Validates the generated cover letter content
 * Ensures it meets minimum quality standards and doesn't contain fabrications
 */
export function validateCoverLetter(content: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check minimum length (should be at least 200 characters)
  if (content.length < 200) {
    errors.push('Cover letter is too short')
  }

  // Check maximum length (should not exceed 2000 characters)
  if (content.length > 2000) {
    errors.push('Cover letter is too long')
  }

  // Check for common placeholder issues
  const placeholders = [
    '[Company Name]',
    '[Your Name]',
    '[Position]',
    'Dear Hiring Manager',
    'Sincerely,',
    'Best regards,',
  ]

  for (const placeholder of placeholders) {
    if (content.includes(placeholder)) {
      errors.push(`Contains placeholder: ${placeholder}`)
    }
  }

  // Check for suspicious patterns that might indicate fabrication
  const suspiciousPatterns = [
    /certified in/i,
    /degree in(?! Computer Science)/i, // Allow only CS degree if explicitly in resume
    /licensed to/i,
    /awarded (the|a)/i,
    /published in/i,
    /patent for/i,
    /I have \d+ years/i, // Avoid specific year claims not in resume
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      // This is a warning, not a hard error
      // We don't add to errors but log it
      console.warn(`Cover letter may contain unverified claim: ${pattern}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Post-processes the generated cover letter
 * Cleans up formatting and ensures consistency
 */
export function postProcessCoverLetter(content: string): string {
  let processed = content.trim()

  // Remove any leading/trailing quotes that AI might add
  processed = processed.replace(/^["']|["']$/g, '')

  // Normalize line breaks (ensure double line breaks between paragraphs)
  processed = processed.replace(/\n{3,}/g, '\n\n')

  // Remove any markdown formatting that might slip through
  processed = processed.replace(/\*\*/g, '')
  processed = processed.replace(/\*/g, '')
  processed = processed.replace(/#{1,6}\s/g, '')

  return processed.trim()
}
