import { StreamCallback } from '@/types/openai'
import { ResumeData } from '@/types'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createCoverLetterAgents } from '@/lib/ai/strands/cover-letter/agents'

export * from '@/lib/ai/strands/cover-letter/types'

/**
 * Multi-agent graph for generating a professional, tailored cover letter.
 * 1. Writer: Drafts the letter based on resume data and JD.
 * 2. Reviewer: Fact-checks against original resume data and refines for impact.
 */
export async function generateCoverLetterGraph(
  resumeData: ResumeData,
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  const agents = createCoverLetterAgents(config)

  // Helper to format resume data for the writer
  const experienceText = (resumeData.workExperience || [])
    .map(
      (exp) => `${exp.position} at ${exp.organization}: ${(exp.keyAchievements || []).map((a) => a.text).join('; ')}`
    )
    .join('\n\n')

  const skillsText = (resumeData.skills || []).flatMap((group) => group.skills.map((s) => s.text)).join(', ')

  if (onProgress) onProgress({ content: 'Drafting tailored cover letter...', done: false })

  const context = `CANDIDATE: ${resumeData.name}\nSUMMARY: ${resumeData.summary}\nEXPERIENCE: ${experienceText}\nSKILLS: ${skillsText}\n\nJD: ${jobDescription}`

  const currentDraftResult = await agents.writer.invoke(`Create a cover letter based on this data: ${context}`)
  let currentDraft = currentDraftResult.toString()
  let iterations = 0
  const maxIterations = 2

  while (iterations < maxIterations) {
    iterations++
    if (onProgress)
      onProgress({
        content: `Reviewing draft (Iteration ${iterations})...`,
        done: false,
      })

    const reviewResult = await agents.reviewer.invoke(`Original Data: ${context}\n\nDraft Letter: ${currentDraft}`)
    const review = reviewResult.toString()

    if (review.startsWith('APPROVED')) {
      break
    } else {
      const critique = review.replace('CRITIQUE:', '').trim()
      if (onProgress)
        onProgress({
          content: `Refining: ${critique.slice(0, 50)}...`,
          done: false,
        })
      const refinedResult = await agents.writer.invoke(
        `Refine this cover letter based on this critique: ${critique}\n\nOriginal Data: ${context}\n\nLast Draft: ${currentDraft}`
      )
      currentDraft = refinedResult.toString()
    }
  }

  return currentDraft.trim()
}
