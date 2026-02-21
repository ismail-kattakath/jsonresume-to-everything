import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/skills-extraction/prompts'

/**
 *
 */
export function createSkillsExtractionAgents(config: AgentConfig) {
  const model = createModel(config)

  return {
    extractor: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.EXTRACTOR,
      printer: false,
    }),
    verifier: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.VERIFIER,
      printer: false,
    }),
  }
}

/**
 *
 */
export type SkillsExtractionAgents = ReturnType<typeof createSkillsExtractionAgents>
