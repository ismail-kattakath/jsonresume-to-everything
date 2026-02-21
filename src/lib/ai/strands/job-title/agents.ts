import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/job-title/prompts'

/**
 * Creates analyst, writer, and reviewer agents for job title generation
 */
export function createJobTitleAgents(config: AgentConfig) {
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
      systemPrompt: SYSTEM_PROMPTS.REVIEWER,
      printer: false,
    }),
  }
}

/**
 * Type definition for job title agents
 */
export type JobTitleAgents = ReturnType<typeof createJobTitleAgents>
