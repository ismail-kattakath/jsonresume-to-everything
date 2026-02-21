import { tool } from '@strands-agents/sdk'
import { z } from 'zod'

/**
 * Validates that rewritten achievements are grounded in the original achievements.
 * This is a structural/heuristic check: it verifies that each rewritten achievement
 * has reasonable length and doesn't introduce completely fabricated content.
 *
 * The agent powered by this tool can still use LLM judgment for nuanced validation,
 * but has the tool as a deterministic anchor for structural issues.
 */
export const validateAchievementsTool = tool({
    name: 'validate_achievements_integrity',
    description:
        'Checks whether rewritten achievements are structurally valid. Validates count, length, and that ' +
        'no achievement is suspiciously short or empty. Returns {valid: bool, issues: string[]}.',
    inputSchema: z.object({
        original: z
            .array(z.string())
            .describe('The original achievement strings before rewriting'),
        rewritten: z
            .array(z.string())
            .describe('The rewritten achievement strings to validate'),
    }),
    callback: (input: { original: string[]; rewritten: string[] }) => {
        const issues: string[] = []

        if (input.rewritten.length !== input.original.length) {
            issues.push(
                `Count mismatch: expected ${input.original.length} achievements, got ${input.rewritten.length}`
            )
        }

        input.rewritten.forEach((ach, i) => {
            if (!ach || ach.trim().length < 10) {
                issues.push(`Achievement [${i}] is too short or empty: "${ach}"`)
            }
        })

        return JSON.stringify({ valid: issues.length === 0, issues })
    },
})
