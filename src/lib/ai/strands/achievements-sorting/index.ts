import { StreamCallback } from '@/types/openai'
import { AgentConfig } from '@/lib/ai/strands/types'
import { AchievementsSortResult } from '@/lib/ai/strands/achievements-sorting/types'
import { createSortingAgents } from '@/lib/ai/strands/achievements-sorting/agents'

const MAX_ITERATIONS = 3

export * from '@/lib/ai/strands/achievements-sorting/types'

/**
 * A multi-agent graph flow that sorts key achievements based on job description relevance.
 *
 * @param achievements - The current achievements array
 * @param position - The job position/title
 * @param organization - The organization name
 * @param jobDescription - The target job description
 * @param config - Provider configuration from AISettings
 * @param onProgress - Optional callback for streaming updates
 * @returns The sorted achievement indices
 */
export async function sortAchievementsGraph(
  achievements: string[],
  position: string,
  organization: string,
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<AchievementsSortResult> {
  const agents = createSortingAgents(config, achievements.length)

  // Agent 1: Analyst - Extract relevance criteria from JD
  onProgress?.({ content: 'Analyzing job requirements...', done: false })
  const analysisResult = await agents.analyst.invoke(`Job Description:
${jobDescription}

Target Role: ${position} at ${organization}

Analyze what makes achievements relevant for this role.`)
  const analysis = analysisResult.toString()

  // Agent 2: Sorter - Sort achievements by relevance
  onProgress?.({ content: 'Sorting achievements by relevance...', done: false })

  const achievementsWithIndices = achievements.map((achievement, index) => `[${index}] ${achievement}`).join('\n')

  const sorterInput = `Analysis from previous agent:
${analysis}

Current achievements for ${position} at ${organization}:
${achievementsWithIndices}

Job description:
${jobDescription}

Generate the ranking JSON now:`

  const sorterResult = await agents.sorter.invoke(sorterInput)
  let sortResultJson = sorterResult.toString().trim()

  // Agent 3: Reviewer - Validate JSON and ranking quality
  let iteration = 0
  while (iteration < MAX_ITERATIONS) {
    onProgress?.({ content: 'Validating sort results...', done: false })

    const reviewResult = await agents.reviewer.invoke(`Generated Ranking JSON:
${sortResultJson}

Original Analysis:
${analysis}

Achievements:
${achievementsWithIndices}`)

    const review = reviewResult.toString().trim()

    if (review.startsWith('APPROVED')) {
      break
    }

    if (review.includes('CRITIQUE:')) {
      // Extract corrected JSON (should be on the line after CRITIQUE)
      const lines = review.split('\n')
      const correctedJson = lines.slice(1).join('\n').trim()

      if (correctedJson && correctedJson !== sortResultJson) {
        sortResultJson = correctedJson
        iteration++
      } else {
        // If no correction provided, break to avoid infinite loop
        break
      }
    } else {
      break
    }
  }

  // Final cleanup: strip any remaining markdown code blocks
  const cleanJson = sortResultJson
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  // Parse the final result
  let sortResult: AchievementsSortResult
  try {
    sortResult = JSON.parse(cleanJson)

    // Validate the result structure
    if (!sortResult.rankedIndices || !Array.isArray(sortResult.rankedIndices)) {
      throw new Error('Invalid result structure: missing rankedIndices array')
    }

    // Validate all indices are present
    const expectedIndices = Array.from({ length: achievements.length }, (_, i) => i)
    const hasAllIndices = expectedIndices.every((i) => sortResult.rankedIndices.includes(i))

    if (!hasAllIndices) {
      throw new Error('Invalid result: missing some achievement indices')
    }

    if (sortResult.rankedIndices.length !== achievements.length) {
      throw new Error('Invalid result: incorrect number of indices')
    }
  } catch (error) {
    console.error('Failed to parse achievements sort result:', error)
    console.error('Raw JSON:', cleanJson)
    // Fallback: return original order
    sortResult = {
      rankedIndices: Array.from({ length: achievements.length }, (_, i) => i),
    }
  }

  onProgress?.({ content: 'Achievements sorted!', done: true })
  return sortResult
}
