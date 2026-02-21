import { StreamCallback } from '@/types/openai'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createJDRefinementAgents } from '@/lib/ai/strands/jd-refinement/agents'

export * from '@/lib/ai/strands/jd-refinement/types'

/**
 * A multi-agent graph flow that refines a job description through iterative feedback.
 * Uses a Refiner agent and a Reviewer agent.
 *
 * @param jobDescription - The raw job description text
 * @param config - Provider configuration from AISettings
 * @param onProgress - Optional callback for streaming updates and status messages
 * @returns The finalized, refined job description text
 */
export async function analyzeJobDescriptionGraph(
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  const agents = createJDRefinementAgents(config)

  let currentJD = jobDescription
  let iteration = 0
  const maxIterations = 2 // 1 initial refine + up to 2 review/refine loops

  onProgress?.({ content: 'Analyzing job description...', done: false })

  while (iteration <= maxIterations) {
    iteration++

    // Node: Refine
    onProgress?.({ content: 'Refining job description...', done: false })

    const refinePrompt =
      iteration === 1
        ? `Original Job Description:\n\n${currentJD}`
        : `Please refine the JD again based on these critiques:\n\n${currentJD}`

    const refineResult = await agents.refiner.invoke(refinePrompt)
    currentJD = refineResult.toString().trim()

    // Node: Review
    onProgress?.({ content: 'Validating format...', done: false })

    const reviewResult = await agents.reviewer.invoke(`Review this Job Description:\n\n${currentJD}`)
    const reviewText = reviewResult.toString().trim()

    if (reviewText.startsWith('APPROVED')) {
      break
    } else {
      // Append critiques to guide the next refinement
      currentJD = `Refined JD:\n${currentJD}\n\nCritiques from Reviewer:\n${reviewText}`
    }

    if (iteration > maxIterations) {
      break
    }
  }

  // Strip the internal wrapping if any
  const finalJD = (currentJD.replace('Refined JD:\n', '').split('\n\nCritiques from Reviewer:')[0] || '').trim()

  if (onProgress) onProgress({ content: '', done: true })
  return finalJD
}
