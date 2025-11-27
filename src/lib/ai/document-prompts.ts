import type { ResumeData } from '@/types'

/**
 * Builds a prompt for AI professional summary generation
 * Combines resume data with job description to create tailored summary
 */
export function buildSummaryPrompt(
  resumeData: ResumeData,
  jobDescription: string
): string {
  const { name, position, summary, workExperience, skills } = resumeData

  console.log('Building summary prompt with resume data:', {
    name,
    position,
    experienceCount: workExperience?.length || 0,
    skillsCount: skills?.length || 0,
  })

  // Calculate total years of experience
  const firstJobYear = workExperience?.[workExperience.length - 1]?.startDate
    ? new Date(
        workExperience[workExperience.length - 1].startDate
      ).getFullYear()
    : null
  const yearsExperience = firstJobYear
    ? new Date().getFullYear() - firstJobYear
    : null

  // Build comprehensive work experience with ALL achievements
  const experienceSummary =
    workExperience
      ?.map((exp) => {
        const achievements = exp.keyAchievements
          ?.map((a) => a.text)
          .filter(Boolean)
          .join('\n')

        return `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'}):\n${achievements}`
      })
      .filter(Boolean)
      .join('\n\n') || 'No work experience provided'

  // Build comprehensive skills list (all skills, organized by category)
  const skillsList =
    skills
      ?.map(
        (group) =>
          `${group.name}: ${group.skills.map((s) => s.text).join(', ')}`
      )
      .join('\n') || 'No skills provided'

  const prompt = `You are an expert tech recruiter and senior engineer who writes extremely concise, technically accurate, and high-impact professional summaries.

CANDIDATE'S COMPLETE JSON RESUME:

Name: ${name}
Current Role: ${position}
Total Experience: ${yearsExperience ? `${yearsExperience}+ years` : 'Not specified'}

COMPLETE WORK HISTORY (chronological):
${experienceSummary}

ALL TECHNICAL SKILLS (by category):
${skillsList}

CURRENT PROFESSIONAL SUMMARY (reference for style and length):
${summary}

TARGET JOB DESCRIPTION:
${jobDescription}

YOUR TASK:
Write a professional summary that positions ${name} as the IDEAL candidate for this specific role.

CRITICAL INSTRUCTIONS - READ CAREFULLY:

1. ACCURACY (Non-negotiable):
   • Use ONLY information explicitly stated in the resume above
   • Every achievement, metric, skill, company, and technology MUST appear verbatim in the data
   • If the job requires something not in the resume, DO NOT claim it—focus on relevant strengths
   • Years of experience: Use "${yearsExperience ? `${yearsExperience}+ years` : 'extensive'}" (never less)

2. JOB ALIGNMENT (Critical):
   • Study the job description's exact language and mirror it naturally
   • Identify the TOP 3-4 requirements and lead with matching achievements
   • Use storytelling: "Led [specific project] at [company], transforming [problem] into [result with metric]"
   • Emphasize soft skills mentioned in job description (e.g., "customer-obsessed", "pragmatic", "end-to-end ownership")

3. CONTENT PRIORITIZATION:
   • Lead with career span and strongest technical fit matching the job (e.g., "15+ years delivering full-stack React/Next.js solutions")
   • Feature 2-3 narrative achievements that DIRECTLY align with job requirements
   • Prioritize achievements by relevance: Frontend/UI work > Full-stack projects > Backend/Infrastructure
   • Use impressive user-scale metrics: "100,000+ users" or "hundreds of thousands" (never "thousands")
   • De-emphasize or omit impressive but irrelevant work (e.g., GPU clusters for a frontend role)
   • End with forward-looking capabilities that directly address job needs

4. WRITING STYLE:
   • Natural, flowing prose with personality—NOT a tech-spec list
   • Single paragraph format (semicolons for major transitions, commas for flow)
   • Use active, confident language: "Led", "Architected", "Transformed", "Known for"
   • Balance technical precision with human readability
   • CRITICAL LENGTH REQUIREMENT: MAXIMUM 1200 characters (HARD LIMIT - will be truncated if exceeded)
   • Aim for 1150-1200 characters for optimal impact while staying under limit
   • Count characters as you write - every letter, space, and punctuation counts

4b. VOICE/TONE (CRITICAL - Resume Format):
   • ALWAYS use third-person or implied third-person voice (professional resume style)
   • NEVER use first-person pronouns: NO "I", "my", "me", "I'm"
   • ✅ CORRECT: "Led team of 5 engineers", "Architected scalable systems", "Known for customer focus"
   • ❌ WRONG: "I led a team", "I architect systems", "I'm known for customer focus"
   • This is a RESUME summary, not a LinkedIn bio—maintain professional detachment

5. WHAT TO AVOID:
   ❌ First-person pronouns (I, my, me, I'm) - ALWAYS use third-person voice
   ❌ Opening with generic role titles without context
   ❌ Listing technologies in comma-separated lists at the end
   ❌ Emphasizing irrelevant achievements (even if impressive—e.g., GPU/CUDA optimization for a UI role)
   ❌ Robotic, resume-speak tone ("proficient in", "skilled at")
   ❌ Backend/infrastructure focus when job emphasizes frontend/UI (de-prioritize vLLM, Kubernetes, CUDA)
   ❌ Underselling user scale (say "100,000+" or "hundreds of thousands", not "thousands")
   ❌ Over-emphasizing authentication complexity (OAuth 2.0 PKCE/SAML 2.0 technical details) unless job requires it
   ❌ Using absolute metrics when percentage improvements are more impressive (use "92% faster" not "20 minutes")

EXAMPLE STRUCTURE (adapt to candidate's actual data):
"[Role] with [X]+ years [key specialty matching job]. Led [specific high-impact project] at [company], [transforming context] into [result] serving [100,000+ users or hundreds of thousands] with [reliability metric]. Expert at [job's core requirement]—[specific example with outcome]. [Additional relevant achievement]. [Brief mention of current role if relevant to job]. Deep expertise in [job-critical frontend/full-stack skills]. Known for [soft skills from job description that match resume evidence]."

CRITICAL REMINDERS FOR THIS SPECIFIC JOB:
• Supademo is a frontend-focused role (React/Next.js) → Lead with frontend migration/UI work
• Job emphasizes "greenfield", "polished UI", "customer-obsessed", "end-to-end ownership", "scope → design → build → launch"
• De-emphasize backend infrastructure (GenAI, Kubernetes, vLLM, CUDA) even if recent/impressive
• De-emphasize authentication complexity (OAuth/SAML) unless job explicitly requires it
• Emphasize stakeholder collaboration, wireframing, prototyping (matches job's "Partner with customers")
• Use percentage-based metrics when available (92% deployment reduction > 20-minute cycles)
• Homewood Health experience is MOST relevant (Next.js migration, 100,000+ users, DevOps excellence)
• Etuper experience adds value (stakeholder collaboration, wireframes, prototypes)
• Current role (Silver Creek) should be mentioned briefly but not dominate

OUTPUT REQUIREMENTS:
• Return ONLY the professional summary as plain text (no formatting, no code blocks, no preamble)
• ABSOLUTE MAXIMUM: 1200 characters (this is a HARD limit - anything longer will be truncated)
• Verify character count before returning - count every character including spaces and punctuation
• If approaching 1200 chars, prioritize most relevant content and remove less critical details`

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
  if (content.length < 100) {
    errors.push('Summary is too short (minimum 100 characters)')
  }

  // Check maximum length (informational warning only)
  if (content.length > 1200) {
    errors.push(
      `Summary exceeds 1200 character limit (${content.length} chars) - may not fit in resume layout`
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

        return `${exp.position} at ${exp.company}: ${achievements}`
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
