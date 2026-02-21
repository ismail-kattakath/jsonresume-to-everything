import { tool } from '@strands-agents/sdk'
import { z } from 'zod'

/**
 * Validates that a JD has exactly the 4 required sections with correct markdown structure.
 * The reviewer agent can call this instead of relying solely on LLM judgment.
 */
export const validateJDFormatTool = tool({
    name: 'validate_jd_format',
    description:
        'Validates that a job description has all 4 required sections (position-title, core-responsibilities, desired-qualifications, required-skills) ' +
        'and uses only # and - markdown. Returns {valid: bool, missingSection: string | null, issues: string[]}.',
    inputSchema: z.object({
        jd_text: z.string().describe('The job description text to validate'),
    }),
    callback: (input: { jd_text: string }) => {
        const requiredSections = [
            'position-title',
            'core-responsibilities',
            'desired-qualifications',
            'required-skills',
        ]
        const issues: string[] = []
        let missingSection: string | null = null

        for (const section of requiredSections) {
            if (!input.jd_text.includes(`# ${section}`)) {
                missingSection = section
                issues.push(`Missing required section: # ${section}`)
            }
        }

        // Check for disallowed markdown: bold (**), italics (*_ ), inline code pairs for formatting
        if (/\*\*.+?\*\*/.test(input.jd_text)) issues.push('Contains disallowed bold markdown (**)')
        if (/(?<!\*)\*(?!\*)/.test(input.jd_text)) issues.push('Contains disallowed italic markdown (*)')

        // Check that core-responsibilities and desired-qualifications have <= 5 items
        const responsibilitiesMatch = input.jd_text.match(
            /# core-responsibilities([\s\S]*?)(?=# desired-qualifications|# required-skills|$)/
        )
        if (responsibilitiesMatch) {
            const itemCount = (responsibilitiesMatch?.[1]?.match(/^\s*-\s+/gm) || []).length
            if (itemCount > 5) issues.push(`core-responsibilities has ${itemCount} items (max 5)`)
        }

        const qualificationsMatch = input.jd_text.match(
            /# desired-qualifications([\s\S]*?)(?=# required-skills|$)/
        )
        if (qualificationsMatch) {
            const itemCount = (qualificationsMatch?.[1]?.match(/^\s*-\s+/gm) || []).length
            if (itemCount > 5) issues.push(`desired-qualifications has ${itemCount} items (max 5)`)
        }

        return JSON.stringify({ valid: issues.length === 0, missingSection, issues })
    },
})
