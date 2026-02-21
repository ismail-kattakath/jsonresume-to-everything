import { StreamCallback } from '@/types/openai'
import { TailoringAgents } from '@/lib/ai/strands/experience-tailoring/agents'
import { runAgentStream } from '@/lib/ai/strands/experience-tailoring/utils'

import { TailoringInvocationState } from '@/lib/ai/strands/experience-tailoring/types'

/**
 * Stage 4: Run fact checker and relevance evaluator, and refine description if needed.
 */
export async function runVerificationStage(
  agents: TailoringAgents,
  state: TailoringInvocationState,
  onProgress?: StreamCallback
): Promise<void> {
  const { jobDescription, rewrittenDescription: originalDescription, finalTechStack: analysis } = state
  const originalAchievements = state.rewrittenAchievements ?? []
  const rewrittenAchievements = state.rewrittenAchievements ?? []

  let currentDescription = state.rewrittenDescription || ''

  // Stage 4a: Fact checking loop (max 2 iterations)
  onProgress?.({ content: 'Validating factual accuracy...', done: false })

  const maxFactCheckIterations = 2
  for (let i = 0; i < maxFactCheckIterations; i++) {
    const factCheckPrompt =
      `Original Description: ${originalDescription}\nRewritten Description: ${currentDescription}\n\n` +
      `Original Achievements:\n${originalAchievements.join('\n')}\n\n` +
      `Rewritten Achievements:\n${rewrittenAchievements.join('\n')}`

    const factCheckText = await runAgentStream(
      await agents.factChecker.stream(factCheckPrompt),
      onProgress,
      'Fact Checking'
    )

    if (factCheckText.startsWith('APPROVED')) {
      break
    } else if (i < maxFactCheckIterations - 1) {
      // Use critique to refine
      const descriptionPrompt = `Analysis:\n${analysis}\n\nOriginal Description:\n${originalDescription}\n\nJob Description:\n${jobDescription}`
      const refinementPrompt = `${descriptionPrompt}\n\nFact Check Feedback: ${factCheckText}\n\nPlease revise to address these concerns.`
      currentDescription = await runAgentStream(
        await agents.descriptionWriter.stream(refinementPrompt),
        onProgress,
        'Refining Description'
      )
    }
  }

  // Stage 4b: Relevance evaluation loop (max 2 iterations)
  onProgress?.({ content: 'Evaluating alignment quality...', done: false })

  const maxRelevanceIterations = 2
  for (let i = 0; i < maxRelevanceIterations; i++) {
    const relevancePrompt =
      `Job Description:\n${jobDescription}\n\n` +
      `Rewritten Content:\nDescription: ${currentDescription}\nAchievements:\n${rewrittenAchievements.join('\n')}`

    const relevanceText = await runAgentStream(
      await agents.relevanceEvaluator.stream(relevancePrompt),
      onProgress,
      'Evaluating Relevance'
    )

    if (relevanceText.startsWith('APPROVED')) {
      break
    } else if (i < maxRelevanceIterations - 1) {
      // Use critique to enhance relevance
      const descriptionPrompt = `Analysis:\n${analysis}\n\nOriginal Description:\n${originalDescription}\n\nJob Description:\n${jobDescription}`
      const enhancementPrompt = `${descriptionPrompt}\n\nRelevance Feedback: ${relevanceText}\n\nPlease enhance to better highlight JD alignment.`
      currentDescription = await runAgentStream(
        await agents.descriptionWriter.stream(enhancementPrompt),
        onProgress,
        'Enhancing Relevance'
      )
    }
  }

  state.rewrittenDescription = currentDescription
}
