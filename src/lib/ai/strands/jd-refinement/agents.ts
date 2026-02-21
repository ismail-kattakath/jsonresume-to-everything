import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/jd-refinement/prompts'
import { validateJDFormatTool } from '@/lib/ai/strands/jd-refinement/tools'

/**
 * Creates refiner and reviewer agents for job description refinement
 */
export function createJDRefinementAgents(config: AgentConfig) {
  const model = createModel(config)

  return {
    refiner: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.REFINER,
      printer: false,
    }),
    reviewer: new Agent({
      model,
      tools: [validateJDFormatTool],
      systemPrompt: SYSTEM_PROMPTS.REVIEWER,
      printer: false,
    }),
  }
}

/**
 * Type definition for JD refinement agents
 */
export type JDRefinementAgents = ReturnType<typeof createJDRefinementAgents>
