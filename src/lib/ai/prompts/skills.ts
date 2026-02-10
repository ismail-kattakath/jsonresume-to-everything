import type { ResumeData } from '@/types'

/**
 * Builds a prompt for AI skills to highlight generation
 * Analyzes job description to extract key technical skills and keywords
 */
export function buildSkillsToHighlightPrompt(
  resumeData: ResumeData,
  jobDescription: string
): string {
  const { skills } = resumeData

  // Build flat skills list for context
  const candidateSkills =
    skills?.flatMap((group) => group.skills.map((s) => s.text)).join(', ') ||
    'No skills provided'

  const prompt = `You are an expert technical recruiter and resume optimizer.

CANDIDATE'S CURRENT SKILLS:
${candidateSkills}

TARGET JOB DESCRIPTION:
${jobDescription}

YOUR TASK:
Identify the most important technical skills, technologies, and keywords from the job description that the candidate should highlight in their resume.

CRITICAL INSTRUCTIONS:
1. Focus on HARD technical skills (languages, frameworks, tools, platforms)
2. Include domain-specific keywords (e.g., "distributed systems", "microservices", "cloud architecture")
3. Use proper professional branding and casing for all technologies (e.g., use "Next.js" even if JD says "NextJS", "JavaScript" instead of "javascript", "TypeScript" instead of "Typescript", "node.js" or "Node.js").
4. Prioritize skills that appear in BOTH the candidate's portfolio and the job description
5. Also include critical skills from the JD that are essential for the role even if not explicitly in the candidate's list (to serve as a guide)
6. Keep the output as a simple comma-separated list
7. DO NOT include introductory text, explanations, or bullets
8. Maximize relevance: limit to the top 15-20 key terms
9. Use standard naming conventions (e.g., "React" instead of "React.js library")

OUTPUT: Return ONLY the comma-separated list of skills.`

  return prompt
}
