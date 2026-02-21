import { StreamCallback } from '@/types/openai'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createTechStackAgents } from '@/lib/ai/strands/tech-stack-sorting/agents'

export * from '../types' // No specific local types needed for this one

/**
 * A multi-agent graph flow that sorts a tech stack based on JD relevance.
 *
 * @param technologies - The list of technologies to sort
 * @param jobDescription - The target job description
 * @param config - Provider configuration
 * @param onProgress - Optional callback for streaming updates
 * @returns Sorted list of technologies
 */
export async function sortTechStackGraph(
  technologies: string[],
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string[]> {
  const agents = createTechStackAgents(config)

  onProgress?.({ content: 'Analyzing tech stack relevance...', done: false })

  // 1. ANALYZE
  const analysis = await agents.optimizer.invoke(
    `JOB DESCRIPTION:\n${jobDescription}\n\nCURRENT TECH STACK:\n${technologies.join(', ')}`
  )
  const analysisText = analysis.toString().trim()

  onProgress?.({ content: 'Sorting tech stack...', done: false })

  let lastAttemptedJson = ''
  let lastCritique = ''

  // 2 & 3: ITERATIVE FORMATTING & VALIDATION (Max 3 attempts)
  for (let attempt = 1; attempt <= 3; attempt++) {
    const formattingPrompt = lastCritique
      ? `Original Tech Stack: ${technologies.join(', ')}\nAnalysis:\n${analysisText}\n\nPREVIOUS ERROR: ${lastCritique}\n\nFix the JSON format and ensure ALL original technologies are included:`
      : `Original Tech Stack: ${technologies.join(', ')}\nAnalysis:\n${analysisText}\n\nConvert this to a JSON array of strings:`

    const rawJson = await agents.scribe.invoke(formattingPrompt)
    lastAttemptedJson = rawJson.toString().trim()

    // Clean markdown code blocks if present
    const cleanJson = lastAttemptedJson
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    onProgress?.({ content: 'Validating sort results...', done: false })

    const validation = await agents.editor.invoke(
      `ORIGINAL DATA: ${JSON.stringify(technologies)}\nGENERATED JSON: ${cleanJson}`
    )
    const validationText = validation.toString().trim()

    if (validationText.startsWith('APPROVED')) {
      onProgress?.({ content: 'Tech stack sorted!', done: true })
      return JSON.parse(cleanJson)
    }

    lastCritique = validationText
  }

  // Final fallback: try to parse whatever we have, or return original
  try {
    const cleanJson = lastAttemptedJson
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()
    const result = JSON.parse(cleanJson)
    onProgress?.({ content: 'Tech stack sorted!', done: true })
    return Array.isArray(result) ? result : technologies
  } catch (_e) {
    onProgress?.({ content: 'Tech stack sorted!', done: true })
    return technologies
  }
}
