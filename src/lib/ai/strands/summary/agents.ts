import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/summary/prompts'
import { createValidateSkillsTool } from '@/lib/ai/strands/summary/tools'

/**
 * Creates analyst, writer, and reviewer agents for professional summary generation
 */
export function createSummaryAgents(config: AgentConfig, allowedSkills: string[]) {
  const model = createModel(config)

  return {
    analyst: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.ANALYST,
      printer: false,
    }),
    writer: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.WRITER,
      printer: false,
    }),
    reviewer: new Agent({
      model,
      tools: [createValidateSkillsTool(allowedSkills)],
      systemPrompt: SYSTEM_PROMPTS.REVIEWER,
      printer: false,
    }),
  }
}

/**
 * Type definition for summary agents
 */
export type SummaryAgents = ReturnType<typeof createSummaryAgents>
