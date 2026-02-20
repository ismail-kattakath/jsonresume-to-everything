import { Agent } from '@strands-agents/sdk'
import { StreamCallback } from '@/types/openai'
import { AgentConfig } from './types'
import { createModel } from './factory'

const MAX_ITERATIONS = 3

/**
 * Result type for achievements sorting
 */
export interface AchievementsSortResult {
  rankedIndices: number[]
}

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
  const model = createModel(config)

  // Agent 1: Analyst - Extract relevance criteria from JD
  const analyst = new Agent({
    model,
    systemPrompt: `You are analyzing a job description to identify what makes achievements relevant.

Extract:
1. Key responsibilities and required skills
2. Impact metrics that matter (revenue, efficiency, scale, user growth, etc.)
3. Technologies and domains mentioned
4. Seniority level expectations

Respond with a brief analysis (3-4 sentences) of what types of achievements would be most relevant for this role.`,
    printer: false,
  })

  onProgress?.({ content: 'Analyzing job requirements...', done: false })
  const analysisResult = await analyst.invoke(`Job Description:
${jobDescription}

Target Role: ${position} at ${organization}

Analyze what makes achievements relevant for this role.`)
  const analysis = analysisResult.toString()

  // Agent 2: Sorter - Sort achievements by relevance
  const sorter = new Agent({
    model,
    systemPrompt: `You are sorting professional achievements by relevance to a job description.

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no explanations, no code blocks
2. Use this exact format: {"rankedIndices": [2, 0, 1, ...]}
3. rankedIndices must contain all original indices (0 to ${achievements.length - 1})
4. Most relevant achievements first
5. Consider: impact metrics, relevant technologies, transferable skills, quantifiable results

Examples of good rankings:
- Achievements with quantifiable impact (revenue, users, efficiency) rank higher
- Achievements using relevant technologies rank higher
- Achievements showing leadership/ownership rank higher for senior roles
- Achievements demonstrating relevant domain expertise rank higher`,
    printer: false,
  })

  onProgress?.({ content: 'Sorting achievements by relevance...', done: false })

  const achievementsWithIndices = achievements.map((achievement, index) => `[${index}] ${achievement}`).join('\n')

  const sorterInput = `Analysis from previous agent:
${analysis}

Current achievements for ${position} at ${organization}:
${achievementsWithIndices}

Job description:
${jobDescription}

Generate the ranking JSON now:`

  const sorterResult = await sorter.invoke(sorterInput)
  let sortResultJson = sorterResult.toString().trim()

  // Agent 3: Reviewer - Validate JSON and ranking quality
  const reviewer = new Agent({
    model,
    systemPrompt: `You are reviewing an AI-generated achievement ranking for quality.

Validation Checklist:
1. **VALID JSON**: Must parse without errors
2. **COMPLETE**: rankedIndices contains all indices [0 to ${achievements.length - 1}]
3. **NO DUPLICATES**: Each index appears exactly once
4. **LOGICAL ORDER**: Most relevant achievements are first based on the analysis
5. **REASONING**: Ranking aligns with job requirements

If validation passes ALL checks, respond "APPROVED".
If it fails ANY check, respond "CRITIQUE: <specific issue>" and provide the CORRECTED JSON on the next line.

Example responses:
APPROVED

or

CRITIQUE: Missing index 3 in rankedIndices
{"rankedIndices": [2, 0, 3, 1]}`,
    printer: false,
  })

  let iteration = 0
  while (iteration < MAX_ITERATIONS) {
    onProgress?.({ content: 'Validating sort results...', done: false })

    const reviewResult = await reviewer.invoke(`Generated Ranking JSON:
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
