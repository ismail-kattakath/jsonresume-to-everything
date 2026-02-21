import { StreamCallback } from '@/types/openai'
import { TailoringAgents } from '@/lib/ai/strands/experience-tailoring/agents'
import { TechStackAlignmentResult } from '@/lib/ai/strands/experience-tailoring/types'
import { extractToolOutput, runAgentStream } from '@/lib/ai/strands/experience-tailoring/utils'

import { TailoringInvocationState } from '@/lib/ai/strands/experience-tailoring/types'

/**
 * Stage 3: Align tech stack to JD terminology and validate changes.
 */
export async function runTechStackStage(
  agents: TailoringAgents,
  state: TailoringInvocationState,
  onProgress?: StreamCallback
): Promise<void> {
  const { jobDescription, originalTechStack: techStack } = state
  const rewrittenAchievements = state.rewrittenAchievements ?? []
  const rewrittenDescription = state.rewrittenDescription ?? ''

  if (!techStack || techStack.length === 0) {
    return
  }

  onProgress?.({ content: 'Aligning tech stack to JD terminology...', done: false })

  let finalTechStack: string[] | undefined = undefined

  const alignerPrompt =
    `Job Description:\n${jobDescription}\n\n` +
    `Finalized Description:\n${rewrittenDescription}\n\n` +
    `Rewritten Achievements:\n${rewrittenAchievements.join('\n')}\n\n` +
    `Current Draft Tech Stack:\n${techStack.join('\n')}\n\n` + // Use techStack for initial draft
    `Align the tech stack to terminology in the Job Description.`

  const maxAlignIterations = 2
  for (let i = 0; i < maxAlignIterations; i++) {
    await runAgentStream(await agents.techStackAligner.stream(alignerPrompt), onProgress, 'Aligning Tech Stack', {
      silentText: true,
    })

    const alignData = extractToolOutput<TechStackAlignmentResult>(
      agents.techStackAligner.messages,
      'finalize_tech_stack_alignment',
      {
        techStack,
        rationale: 'Tool fallback limit hit',
      }
    )

    finalTechStack = alignData?.techStack && alignData.techStack.length > 0 ? alignData.techStack : techStack

    onProgress?.({ content: 'Validating tech stack alignment...', done: false })
    const validatorPrompt =
      `Original Stack: ${techStack.join(', ')}\n` +
      `Proposed Stack: ${finalTechStack.join(', ')}\n\n` +
      `Evidence Context:\nDescription: ${rewrittenDescription}\nRewritten Achievements:\n${rewrittenAchievements.join('\n')}\n\n` +
      `Ensure changes are justified and backed by evidence.`

    const validationResult = await runAgentStream(
      await agents.techStackValidator.stream(validatorPrompt),
      onProgress,
      'Validating Tech Stack',
      { silentText: true }
    )
    if (validationResult.toString().trim().startsWith('APPROVED')) {
      break
    } else if (i < maxAlignIterations - 1) {
      // Re-run aligner with critique inside loop (if needed by expanding the architecture,
      // but original code just repeats or falls through). We will leave it consistent
      // with original logic: it didn't strictly re-invoke unless we passed the refined prompt.
      // Actually, original code created refinedAlignerPrompt but didn't invoke it.
      // So we just break or fall through as original.
      // To strictly match original:
      // To strictly match original:
      // const refinedAlignerPrompt =
      //   `${alignerPrompt}\n\n` +
      //   `Validation Critique:\n${validationResult}\n\n` +
      //   `Please adjust the tech stack to address these concerns.`
      // original comments: "// Using temporary prompt for re-invoke if needed, usually we just let it fall through or break"
    }
  }

  state.finalTechStack = finalTechStack
}
