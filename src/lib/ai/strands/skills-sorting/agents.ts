import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/skills-sorting/prompts'
import { validateSkillsJsonTool } from '@/lib/ai/strands/skills-sorting/tools'

export function createSkillsSortingAgents(config: AgentConfig, numGroups: number) {
    const model = createModel(config)

    return {
        brain: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.BRAIN,
            printer: false,
        }),
        scribe: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.SCRIBE,
            printer: false,
        }),
        editor: new Agent({
            model,
            tools: [validateSkillsJsonTool],
            systemPrompt: SYSTEM_PROMPTS.EDITOR.replace('{LENGTH}', String(numGroups)),
            printer: false,
        }),
    }
}

export type SkillsSortingAgents = ReturnType<typeof createSkillsSortingAgents>
