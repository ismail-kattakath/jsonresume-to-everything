import type { ResumeData } from '@/types'

/**
 * Builds a prompt for AI skills to highlight generation
 * Analyzes job description to extract key technical skills and keywords
 */
export function buildSkillsToHighlightPrompt(jobDescription: string): string {
  const prompt = `You are an expert technical recruiter and resume optimizer.

TARGET JOB DESCRIPTION:
${jobDescription}

YOUR TASK:
Identify ALL technical skills, technologies, and keywords mentioned in the Job Description above.

CRITICAL INSTRUCTIONS:
1. Extract ONLY skills that are explicitly mentioned or strongly implied in the Job Description.
2. Focus on HARD technical skills (languages, frameworks, tools, platforms, databases).
3. Include domain-specific keywords (e.g., "distributed systems", "microservices", "cloud architecture").
4. Use proper professional branding and casing for all technologies (e.g., "Next.js", "JavaScript", "TypeScript", "Node.js").
5. DO NOT include any skills that are NOT mentioned in the Job Description.
6. Keep the output as a simple comma-separated list.
7. DO NOT include introductory text, explanations, or bullets.
8. Maximize relevance: limit to the top 15-20 key terms.
9. Use standard naming conventions (e.g., "React" instead of "React.js library").

OUTPUT: Return ONLY the comma-separated list of skills.`

  return prompt
}
