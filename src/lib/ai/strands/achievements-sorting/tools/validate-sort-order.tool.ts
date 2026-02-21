import { tool } from '@strands-agents/sdk'
import { z } from 'zod'

/**
 * Validates that a sort-order result is a valid JSON array of integers
 * and that all indices from 0..length-1 are present exactly once.
 */
export function createValidateSortOrderTool(expectedLength: number) {
  return tool({
    name: 'validate_sort_order',
    description:
      'Validates that the sort order output is a valid JSON array of unique integers containing all indices from 0 to (length-1). ' +
      `Expected length: ${expectedLength}. Returns {valid: bool, issues: string[]}.`,
    inputSchema: z.object({
      sort_order: z.string().describe('The JSON array string of ranked indices, e.g. [2, 0, 1]'),
    }),
    callback: (input: { sort_order: string }) => {
      const issues: string[] = []
      let parsed: unknown

      try {
        parsed = JSON.parse(input.sort_order)
      } catch {
        return JSON.stringify({ valid: false, issues: ['Output is not valid JSON'] })
      }

      if (!Array.isArray(parsed)) {
        issues.push('Output is not a JSON array')
        return JSON.stringify({ valid: false, issues })
      }

      const arr = parsed as number[]
      if (arr.length !== expectedLength) {
        issues.push(`Array has ${arr.length} elements, expected ${expectedLength}`)
      }

      const sorted = [...arr].sort((a, b) => a - b)
      for (let i = 0; i < expectedLength; i++) {
        if (sorted[i] !== i) {
          issues.push(`Missing or duplicate index: expected all integers 0..${expectedLength - 1}`)
          break
        }
      }

      return JSON.stringify({ valid: issues.length === 0, issues })
    },
  })
}
