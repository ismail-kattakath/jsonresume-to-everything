import type { ResumeData, SkillGroup, Achievement } from '@/types'

/**
 * Sorting result for skills - contains sorted group order and skill order within groups
 */
export interface SkillsSortResult {
  /** Ordered array of group titles (determines group order) */
  groupOrder: string[]
  /** Map of group title to ordered skill texts (determines skill order within each group) */
  skillOrder: Record<string, string[]>
}

/**
 * Sorting result for achievements within a single work experience
 */
export interface AchievementsSortResult {
  /** Ordered array of achievement texts */
  achievementOrder: string[]
}

/**
 * Builds a prompt for AI-powered skills sorting based on job description relevance
 * Skills stay in their groups - only ordering changes
 */
export function buildSkillsSortPrompt(
  skills: SkillGroup[],
  jobDescription: string
): string {
  const skillsData = skills.map((group) => ({
    title: group.title,
    skills: group.skills.map((s) => s.text),
  }))

  return `You are an expert tech recruiter who optimizes resume skills sections for maximum ATS and recruiter relevance.

TARGET JOB DESCRIPTION:
${jobDescription}

CURRENT SKILLS DATA (JSON format):
${JSON.stringify(skillsData, null, 2)}

YOUR TASK:
Sort the skill groups and skills within each group by relevance to the target job description.

CRITICAL RULES:
1. DO NOT add, remove, or modify any skills or groups
2. Every skill MUST remain in its original group
3. Sort GROUPS so most job-relevant groups appear first
4. Sort SKILLS within each group so most job-relevant skills appear first
5. Use exact skill names as provided (case-sensitive)

SORTING STRATEGY:
- Identify key technologies, frameworks, and skills mentioned in the job description
- Prioritize groups containing those skills
- Within each group, prioritize skills explicitly mentioned or closely related to job requirements
- Skills not relevant to the job should be at the end, but NEVER removed

OUTPUT FORMAT (JSON only, no explanation):
{
  "groupOrder": ["Group Title 1", "Group Title 2", ...],
  "skillOrder": {
    "Group Title 1": ["skill1", "skill2", ...],
    "Group Title 2": ["skill1", "skill2", ...],
    ...
  }
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code blocks.`
}

/**
 * Builds a prompt for AI-powered achievements sorting based on job description relevance
 * Achievements stay within their work experience - only ordering changes
 */
export function buildAchievementsSortPrompt(
  achievements: Achievement[],
  position: string,
  organization: string,
  jobDescription: string
): string {
  const achievementTexts = achievements.map((a) => a.text)

  return `You are an expert tech recruiter who optimizes resume achievements for maximum ATS and recruiter relevance.

TARGET JOB DESCRIPTION:
${jobDescription}

WORK EXPERIENCE CONTEXT:
Position: ${position}
Organization: ${organization}

CURRENT ACHIEVEMENTS (in current order):
${achievementTexts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

YOUR TASK:
Sort these achievements by relevance to the target job description.

CRITICAL RULES:
1. DO NOT add, remove, or modify any achievements
2. Use EXACT achievement text as provided (character-for-character match required)
3. Sort so most job-relevant achievements appear first
4. Achievements not relevant to the job should be at the end, but NEVER removed

SORTING STRATEGY:
- Identify key responsibilities, technologies, and outcomes mentioned in the job description
- Prioritize achievements that demonstrate these skills or experiences
- Consider quantified results that align with job requirements
- Soft skills mentioned in job description should boost related achievements

OUTPUT FORMAT (JSON only, no explanation):
{
  "achievementOrder": [
    "exact text of most relevant achievement",
    "exact text of second most relevant achievement",
    ...
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code blocks. Use EXACT text from the achievements provided.`
}

/**
 * Parses and validates skills sort response from AI
 * Returns null if parsing fails or validation fails
 */
