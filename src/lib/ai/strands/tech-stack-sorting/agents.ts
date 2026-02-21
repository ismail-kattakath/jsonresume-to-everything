import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/tech-stack-sorting/prompts'

/**
 * Creates optimizer, scribe, and editor agents for tech stack sorting
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
 * Type definition for tech stack sorting agents
 */
export type TechStackAgents = ReturnType<typeof createTechStackAgents>
