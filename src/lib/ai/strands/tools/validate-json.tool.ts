import { tool } from '@strands-agents/sdk'
import { z } from 'zod'

/**
 * Shared tool: validates whether a string is parseable JSON.
 * Agents can use this to self-check their JSON output before returning.
 */
export const validateJsonTool = tool({
  name: 'validate_json',
  description:
    'Validates whether a string is valid JSON. Returns {valid: true, parsed: object} on success, or {valid: false, error: string} on failure. ' +
    'Call this to verify your JSON output before finalizing your response.',
  inputSchema: z.object({
    json_string: z.string().describe('The JSON string to validate'),
  }),
  callback: (input: { json_string: string }) => {
    try {
      const parsed = JSON.parse(input.json_string)
      return JSON.stringify({ valid: true, parsed })
    } catch (e) {
      return JSON.stringify({ valid: false, error: String(e) })
    }
  },
})
