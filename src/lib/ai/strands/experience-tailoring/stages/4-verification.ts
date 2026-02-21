import { StreamCallback } from '@/types/openai'
import { TailoringAgents } from '@/lib/ai/strands/experience-tailoring/agents'

/**
 *
 */
export interface VerificationStageInput {
  jobDescription: string
  originalDescription: string
  originalAchievements: string[]
  rewrittenDescription: string
  rewrittenAchievements: string[]
  analysis: string
}

/**
 * Stage 4: Run fact checker and relevance evaluator, and refine description if needed.
 */
export async function runVerificationStage(
  agents: TailoringAgents,
  input: VerificationStageInput,
  onProgress?: StreamCallback
): Promise<string> {
  const { jobDescription, originalDescription, originalAchievements, rewrittenAchievements, analysis } = input

  let currentDescription = input.rewrittenDescription

  // Stage 4a: Fact checking loop (max 2 iterations)
  onProgress?.({ content: 'Validating factual accuracy...', done: false })

  const maxFactCheckIterations = 2
  for (let i = 0; i < maxFactCheckIterations; i++) {
    const factCheckPrompt =
      `Original Description: ${originalDescription}\nRewritten Description: ${currentDescription}\n\n` +
      `Original Achievements:\n${originalAchievements.join('\n')}\n\n` +
      `Rewritten Achievements:\n${rewrittenAchievements.join('\n')}`

    const factCheckResult = await agents.factChecker.invoke(factCheckPrompt)
    const factCheckText = factCheckResult.toString().trim()

    if (factCheckText.startsWith('APPROVED')) {
      break
    } else if (i < maxFactCheckIterations - 1) {
      // Use critique to refine
      const descriptionPrompt = `Analysis:\n${analysis}\n\nOriginal Description:\n${originalDescription}\n\nJob Description:\n${jobDescription}`
      const refinementPrompt = `${descriptionPrompt}\n\nFact Check Feedback: ${factCheckText}\n\nPlease revise to address these concerns.`
      const refinedResult = await agents.descriptionWriter.invoke(refinementPrompt)
      currentDescription = refinedResult.toString().trim()
    }
  }

  // Stage 4b: Relevance evaluation loop (max 2 iterations)
  onProgress?.({ content: 'Evaluating alignment quality...', done: false })

  const maxRelevanceIterations = 2
  for (let i = 0; i < maxRelevanceIterations; i++) {
    const relevancePrompt =
      `Job Description:\n${jobDescription}\n\n` +
      `Rewritten Content:\nDescription: ${currentDescription}\nAchievements:\n${rewrittenAchievements.join('\n')}`

    const relevanceResult = await agents.relevanceEvaluator.invoke(relevancePrompt)
    const relevanceText = relevanceResult.toString().trim()

    if (relevanceText.startsWith('APPROVED')) {
      break
    } else if (i < maxRelevanceIterations - 1) {
      // Use critique to enhance relevance
      const descriptionPrompt = `Analysis:\n${analysis}\n\nOriginal Description:\n${originalDescription}\n\nJob Description:\n${jobDescription}`
      const enhancementPrompt = `${descriptionPrompt}\n\nRelevance Feedback: ${relevanceText}\n\nPlease enhance to better highlight JD alignment.`
      const enhancedResult = await agents.descriptionWriter.invoke(enhancementPrompt)
      currentDescription = enhancedResult.toString().trim()
    }
  }

  return currentDescription
}
