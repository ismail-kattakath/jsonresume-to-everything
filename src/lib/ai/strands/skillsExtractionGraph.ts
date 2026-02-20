import { Agent } from '@strands-agents/sdk'
import { StreamCallback } from '@/types/openai'
import { AgentConfig } from './types'
import { createModel } from './factory'

/**
 * Single-agent graph that extracts key skills from a Job Description.
 */
export async function extractSkillsGraph(
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  const model = createModel(config)

  const extractor = new Agent({
    model,
    systemPrompt:
      'You are a Technical Skill Extractor.\n\n' +
      'YOUR TASK: Identify all technical skills, technologies, and keywords mentioned in the JD.\n\n' +
      'RULES:\n' +
      '1. Extract HARD skills (languages, frameworks, tools, platforms).\n' +
      '2. Use professional branding (e.g., "Next.js", "TypeScript").\n' +
      '3. Output ONLY a comma-separated list.\n' +
      '4. Limit to top 15-20 terms.\n' +
      '5. NO introductory text or explanations.',
    printer: false,
  })

  const verifier = new Agent({
    model,
    systemPrompt:
      'You are a Technical Skill Verifier.\n\n' +
      'YOUR TASK: Review a list of extracted skills against a job description and ensure accuracy.\n\n' +
      'RULES:\n' +
      '1. Remove any terms that are NOT technical skills (e.g., "years", "experience", "excellent").\n' +
      '2. Ensure standard naming conventions.\n' +
      '3. Add any CRITICAL missing technical skills found in the JD.\n' +
      '4. Output ONLY the final comma-separated list.',
    printer: false,
  })

  if (onProgress) onProgress({ content: 'Extracting key skills from JD...', done: false })

  const extractionResult = await extractor.invoke(`Extract skills from this JD: ${jobDescription}`)
  const extractedSkills = extractionResult.toString().trim()

  if (onProgress) onProgress({ content: 'Verifying skill accuracy...', done: false })

  const verificationResult = await verifier.invoke(
    `Job Description: ${jobDescription}\n\nExtracted Skills: ${extractedSkills}\n\nProvide the verified list:`
  )

  if (onProgress) onProgress({ content: 'Skills extracted and verified!', done: true })

  return verificationResult.toString().trim()
}
