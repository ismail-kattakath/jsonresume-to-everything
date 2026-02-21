import { StreamCallback } from '@/types/openai'
import { SkillGroup } from '@/types'
import { AgentConfig } from '@/lib/ai/strands/types'
import { SkillsSortResult } from '@/lib/ai/strands/skills-sorting/types'
import { createSkillsSortingAgents } from '@/lib/ai/strands/skills-sorting/agents'

export * from '@/lib/ai/strands/skills-sorting/types'

/**
 * A multi-agent graph flow that sorts resume skills based on job description relevance.
 * Also identifies and adds relevant missing skills.
 *
 * @param skills - The current skill groups
 * @param jobDescription - The target job description
 * @param config - Provider configuration from AISettings
 * @param onProgress - Optional callback for streaming updates
 * @returns The sorted and enhanced SkillsSortResult
 */
export async function sortSkillsGraph(
  skills: SkillGroup[],
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<SkillsSortResult> {
  const agents = createSkillsSortingAgents(config, skills.length)

  const skillsData = skills.map((group) => ({
    title: group.title,
    skills: (group.skills || []).map((s) => s.text),
  }))

  let iteration = 0
  const maxIterations = 2
  let lastAnalysis = ''
  let lastAttemptedJson = ''
  let lastCritique = ''

  onProgress?.({ content: 'Analyzing skill relevance...', done: false })

  // STAGE 1: Analysis
  const analysisResult = await agents.brain.invoke(
    `JOB DESCRIPTION:\n${jobDescription}\n\nCURRENT SKILLS:\n${JSON.stringify(skillsData)}`
  )
  lastAnalysis = analysisResult.toString().trim()

  onProgress?.({ content: 'Sorting and optimizing skills...', done: false })

  // STAGE 2 & 3: Iterative Scribing and Editing
  while (iteration <= maxIterations) {
    iteration++

    const scribePrompt =
      iteration === 1
        ? `Original Data:\n${JSON.stringify(skillsData)}\n\nOptimization Analysis:\n${lastAnalysis}`
        : `Data review failed. Fix the JSON based on these critiques:\n${lastCritique}\n\nKeep the original optimized structure from the analysis.`

    const scribeResult = await agents.scribe.invoke(scribePrompt)
    const rawJson = scribeResult.toString().trim()
    const cleanedJson = rawJson
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()
    lastAttemptedJson = cleanedJson

    onProgress?.({ content: 'Validating sort results...', done: false })

    const review = await agents.editor.invoke(
      `Original Data:\n${JSON.stringify(skillsData)}\n\nGenerated JSON:\n${cleanedJson}`
    )
    const reviewText = review.toString().trim()

    if (reviewText.startsWith('APPROVED')) {
      try {
        const finalJson = JSON.parse(cleanedJson) as SkillsSortResult
        onProgress?.({ content: 'Skills sorted!', done: true })
        return finalJson
      } catch (_e) {
        lastCritique = `CRITIQUE: Error parsing JSON: ${_e instanceof Error ? _e.message : 'Unknown error'}`
      }
    } else {
      // Internal critique - don't show to user, just use for next iteration
      lastCritique = reviewText
    }
  }

  // Final fallback
  try {
    const fallback = JSON.parse(
      lastAttemptedJson
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
    )
    onProgress?.({ content: 'Skills sorted!', done: true })
    return fallback as SkillsSortResult
  } catch (_e) {
    throw new Error('Failed to generate a valid skill sorting result after multiple attempts.')
  }
}
