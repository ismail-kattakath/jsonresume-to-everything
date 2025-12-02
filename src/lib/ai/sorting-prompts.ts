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
  console.log(
    '[buildSkillsSortPrompt] Input skills:',
    JSON.stringify(skills, null, 2)
  )

  const skillsData = skills.map((group) => ({
    title: group.title,
    skills: (group.skills || []).map((s) => s.text),
  }))

  console.log(
    '[buildSkillsSortPrompt] Processed skillsData:',
    JSON.stringify(skillsData, null, 2)
  )

  return `You are an expert tech recruiter who optimizes resume skills sections for maximum recruiter relevance.

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
  console.log('[buildAchievementsSortPrompt] Input achievements:', achievements)

  const achievementTexts = (achievements || [])
    .map((a) => {
      // Handle both nested and flat structures
      const text =
        typeof a?.text === 'string' ? a.text : (a?.text as any)?.text || ''
      return text
    })
    .filter(Boolean)

  console.log(
    '[buildAchievementsSortPrompt] Extracted achievement texts:',
    achievementTexts
  )

  return `You are an expert tech recruiter who optimizes resume achievements for maximum recruiter relevance.

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
    console.log(
      '[parseSkillsSortResponse] Raw response:',
      response.substring(0, 200) + '...'
    )

    // Clean the response - remove markdown code blocks if present
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7)
      console.log('[parseSkillsSortResponse] Removed ```json prefix')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3)
      console.log('[parseSkillsSortResponse] Removed ``` prefix')
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
      console.log('[parseSkillsSortResponse] Removed ``` suffix')
    }
    cleaned = cleaned.trim()

    console.log(
      '[parseSkillsSortResponse] Cleaned response:',
      cleaned.substring(0, 200) + '...'
    )
    const parsed = JSON.parse(cleaned) as SkillsSortResult
    console.log('[parseSkillsSortResponse] Successfully parsed JSON')

    // Validate structure
    if (!parsed.groupOrder || !Array.isArray(parsed.groupOrder)) {
      console.error(
        '[parseSkillsSortResponse] Invalid groupOrder in AI response',
        parsed
      )
      return null
    }
    console.log('[parseSkillsSortResponse] groupOrder is valid')

    if (!parsed.skillOrder || typeof parsed.skillOrder !== 'object') {
      console.error(
        '[parseSkillsSortResponse] Invalid skillOrder in AI response',
        parsed
      )
      return null
    }
    console.log('[parseSkillsSortResponse] skillOrder is valid')

    // Validate all groups are present
    const originalGroupTitles = new Set(originalSkills.map((g) => g.title))
    const responseGroupTitles = new Set(parsed.groupOrder)

    console.log('[parseSkillsSortResponse] Group validation:', {
      originalCount: originalGroupTitles.size,
      responseCount: responseGroupTitles.size,
      original: Array.from(originalGroupTitles),
      response: Array.from(responseGroupTitles),
    })

    if (originalGroupTitles.size !== responseGroupTitles.size) {
      console.error(
        '[parseSkillsSortResponse] Group count mismatch in AI response',
        {
          original: Array.from(originalGroupTitles),
          response: Array.from(responseGroupTitles),
        }
      )
      return null
    }

    for (const title of originalGroupTitles) {
      if (!responseGroupTitles.has(title)) {
        console.error(
          `[parseSkillsSortResponse] Missing group "${title}" in AI response`
        )
        return null
      }
    }
    console.log('[parseSkillsSortResponse] All groups validated')

    // Validate all skills are present within each group
    for (const group of originalSkills) {
      const originalSkillTexts = new Set(group.skills.map((s) => s.text))
      const responseSkillTexts = parsed.skillOrder[group.title]

      if (!responseSkillTexts || !Array.isArray(responseSkillTexts)) {
        console.error(`Missing skill order for group "${group.title}"`)
        return null
      }

      // Check for duplicates in AI response
      const responseSkillSet = new Set(responseSkillTexts)
      if (responseSkillSet.size !== responseSkillTexts.length) {
        console.error(
          `Duplicate skills found in AI response for group "${group.title}". Expected ${responseSkillTexts.length} unique skills but got ${responseSkillSet.size}.`,
          {
            original: Array.from(originalSkillTexts),
            response: responseSkillTexts,
          }
        )
        return null
      }

      // Validate count matches
      if (originalSkillTexts.size !== responseSkillSet.size) {
        console.error(
          `Skill count mismatch for group "${group.title}". Expected ${originalSkillTexts.size} skills but got ${responseSkillSet.size}.`,
          {
            original: Array.from(originalSkillTexts),
            response: responseSkillTexts,
          }
        )
        return null
      }

      // Validate all original skills are present in response
      for (const skillText of originalSkillTexts) {
        if (!responseSkillSet.has(skillText)) {
          console.error(
            `Missing skill "${skillText}" in group "${group.title}"`,
            {
              original: Array.from(originalSkillTexts),
              response: responseSkillTexts,
            }
          )
          return null
        }
      }
    }

    console.log(
      '[parseSkillsSortResponse] ✅ All validations passed, returning result'
    )
    return parsed
  } catch (error) {
    console.error(
      '[parseSkillsSortResponse] ❌ Failed to parse AI skills sort response:',
      error
    )
    console.error('[parseSkillsSortResponse] Response was:', response)
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
    console.log(
      '[parseAchievementsSortResponse] Raw response (full):',
      response
    )
    console.log(
      '[parseAchievementsSortResponse] Raw response (first 200):',
      response.substring(0, 200) + '...'
    )

    // Clean the response - remove markdown code blocks if present
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7)
      console.log('[parseAchievementsSortResponse] Removed ```json prefix')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3)
      console.log('[parseAchievementsSortResponse] Removed ``` prefix')
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
      console.log('[parseAchievementsSortResponse] Removed ``` suffix')
    }
    cleaned = cleaned.trim()

    console.log(
      '[parseAchievementsSortResponse] Cleaned response (full):',
      cleaned
    )
    console.log(
      '[parseAchievementsSortResponse] Cleaned response (first 200):',
      cleaned.substring(0, 200) + '...'
    )
    const parsed = JSON.parse(cleaned) as AchievementsSortResult
    console.log('[parseAchievementsSortResponse] Successfully parsed JSON')
    console.log('[parseAchievementsSortResponse] Parsed object:', parsed)
    console.log(
      '[parseAchievementsSortResponse] parsed.achievementOrder:',
      parsed.achievementOrder
    )

    // Validate structure
    if (!parsed.achievementOrder || !Array.isArray(parsed.achievementOrder)) {
      console.error(
        '[parseAchievementsSortResponse] Invalid achievementOrder in AI response',
        parsed
      )
      return null
    }
    console.log(
      '[parseAchievementsSortResponse] achievementOrder is valid, length:',
      parsed.achievementOrder.length
    )

    // Validate all achievements are present
    // Handle both nested and flat structures like in buildAchievementsSortPrompt
    const originalTexts = new Set(
      originalAchievements
        .map((a) => {
          const text =
            typeof a?.text === 'string' ? a.text : (a?.text as any)?.text || ''
          return text
        })
        .filter(Boolean)
    )
    const responseTexts = new Set(parsed.achievementOrder)

    console.log('[parseAchievementsSortResponse] Achievement validation:')
    console.log('  Original count:', originalTexts.size)
    console.log('  Response count:', responseTexts.size)
    console.log('  Original achievements:', Array.from(originalTexts))
    console.log('  Response achievements:', Array.from(responseTexts))

    if (originalTexts.size !== responseTexts.size) {
      console.error(
        '[parseAchievementsSortResponse] ❌ Achievement count mismatch!'
      )
      console.error('  Expected:', originalTexts.size, 'achievements')
      console.error('  Received:', responseTexts.size, 'achievements')
      console.error('  Original:', Array.from(originalTexts))
      console.error('  Response:', Array.from(responseTexts))
      return null
    }

    for (const text of originalTexts) {
      if (!responseTexts.has(text)) {
        console.error(
          `[parseAchievementsSortResponse] Missing achievement in AI response: "${text}"`,
          {
            original: Array.from(originalTexts),
            response: Array.from(responseTexts),
          }
        )
        return null
      }
    }

    console.log(
      '[parseAchievementsSortResponse] ✅ All validations passed, returning result'
    )
    return parsed
  } catch (error) {
    console.error(
      '[parseAchievementsSortResponse] ❌ Failed to parse AI achievements sort response:',
      error
    )
    console.error('[parseAchievementsSortResponse] Response was:', response)
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
  // Handle both nested and flat structures
  const achievementMap = new Map(
    originalAchievements.map((a) => {
      const text =
        typeof a?.text === 'string' ? a.text : (a?.text as any)?.text || ''
      return [text, a]
    })
  )

  // Build sorted result
  return sortResult.achievementOrder.map((text) => {
    const achievement = achievementMap.get(text)
    if (!achievement) {
      throw new Error(`Achievement not found: "${text}"`)
    }
    return achievement
  })
}
