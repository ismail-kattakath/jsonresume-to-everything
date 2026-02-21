import { tool } from '@strands-agents/sdk'
import { z } from 'zod'
import { validateSkillsInSummary } from '@/lib/ai/strands/summary/utils'

/**
 * Creates a tool that validates whether a generated summary mentions only allowed skills.
 * The tool is parameterized by the allowed skills list so it can be bound at agent creation time.
 *
 * @param allowedSkills - The list of permitted technology/skill names
 */
export function createValidateSkillsTool(allowedSkills: string[]) {
    return tool({
        name: 'validate_skills',
        description:
            'Checks if the summary contains any technologies NOT in the allowed skills list. ' +
            'Call this before finalizing the summary to ensure compliance.',
        inputSchema: z.object({
            summary: z.string().describe('The generated professional summary text to validate'),
        }),
        callback: (input: { summary: string }) => {
            const result = validateSkillsInSummary(input.summary, allowedSkills)
            return JSON.stringify(result)
        },
    })
}
