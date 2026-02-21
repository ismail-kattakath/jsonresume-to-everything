import { StreamCallback } from '@/types/openai'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createSkillsExtractionAgents } from '@/lib/ai/strands/skills-extraction/agents'

export * from '@/lib/ai/strands/skills-extraction/types'

/**
 * Single-agent graph that extracts key skills from a Job Description.
 */
export async function extractSkillsGraph(
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  const agents = createSkillsExtractionAgents(config)

  if (onProgress) onProgress({ content: 'Extracting key skills from JD...', done: false })

  const extractionResult = await agents.extractor.invoke(`Extract skills from this JD: ${jobDescription}`)
  const extractedSkills = extractionResult.toString().trim()

  if (onProgress) onProgress({ content: 'Verifying skill accuracy...', done: false })

  const verificationResult = await agents.verifier.invoke(
    `Job Description: ${jobDescription}\n\nExtracted Skills: ${extractedSkills}\n\nProvide the verified list:`
  )

  if (onProgress) onProgress({ content: 'Skills extracted and verified!', done: true })

  return verificationResult.toString().trim()
}
