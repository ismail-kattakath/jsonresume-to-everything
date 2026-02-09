import type { ResumeData, SkillGroup, Achievement, Skill } from '@/types'

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

  return `You are an expert tech recruiter who optimizes resume skills sections for maximum ATS and recruiter relevance.

TARGET JOB DESCRIPTION:
${jobDescription}

CURRENT SKILLS DATA (JSON format):
${JSON.stringify(skillsData, null, 2)}

YOUR TASK:
1. Sort the skill groups and skills within each group by relevance to the target job description.
2. IDENTIFY MISSING SKILLS: Look for key technologies, frameworks, or skills mentioned in the JOB DESCRIPTION that are NOT present in the CURRENT SKILLS DATA.
3. ADD MISSING SKILLS: Include these missing skills in the most appropriate existing categories. 
4. NEW CATEGORIES: If a missing skill doesn't fit into any existing category, you may suggest a new category (e.g., "Recommended Skills").

CRITICAL RULES:
1. DO NOT remove or modify existing skills.
2. Every existing skill MUST remain in its original group.
3. NO DUPLICATES: Do not add a skill that already exists in any category in the CURRENT SKILLS DATA.
4. Sort GROUPS so most job-relevant groups appear first.
5. Sort SKILLS within each group so most job-relevant skills (including newly added ones) appear first.
6. Use exact skill names for existing ones (case-sensitive).
7. For NEW skills, use standard industry naming (e.g., "Next.js", "GraphQL").

SORTING STRATEGY:
- Identify key technologies, frameworks, and skills mentioned in the job description.
- Prioritize groups containing those skills.
- Within each group, prioritize skills explicitly mentioned or closely related to job requirements.
- Skills not relevant to the job should be at the end, but NEVER removed.

OUTPUT FORMAT (JSON only, no explanation):
{
  "groupOrder": ["Group Title 1", "Group Title 2", ...],
  "skillOrder": {
    "Group Title 1": ["skill1", "skill2", "new_skill_A", ...],
    "Group Title 2": ["skill1", "skill2", "new_skill_B", ...],
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

    // Validate all ORIGINAL groups are present
    const originalGroupTitles = new Set(originalSkills.map((g) => g.title))
    const responseGroupTitles = new Set(parsed.groupOrder)

    console.log('[parseSkillsSortResponse] Group validation:', {
      originalCount: originalGroupTitles.size,
      responseCount: responseGroupTitles.size,
      original: Array.from(originalGroupTitles),
      response: Array.from(responseGroupTitles),
    })

    // Now we allow more groups than original (AI can suggest new categories)
    if (responseGroupTitles.size < originalGroupTitles.size) {
      console.error(
        '[parseSkillsSortResponse] AI response missing some original groups',
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
    console.log('[parseSkillsSortResponse] All original groups validated')

    // Validate all ORIGINAL skills are present within each original group
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
          `Duplicate skills found in AI response for group "${group.title}".`,
          {
            original: Array.from(originalSkillTexts),
            response: responseSkillTexts,
          }
        )
        return null
      }

      // Now we allow more skills than original (AI adds missing ones)
      if (responseSkillSet.size < originalSkillTexts.size) {
        console.error(
          `Skill count mismatch for group "${group.title}". AI removed some original skills.`,
          {
            original: Array.from(originalSkillTexts),
            response: responseSkillTexts,
          }
        )
        return null
      }

      // Validate all original skills are present in response for this group
      for (const skillText of originalSkillTexts) {
        if (!responseSkillSet.has(skillText)) {
          console.error(
            `Missing original skill "${skillText}" in group "${group.title}" in AI response`,
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
 * Includes any new skills or groups added by the AI
 * Ensures no duplicate skills are added across groups
 */
export function applySortedSkills(
  originalSkills: SkillGroup[],
  sortResult: SkillsSortResult
): SkillGroup[] {
  // Create a map of original groups for quick lookup
  const groupMap = new Map(originalSkills.map((g) => [g.title, g]))

  // Track all seen skills to prevent duplicates across groups
  const seenSkillTexts = new Set<string>()

  // Pre-populate seen skills from original data (normalize to lowercase for case-insensitive check)
  originalSkills.forEach((group) => {
    group.skills.forEach((s) => seenSkillTexts.add(s.text.toLowerCase().trim()))
  })

  // Build sorted result
  return sortResult.groupOrder
    .map((groupTitle) => {
      const originalGroup = groupMap.get(groupTitle)

      if (originalGroup) {
        // Create skill map for ordering existing skills within this group
        const skillMap = new Map(originalGroup.skills.map((s) => [s.text, s]))
        // Case-insensitive map for finding original skills even if AI messed up casing
        const ciSkillMap = new Map(
          originalGroup.skills.map((s) => [s.text.toLowerCase(), s])
        )

        const sortedSkillTexts = sortResult.skillOrder[groupTitle] || []

        const newSkills: Skill[] = []
        sortedSkillTexts.forEach((text) => {
          const originalSkill =
            skillMap.get(text) || ciSkillMap.get(text.toLowerCase())

          if (originalSkill) {
            newSkills.push(originalSkill)
          } else {
            // It's a new skill suggested by AI
            const normalizedText = text.toLowerCase().trim()
            if (!seenSkillTexts.has(normalizedText)) {
              newSkills.push({ text, highlight: true })
              seenSkillTexts.add(normalizedText)
            } else {
              console.log(
                `[applySortedSkills] Skipping duplicate skill: "${text}" added by AI to group "${groupTitle}"`
              )
            }
          }
        })

        return {
          ...originalGroup,
          skills: newSkills,
        }
      } else {
        // It's a new group suggested by AI
        const sortedSkillTexts = sortResult.skillOrder[groupTitle] || []
        const newGroupSkills: Skill[] = []

        sortedSkillTexts.forEach((text) => {
          const normalizedText = text.toLowerCase().trim()
          if (!seenSkillTexts.has(normalizedText)) {
            newGroupSkills.push({ text, highlight: true })
            seenSkillTexts.add(normalizedText)
          } else {
            console.log(
              `[applySortedSkills] Skipping duplicate skill: "${text}" added by AI to new group "${groupTitle}"`
            )
          }
        })

        return {
          title: groupTitle,
          skills: newGroupSkills,
        }
      }
    })
    .filter((group) => group.skills.length > 0) // Remove empty groups if all their skills were duplicates
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
