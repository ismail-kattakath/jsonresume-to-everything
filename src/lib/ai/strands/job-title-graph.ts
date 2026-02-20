import { Agent } from '@strands-agents/sdk'
import { createModel } from './factory'
import type { AgentConfig } from './types'
import type { ResumeData } from '@/types'
import type { StreamCallback } from '@/types/openai'

/**
 * Job Title Generation Graph
 * Multi-agent system for generating clean, professional job titles
 *
 * Agents:
 * 1. Analyst - Extracts key role info from resume and JD
 * 2. Writer - Generates concise job title (no markdown)
 * 3. Reviewer - Validates format and quality
 */

const MAX_ITERATIONS = 3

/**
 * Generates a clean, professional job title based on resume data and job description.
 */
export async function generateJobTitleGraph(
  resumeData: ResumeData,
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  const model = createModel(config)

  // Agent 1: Analyst - Extract key role information
  const analyst = new Agent({
    model,
    systemPrompt: `You are analyzing a job description to extract the core role title.

Extract:
1. The primary role/title mentioned in the JD
2. Seniority level (e.g., Senior, Lead, Staff, Principal)
3. Key domain/specialty (e.g., AI, Platform, Backend, Frontend)

Respond with a brief analysis (2-3 sentences) of what the ideal job title should convey.`,
    printer: false,
  })

  const analystInput = `Job Description:
${jobDescription}

Resume Summary:
${resumeData.summary || 'Not provided'}

Recent Experience:
${
  resumeData.workExperience
    ?.slice(0, 2)
    .map((exp) => `${exp.position} at ${exp.organization}`)
    .join('\n') || 'Not provided'
}`

  onProgress?.({ content: 'Analyzing job requirements...', done: false })
  const analysisResult = await analyst.invoke(analystInput)
  const analysis = analysisResult.toString()

  // Agent 2: Writer - Generate clean job title
  const writer = new Agent({
    model,
    systemPrompt: `You are a professional resume writer creating a job title.

CRITICAL RULES:
1. Output ONLY the job title - nothing else
2. NO markdown formatting (no **, *, _, etc.)
3. NO explanations or additional text
4. Keep it concise (2-5 words typically)
5. Use proper capitalization (Title Case)
6. Match the seniority and domain from the analysis

Examples of GOOD output:
Senior AI Platform Engineer
Lead Backend Developer
Staff Software Engineer
Principal Data Scientist

Examples of BAD output:
**Senior AI Platform Engineer** (has markdown)
Senior AI Platform Engineer - A role focused on... (has explanation)
senior ai platform engineer (wrong capitalization)`,
    printer: false,
  })

  onProgress?.({ content: 'Crafting job title...', done: false })
  const writerResult = await writer.invoke(`Analysis:\n${analysis}\n\nGenerate the job title now:`)
  let jobTitle = writerResult.toString().trim()

  // Agent 3: Reviewer - Validate and clean
  const reviewer = new Agent({
    model,
    systemPrompt: `You are reviewing a generated job title for quality and format.

Validation Checklist:
1. **NO MARKDOWN**: Must not contain **, *, _, ~~, or \`
2. **CONCISE**: Should be 2-5 words
3. **PROPER CASE**: Title Case (e.g., "Senior AI Engineer" not "senior ai engineer")
4. **NO EXTRAS**: No explanations, punctuation, or additional text
5. **PROFESSIONAL**: Sounds like a real job title

If the title passes ALL checks, respond "APPROVED".
If it fails ANY check, respond "CRITIQUE: <specific issue>" and provide the CORRECTED title on the next line.

Example responses:
APPROVED

or

CRITIQUE: Contains markdown formatting
Senior AI Platform Engineer`,
    printer: false,
  })

  let iteration = 0
  while (iteration < MAX_ITERATIONS) {
    onProgress?.({ content: 'Validating job title...', done: false })
    const reviewResult = await reviewer.invoke(`Generated Job Title:\n"${jobTitle}"`)
    const review = reviewResult.toString().trim()

    if (review.startsWith('APPROVED')) {
      break
    }

    if (review.includes('CRITIQUE:')) {
      // Extract corrected title (should be on the line after CRITIQUE)
      const lines = review.split('\n')
      const correctedTitle = lines.slice(1).join('\n').trim()

      if (correctedTitle && correctedTitle !== jobTitle) {
        jobTitle = correctedTitle
        iteration++
      } else {
        // If no correction provided, break to avoid infinite loop
        break
      }
    } else {
      break
    }
  }

  // Final cleanup: strip any remaining markdown
  const cleanTitle = jobTitle
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .trim()

  onProgress?.({ content: 'Job title generated!', done: true })
  return cleanTitle
}
