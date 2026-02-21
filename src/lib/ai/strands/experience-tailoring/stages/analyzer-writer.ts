import { StreamCallback } from '@/types/openai'
import { TailoringAgents } from '@/lib/ai/strands/experience-tailoring/agents'
import { runAgentStream } from '@/lib/ai/strands/experience-tailoring/utils'
import { TailoringInvocationState } from '@/lib/ai/strands/experience-tailoring/types'

/**
 * Stage 1: Analyze alignment potential and rewrite the description.
 */
export async function runAnalyzerStage(
  agents: TailoringAgents,
  state: TailoringInvocationState,
  onProgress?: StreamCallback
): Promise<void> {
  const { jobDescription, position, organization, originalDescription, originalAchievements } = state

  // Stage 1a: Analyze alignment potential
  onProgress?.({ content: 'Analyzing job requirements...', done: false })
  const analysisPrompt = `Job Description:\n${jobDescription}\n\nPosition: ${position}\nOrganization: ${organization}\nDescription: ${originalDescription}\nAchievements:\n${originalAchievements.join('\n')}`
  state.analysis = await runAgentStream(await agents.analyzer.stream(analysisPrompt), onProgress, 'Analyzing')

  onProgress?.({ content: 'Tailoring description...', done: false })
  // Stage 1b: Rewrite description
  const descriptionPrompt = `Analysis:\n${state.analysis}\n\nOriginal Description:\n${originalDescription}\n\nJob Description:\n${jobDescription}`
  state.rewrittenDescription = await runAgentStream(
    await agents.descriptionWriter.stream(descriptionPrompt),
    onProgress,
    'Writing Description'
  )
}
