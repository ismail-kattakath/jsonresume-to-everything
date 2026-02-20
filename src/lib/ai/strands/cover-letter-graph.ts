import { Agent } from '@strands-agents/sdk'
import { StreamCallback } from '@/types/openai'
import { ResumeData } from '@/types'
import { AgentConfig } from './types'
import { createModel } from './factory'

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
  const model = createModel(config)

  // Helper to format resume data for the writer
  const experienceText = (resumeData.workExperience || [])
    .map(
      (exp) => `${exp.position} at ${exp.organization}: ${(exp.keyAchievements || []).map((a) => a.text).join('; ')}`
    )
    .join('\n\n')

  const skillsText = (resumeData.skills || []).flatMap((group) => group.skills.map((s) => s.text)).join(', ')

  // 1. WRITER AGENT
  const writer = new Agent({
    model,
    systemPrompt:
      'You are a Professional Cover Letter Writer.\\n\\n' +
      'YOUR TASK: Write a professional, concise cover letter tailored to the job description.\\n\\n' +
      'STRATEGY:\\n' +
      '1. **Hook**: Start with a strong opening showing Enthusiasm and Alignment.\\n' +
      "2. **Relevance**: Highlight 2-3 ACTUAL achievements that solve the employer's needs.\\n" +
      '3. **Mirroring**: Naturally use terminology and phrases from the JD.\\n' +
      '4. **Call to Action**: End with a confident next step.\\n\\n' +
      'CRITICAL RULES:\\n' +
      '1. ONLY use facts provided in the candidate data.\\n' +
      '2. NEVER fabricate skills, experiences, or certifications.\\n' +
      '3. NO placeholders like [Company Name] (infer or omit).\\n' +
      '4. NO salutations or signatures.\\n' +
      '5. Length: 250-350 words.',
    printer: false,
  })

  // 2. REVIEWER AGENT
  const reviewer = new Agent({
    model,
    systemPrompt:
      'You are a Master Resume Reviewer and Fact-Checker.\\n\\n' +
      'YOUR TASK: Review the drafted cover letter for factual accuracy and JD alignment.\\n\\n' +
      'CRITERIA:\\n' +
      '1. **No Fabrication**: Ensure every claim is backed by the original candidate data.\\n' +
      '2. **Impact**: Ensure achievements are framed in a results-oriented way.\\n' +
      '3. **Flow**: Ensure professional and engaging tone.\\n\\n' +
      'OUTPUT: If perfect, start with "APPROVED". Otherwise, provide a "CRITIQUE:" followed by specific refinement instructions.',
    printer: false,
  })

  if (onProgress) onProgress({ content: 'Drafting tailored cover letter...', done: false })

  const context = `CANDIDATE: ${resumeData.name}\nSUMMARY: ${resumeData.summary}\nEXPERIENCE: ${experienceText}\nSKILLS: ${skillsText}\n\nJD: ${jobDescription}`

  const currentDraftResult = await writer.invoke(`Create a cover letter based on this data: ${context}`)
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

    const reviewResult = await reviewer.invoke(`Original Data: ${context}\n\nDraft Letter: ${currentDraft}`)
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
      const refinedResult = await writer.invoke(
        `Refine this cover letter based on this critique: ${critique}\n\nOriginal Data: ${context}\n\nLast Draft: ${currentDraft}`
      )
      currentDraft = refinedResult.toString()
    }
  }

  return currentDraft.trim()
}
