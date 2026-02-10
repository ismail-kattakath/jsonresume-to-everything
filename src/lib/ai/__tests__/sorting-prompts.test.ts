import {
  buildSkillsSortPrompt,
  buildAchievementsSortPrompt,
  parseSkillsSortResponse,
  parseAchievementsSortResponse,
  applySortedSkills,
  applySortedAchievements,
  type SkillsSortResult,
  type AchievementsSortResult,
} from '@/lib/ai/sorting-prompts'
import type { SkillGroup, Achievement } from '@/types'

describe('sorting-prompts', () => {
  describe('buildSkillsSortPrompt', () => {
    const mockSkills: SkillGroup[] = [
      {
        title: 'Languages',
        skills: [{ text: 'JavaScript' }, { text: 'Python' }],
      },
      { title: 'Frameworks', skills: [{ text: 'React' }, { text: 'Next.js' }] },
    ]
    const mockJobDescription =
      'Looking for a React developer with Python experience'

    it('should include all skill groups in the prompt', () => {
      const prompt = buildSkillsSortPrompt(mockSkills, mockJobDescription)

      expect(prompt).toContain('Languages')
      expect(prompt).toContain('Frameworks')
      expect(prompt).toContain('JavaScript')
      expect(prompt).toContain('Python')
      expect(prompt).toContain('React')
      expect(prompt).toContain('Next.js')
    })

    it('should include the job description', () => {
      const prompt = buildSkillsSortPrompt(mockSkills, mockJobDescription)

      expect(prompt).toContain(mockJobDescription)
    })

    it('should include sorting and extraction instructions', () => {
      const prompt = buildSkillsSortPrompt(mockSkills, mockJobDescription)

      expect(prompt).toContain('IDENTIFY MISSING SKILLS')
      expect(prompt).toContain('groupOrder')
      expect(prompt).toContain('skillOrder')
    })

    it('should produce valid JSON format instructions', () => {
      const prompt = buildSkillsSortPrompt(mockSkills, mockJobDescription)

      expect(prompt).toContain('"groupOrder"')
      expect(prompt).toContain('"skillOrder"')
    })
  })

  describe('buildAchievementsSortPrompt', () => {
    const mockAchievements: Achievement[] = [
      { text: 'Led team of 5 engineers' },
      { text: 'Reduced deployment time by 50%' },
      { text: 'Improved test coverage to 90%' },
    ]
    const mockPosition = 'Senior Engineer'
    const mockOrganization = 'Tech Corp'
    const mockJobDescription = 'Looking for a team lead with DevOps experience'

    it('should include all achievements in the prompt', () => {
      const prompt = buildAchievementsSortPrompt(
        mockAchievements,
        mockPosition,
        mockOrganization,
        mockJobDescription
      )

      expect(prompt).toContain('Led team of 5 engineers')
      expect(prompt).toContain('Reduced deployment time by 50%')
      expect(prompt).toContain('Improved test coverage to 90%')
    })

    it('should include position and organization context', () => {
      const prompt = buildAchievementsSortPrompt(
        mockAchievements,
        mockPosition,
        mockOrganization,
        mockJobDescription
      )

      expect(prompt).toContain(mockPosition)
      expect(prompt).toContain(mockOrganization)
    })

    it('should include the job description', () => {
      const prompt = buildAchievementsSortPrompt(
        mockAchievements,
        mockPosition,
        mockOrganization,
        mockJobDescription
      )

      expect(prompt).toContain(mockJobDescription)
    })

    it('should include sorting instructions', () => {
      const prompt = buildAchievementsSortPrompt(
        mockAchievements,
        mockPosition,
        mockOrganization,
        mockJobDescription
      )

      expect(prompt).toContain('DO NOT add, remove, or modify')
      expect(prompt).toContain('achievementOrder')
    })
  })

  describe('parseSkillsSortResponse', () => {
    const mockSkills: SkillGroup[] = [
      {
        title: 'Languages',
        skills: [{ text: 'JavaScript' }, { text: 'Python' }],
      },
      { title: 'Frameworks', skills: [{ text: 'React' }, { text: 'Next.js' }] },
    ]

    it('should parse valid JSON response', () => {
      const response = JSON.stringify({
        groupOrder: ['Frameworks', 'Languages'],
        skillOrder: {
          Languages: ['Python', 'JavaScript'],
          Frameworks: ['React', 'Next.js'],
        },
      })

      const result = parseSkillsSortResponse(response, mockSkills)

      expect(result).not.toBeNull()
      expect(result?.groupOrder).toEqual(['Frameworks', 'Languages'])
      expect(result?.skillOrder['Languages']).toEqual(['Python', 'JavaScript'])
    })

    it('should allow adding new skills to existing groups', () => {
      const response = JSON.stringify({
        groupOrder: ['Frameworks', 'Languages'],
        skillOrder: {
          Languages: ['Python', 'JavaScript', 'TypeScript'],
          Frameworks: ['React', 'Next.js'],
        },
      })

      const result = parseSkillsSortResponse(response, mockSkills)

      expect(result).not.toBeNull()
      expect(result?.skillOrder['Languages']).toContain('TypeScript')
    })

    it('should allow adding new groups', () => {
      const response = JSON.stringify({
        groupOrder: ['Frameworks', 'Languages', 'Database'],
        skillOrder: {
          Languages: ['Python', 'JavaScript'],
          Frameworks: ['React', 'Next.js'],
          Database: ['PostgreSQL', 'Redis'],
        },
      })

      const result = parseSkillsSortResponse(response, mockSkills)

      expect(result).not.toBeNull()
      expect(result?.groupOrder).toContain('Database')
      expect(result?.skillOrder['Database']).toEqual(['PostgreSQL', 'Redis'])
    })

    it('should return null when ORIGINAL groups are missing', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = JSON.stringify({
        groupOrder: ['Frameworks'], // Missing Languages
        skillOrder: {
          Frameworks: ['React', 'Next.js'],
        },
      })

      const result = parseSkillsSortResponse(response, mockSkills)

      expect(result).toBeNull()
      consoleErrorSpy.mockRestore()
    })

    it('should return null when ORIGINAL skills are missing from a group', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = JSON.stringify({
        groupOrder: ['Frameworks', 'Languages'],
        skillOrder: {
          Languages: ['Python'], // Missing JavaScript
          Frameworks: ['React', 'Next.js'],
        },
      })

      const result = parseSkillsSortResponse(response, mockSkills)

      expect(result).toBeNull()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('parseAchievementsSortResponse', () => {
    const mockAchievements: Achievement[] = [
      { text: 'Achievement A' },
      { text: 'Achievement B' },
      { text: 'Achievement C' },
    ]

    it('should parse valid JSON response', () => {
      const response = JSON.stringify({
        achievementOrder: ['Achievement C', 'Achievement A', 'Achievement B'],
      })

      const result = parseAchievementsSortResponse(response, mockAchievements)

      expect(result).not.toBeNull()
      expect(result?.achievementOrder).toEqual([
        'Achievement C',
        'Achievement A',
        'Achievement B',
      ])
    })

    it('should return null when achievement count mismatch', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = JSON.stringify({
        achievementOrder: ['Achievement A', 'Achievement B'], // Missing C
      })

      const result = parseAchievementsSortResponse(response, mockAchievements)

      expect(result).toBeNull()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('applySortedSkills', () => {
    const mockSkills: SkillGroup[] = [
      {
        title: 'Languages',
        skills: [{ text: 'JavaScript' }, { text: 'Python' }],
      },
      { title: 'Frameworks', skills: [{ text: 'React' }, { text: 'Next.js' }] },
    ]

    it('should correctly reorder groups and skills', () => {
      const sortResult: SkillsSortResult = {
        groupOrder: ['Frameworks', 'Languages'],
        skillOrder: {
          Languages: ['Python', 'JavaScript'],
          Frameworks: ['Next.js', 'React'],
        },
      }

      const result = applySortedSkills(mockSkills, sortResult)

      expect(result![0]!.title).toBe('Frameworks')
      expect(result![1]!.title).toBe('Languages')
      expect(result![0]!.skills[0]!.text).toBe('Next.js')
      expect(result![0]!.skills[1]!.text).toBe('React')
    })

    it('should add new skills and mark them as highlighted', () => {
      const sortResult: SkillsSortResult = {
        groupOrder: ['Languages', 'Frameworks'],
        skillOrder: {
          Languages: ['TypeScript', 'JavaScript', 'Python'],
          Frameworks: ['React', 'Next.js'],
        },
      }

      const result = applySortedSkills(mockSkills, sortResult)

      expect(result![0]!.skills[0]!.text).toBe('TypeScript')
      expect(result![0]!.skills[0]!.highlight).toBe(true)
      expect(result![0]!.skills[1]!.text).toBe('JavaScript')
      expect(result![0]!.skills[1]!.highlight).toBeFalsy() // Original skill
    })

    it('should add new groups and mark their skills as highlighted', () => {
      const sortResult: SkillsSortResult = {
        groupOrder: ['Database', 'Languages', 'Frameworks'],
        skillOrder: {
          Languages: ['JavaScript', 'Python'],
          Frameworks: ['React', 'Next.js'],
          Database: ['PostgreSQL'],
        },
      }

      const result = applySortedSkills(mockSkills, sortResult)

      expect(result![0]!.title).toBe('Database')
      expect(result![0]!.skills[0]!.text).toBe('PostgreSQL')
      expect(result![0]!.skills[0]!.highlight).toBe(true)
    })

    it('should filter out duplicate skills added by AI (case-insensitive)', () => {
      const sortResult: SkillsSortResult = {
        groupOrder: ['Languages', 'Frameworks'],
        skillOrder: {
          Languages: ['javascript', 'Python', 'TypeScript', 'React'], // 'javascript' is duplicate of 'JavaScript', 'React' is duplicate of existing in Frameworks
          Frameworks: ['React', 'Next.js'],
        },
      }

      const result = applySortedSkills(mockSkills, sortResult)

      const languagesGroup = result.find((g) => g.title === 'Languages')
      const frameworksGroup = result.find((g) => g.title === 'Frameworks')

      // Should have: JavaScript (original), Python (original), TypeScript (new)
      expect(languagesGroup?.skills.map((s) => s.text)).toEqual([
        'JavaScript',
        'Python',
        'TypeScript',
      ])
      // 'React' should only be in Frameworks
      expect(frameworksGroup?.skills.map((s) => s.text)).toEqual([
        'React',
        'Next.js',
      ])
    })

    it('should remove empty groups if all their skills were duplicates', () => {
      const sortResult: SkillsSortResult = {
        groupOrder: ['NewGroup', 'Languages', 'Frameworks'],
        skillOrder: {
          NewGroup: ['JavaScript'], // Duplicate of existing
          Languages: ['JavaScript', 'Python'],
          Frameworks: ['React', 'Next.js'],
        },
      }

      const result = applySortedSkills(mockSkills, sortResult)

      expect(result.find((g) => g.title === 'NewGroup')).toBeUndefined()
      expect(result.length).toBe(2)
    })
  })

  describe('applySortedAchievements', () => {
    const mockAchievements: Achievement[] = [
      { text: 'Achievement A' },
      { text: 'Achievement B' },
      { text: 'Achievement C' },
    ]

    it('should correctly reorder achievements', () => {
      const sortResult: AchievementsSortResult = {
        achievementOrder: ['Achievement C', 'Achievement A', 'Achievement B'],
      }

      const result = applySortedAchievements(mockAchievements, sortResult)

      expect(result![0]!.text).toBe('Achievement C')
      expect(result![1]!.text).toBe('Achievement A')
      expect(result![2]!.text).toBe('Achievement B')
    })
  })
})
