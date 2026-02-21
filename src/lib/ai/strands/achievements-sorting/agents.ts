import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/achievements-sorting/prompts'
import { createValidateSortOrderTool } from '@/lib/ai/strands/achievements-sorting/tools'

export function createSortingAgents(config: AgentConfig, length: number) {
    const model = createModel(config)

    return {
        analyst: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.ANALYST,
            printer: false,
        }),
        sorter: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.SORTER.replace('{LENGTH}', String(length - 1)),
            printer: false,
        }),
        reviewer: new Agent({
            model,
            tools: [createValidateSortOrderTool(length)],
            systemPrompt: SYSTEM_PROMPTS.REVIEWER.replace('{LENGTH}', String(length - 1)),
            printer: false,
        }),
    }
}

export type AchievementsSortingAgents = ReturnType<typeof createSortingAgents>
