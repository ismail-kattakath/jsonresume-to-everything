import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/tech-stack-sorting/prompts'

/**
 *
 */
export function createTechStackAgents(config: AgentConfig) {
  const model = createModel(config)

  return {
    optimizer: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.OPTIMIZER,
      printer: false,
    }),
    scribe: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.SCRIBE,
      printer: false,
    }),
    editor: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.EDITOR,
      printer: false,
    }),
  }
}

/**
 *
 */
export type TechStackAgents = ReturnType<typeof createTechStackAgents>
