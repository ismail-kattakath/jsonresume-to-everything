import { Agent } from '@strands-agents/sdk'
import { StreamCallback } from '@/types/openai'
import { AgentConfig } from './types'
import { createModel } from './factory'

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
  const model = createModel(config)

  const refiner = new Agent({
    model,
    systemPrompt:
      'You are a Professional JD Refiner. ' +
      'Your goal is to extract and reformat a raw job description into a strict, clean format. ' +
      'RULES:\n' +
      '- NO complex markdown (NO bold, NO italics, NO sub-headers). Use ONLY `#` for titles and `-` for unordered lists.\n' +
      '- Extract or determine the following sections exactly:\n' +
      '  # position-title\n' +
      '  (The job title)\n\n' +
      '  # core-responsibilities\n' +
      '  (Short and crisp list, MAXIMUM 5 items, no repetition)\n\n' +
      '  # desired-qualifications\n' +
      '  (Short and crisp list, MAXIMUM 5 items, no repetition)\n\n' +
      '  # required-skills\n' +
      '  (Technology/tool name list ONLY, e.g., Next.js, Linux, GCP, CI/CD. No full sentences, no extra words. NO maximum limit).\n' +
      'Return ONLY the improved job description text following this structure.',
    printer: false,
  })

  const reviewer = new Agent({
    model,
    systemPrompt:
      'You are a JD Quality Critic. ' +
      'Your task is to strictly review a job description against these criteria:\n' +
      '1. Only `#` and `-` markdown used? (Reject bold/italics).\n' +
      '2. Exactly 4 sections: position-title, core-responsibilities, desired-qualifications, required-skills?\n' +
      '3. Core-responsibilities and Desired-qualifications have <= 5 items?\n' +
      '4. Required-skills is a list of tech names only?\n' +
      'If perfect, start with "APPROVED". Otherwise, list critiques starting with "CRITIQUE:".',
    printer: false,
  })

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

    const refineResult = await refiner.invoke(refinePrompt)
    currentJD = refineResult.toString().trim()

    // Node: Review
    onProgress?.({ content: 'Validating format...', done: false })

    const reviewResult = await reviewer.invoke(`Review this Job Description:\n\n${currentJD}`)
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
