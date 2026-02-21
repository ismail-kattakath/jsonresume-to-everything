import { tool } from '@strands-agents/sdk'
import { z } from 'zod'
import { SkillsSortResult } from '@/lib/ai/strands/skills-sorting/types'

/**
 * Validates that a skills sorting result is valid JSON conforming to the SkillsSortResult shape.
 */
export const validateSkillsJsonTool = tool({
  name: 'validate_skills_json',
  description:
    'Validates that the output is valid JSON with groupOrder (string[]) and skillOrder (Record<string, string[]>) fields. ' +
    'Returns {valid: bool, issues: string[]}.',
  inputSchema: z.object({
    json_string: z.string().describe('The JSON string to validate as a SkillsSortResult'),
  }),
  callback: (input: { json_string: string }) => {
    const issues: string[] = []
    let parsed: unknown

    try {
      parsed = JSON.parse(input.json_string)
    } catch {
      return JSON.stringify({ valid: false, issues: ['Output is not valid JSON'] })
    }

    const result = parsed as Partial<SkillsSortResult>

    if (!Array.isArray(result.groupOrder)) {
      issues.push('Missing or invalid groupOrder field (expected string array)')
    }

    if (!result.skillOrder || typeof result.skillOrder !== 'object' || Array.isArray(result.skillOrder)) {
      issues.push('Missing or invalid skillOrder field (expected Record<string, string[]>)')
    }

    return JSON.stringify({ valid: issues.length === 0, issues })
  },
})
