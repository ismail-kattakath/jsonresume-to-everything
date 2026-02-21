import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/cover-letter/prompts'

/**
 *
 */
export function createCoverLetterAgents(config: AgentConfig) {
  const model = createModel(config)

  return {
    writer: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.WRITER,
      printer: false,
    }),
    reviewer: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.REVIEWER,
      printer: false,
    }),
  }
}

/**
 *
 */
export type CoverLetterAgents = ReturnType<typeof createCoverLetterAgents>