export function parseSkillsSortResponse(
  response: string,
  originalSkills: SkillGroup[]
): SkillsSortResult | null {
  try {
    // Clean the response - remove markdown code blocks if present
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7)
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3)
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
    }
    cleaned = cleaned.trim()

    const parsed = JSON.parse(cleaned) as SkillsSortResult

    // Validate structure
    if (!parsed.groupOrder || !Array.isArray(parsed.groupOrder)) {
      console.error('Invalid groupOrder in AI response')
      return null
    }
    if (!parsed.skillOrder || typeof parsed.skillOrder !== 'object') {
      console.error('Invalid skillOrder in AI response')
      return null
    }

    // Validate all groups are present
    const originalGroupTitles = new Set(originalSkills.map((g) => g.title))
    const responseGroupTitles = new Set(parsed.groupOrder)

    if (originalGroupTitles.size !== responseGroupTitles.size) {
      console.error('Group count mismatch in AI response')
      return null
    }

    for (const title of originalGroupTitles) {
      if (!responseGroupTitles.has(title)) {
        console.error(`Missing group "${title}" in AI response`)
        return null
      }
    }

    // Validate all skills are present within each group
    for (const group of originalSkills) {
      const originalSkillTexts = new Set(group.skills.map((s) => s.text))
      const responseSkillTexts = parsed.skillOrder[group.title]

      if (!responseSkillTexts || !Array.isArray(responseSkillTexts)) {
        console.error(`Missing skill order for group "${group.title}"`)
        return null
      }

      if (originalSkillTexts.size !== responseSkillTexts.length) {
        console.error(`Skill count mismatch for group "${group.title}"`)
        return null
      }

      const responseSkillSet = new Set(responseSkillTexts)
      for (const skillText of originalSkillTexts) {
        if (!responseSkillSet.has(skillText)) {
          console.error(
            `Missing skill "${skillText}" in group "${group.title}"`
          )
          return null
        }
      }
    }

    return parsed
  } catch (error) {
    console.error('Failed to parse AI skills sort response:', error)
    return null
  }
}

/**
 * Parses and validates achievements sort response from AI
 * Returns null if parsing fails or validation fails
 */
export function parseAchievementsSortResponse(
  response: string,
  originalAchievements: Achievement[]
): AchievementsSortResult | null {
  try {
    // Clean the response - remove markdown code blocks if present
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7)
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3)
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
    }
    cleaned = cleaned.trim()

    const parsed = JSON.parse(cleaned) as AchievementsSortResult

    // Validate structure
    if (!parsed.achievementOrder || !Array.isArray(parsed.achievementOrder)) {
      console.error('Invalid achievementOrder in AI response')
      return null
    }

    // Validate all achievements are present
    const originalTexts = new Set(originalAchievements.map((a) => a.text))
    const responseTexts = new Set(parsed.achievementOrder)

    if (originalTexts.size !== responseTexts.size) {
      console.error('Achievement count mismatch in AI response')
      return null
    }

    for (const text of originalTexts) {
      if (!responseTexts.has(text)) {
        console.error(`Missing achievement in AI response: "${text}"`)
        return null
      }
    }

    return parsed
  } catch (error) {
    console.error('Failed to parse AI achievements sort response:', error)
    return null
  }
}

/**
 * Applies the skills sort result to create reordered skill groups
 * Returns new array with sorted groups and sorted skills within groups
 */
export function applySortedSkills(
  originalSkills: SkillGroup[],
  sortResult: SkillsSortResult
): SkillGroup[] {
  // Create a map of original groups for quick lookup
  const groupMap = new Map(originalSkills.map((g) => [g.title, g]))

  // Build sorted result
  return sortResult.groupOrder.map((groupTitle) => {
    const originalGroup = groupMap.get(groupTitle)
    if (!originalGroup) {
      throw new Error(`Group "${groupTitle}" not found`)
    }

    // Create skill map for ordering
    const skillMap = new Map(originalGroup.skills.map((s) => [s.text, s]))
    const sortedSkillTexts = sortResult.skillOrder[groupTitle] || []

    return {
      ...originalGroup,
      skills: sortedSkillTexts.map((text) => {
        const skill = skillMap.get(text)
        if (!skill) {
          throw new Error(`Skill "${text}" not found in group "${groupTitle}"`)
        }
        return skill
      }),
    }
  })
}

/**
 * Applies the achievements sort result to create reordered achievements
 * Returns new array with sorted achievements
 */
export function applySortedAchievements(
  originalAchievements: Achievement[],
  sortResult: AchievementsSortResult
): Achievement[] {
  // Create a map of original achievements for quick lookup
  const achievementMap = new Map(originalAchievements.map((a) => [a.text, a]))

  // Build sorted result
  return sortResult.achievementOrder.map((text) => {
    const achievement = achievementMap.get(text)
    if (!achievement) {
      throw new Error(`Achievement not found: "${text}"`)
    }
    return achievement
  })
}
