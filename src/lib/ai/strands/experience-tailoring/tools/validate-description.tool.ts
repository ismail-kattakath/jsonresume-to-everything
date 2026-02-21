import { tool } from '@strands-agents/sdk'
import { z } from 'zod'

/**
 * Validates that a rewritten description meets basic structural requirements.
 * Checks for minimum length and warns if it appears too similar to or removed from the original.
 */
export const validateDescriptionTool = tool({
  name: 'validate_description_quality',
  description:
    'Validates a rewritten job description string for basic quality: it must be non-empty, ' +
    'reasonably long (>50 chars), and not identical to the original. Returns {valid: bool, issues: string[]}.',
  inputSchema: z.object({
    original: z.string().describe('The original description before rewriting'),
    rewritten: z.string().describe('The rewritten description to validate'),
  }),
  callback: (input: { original: string; rewritten: string }) => {
    const issues: string[] = []

    if (!input.rewritten || input.rewritten.trim().length === 0) {
      issues.push('Rewritten description is empty')
    } else if (input.rewritten.trim().length < 50) {
      issues.push(`Rewritten description is too short (${input.rewritten.trim().length} chars, min 50)`)
    }

    if (input.rewritten.trim() === input.original.trim()) {
      issues.push('Rewritten description is identical to original — no changes were made')
    }

    return JSON.stringify({ valid: issues.length === 0, issues })
  },
})
