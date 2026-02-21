import { StreamCallback } from '@/types/openai'
import { TailoringAgents } from '@/lib/ai/strands/experience-tailoring/agents'
import { TechStackAlignmentResult } from '@/lib/ai/strands/experience-tailoring/types'
import { safeParseJson } from '@/lib/ai/strands/experience-tailoring/utils'

/**
 *
 */
export interface TechStackStageInput {
  jobDescription: string
  rewrittenDescription: string
  rewrittenAchievements: string[]
  techStack: string[]
}

/**
 * Stage 3: Align tech stack to JD terminology and validate changes.
 */
export async function runTechStackStage(
  agents: TailoringAgents,
  input: TechStackStageInput,
  onProgress?: StreamCallback
): Promise<string[] | undefined> {
  const { jobDescription, rewrittenDescription, rewrittenAchievements, techStack } = input

  if (!techStack || techStack.length === 0) {
    return undefined
  }

  onProgress?.({ content: 'Aligning tech stack to JD terminology...', done: false })

  let finalTechStack: string[] | undefined = undefined

  const alignerPrompt =
    `Job Description:\n${jobDescription}\n\n` +
    `Finalized Description:\n${rewrittenDescription}\n\n` +
    `Finalized Achievements:\n${rewrittenAchievements.join('\n')}\n\n` +
    `Current Tech Stack:\n${techStack.join(', ')}`

  const maxAlignIterations = 2
  for (let i = 0; i < maxAlignIterations; i++) {
    const alignResult = await agents.techStackAligner.invoke(alignerPrompt)

    const alignData = safeParseJson<TechStackAlignmentResult>(alignResult.toString(), {
      techStack,
      rationale: 'JSON parse failed',
    })

    finalTechStack = alignData.techStack

    onProgress?.({ content: 'Validating tech stack alignment...', done: false })
    const validatorPrompt =
      `Original Stack: ${techStack.join(', ')}\n` +
      `Proposed Stack: ${finalTechStack.join(', ')}\n\n` +
      `Evidence Context:\nDescription: ${rewrittenDescription}\nAchievements:\n${rewrittenAchievements.join('\n')}`

    const validationResult = await agents.techStackValidator.invoke(validatorPrompt)
    if (validationResult.toString().trim().startsWith('APPROVED')) {
      break
    } else if (i < maxAlignIterations - 1) {
      // Re-run aligner with critique inside loop (if needed by expanding the architecture,
      // but original code just repeats or falls through). We will leave it consistent
      // with original logic: it didn't strictly re-invoke unless we passed the refined prompt.
      // Actually, original code created refinedAlignerPrompt but didn't invoke it.
      // So we just break or fall through as original.
      // To strictly match original:
      const refinedAlignerPrompt =
        `${alignerPrompt}\n\n` +
        `Validation Critique:\n${validationResult}\n\n` +
        `Please adjust the tech stack to address these concerns.`
      // original comments: "// Using temporary prompt for re-invoke if needed, usually we just let it fall through or break"
    }
  }

  return finalTechStack
}
