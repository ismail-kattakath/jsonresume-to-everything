import { tool } from '@strands-agents/sdk'
import { z } from 'zod'

/**
 * Validates that a proposed tech stack change is safe:
 * - No technology is added that wasn't in the original stack
 * - No technology string is suspiciously short
 */
export const validateTechStackTool = tool({
  name: 'validate_tech_stack_alignment',
  description:
    'Validates that the proposed tech stack only contains items from the original stack (possibly renamed/reordered) ' +
    'and that all entries are valid technology name strings. Returns {valid: bool, issues: string[]}.',
  inputSchema: z.object({
    original: z.array(z.string()).describe('The original tech stack items'),
    proposed: z.array(z.string()).describe('The proposed updated tech stack'),
  }),
  callback: (input: { original: string[]; proposed: string[] }) => {
    const issues: string[] = []
    const normalizedOriginal = new Set(input.original.map((t) => t.toLowerCase().trim()))

    // Check for suspiciously new items (not a variant of any original)
    const fabricated = input.proposed.filter((item) => {
      const normalized = item.toLowerCase().trim()
      if (normalized.length < 2) return true
      return !Array.from(normalizedOriginal).some((orig) => orig.includes(normalized) || normalized.includes(orig))
    })

    if (fabricated.length > 0) {
      issues.push(`Potentially fabricated tech items (not in original): ${fabricated.join(', ')}`)
    }

    if (input.proposed.length > input.original.length * 2) {
      issues.push(`Too many items added: original had ${input.original.length}, proposed has ${input.proposed.length}`)
    }

    return JSON.stringify({ valid: issues.length === 0, issues })
  },
})
