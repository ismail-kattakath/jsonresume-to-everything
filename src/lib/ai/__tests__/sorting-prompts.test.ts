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

    it('should include sorting instructions', () => {
      const prompt = buildSkillsSortPrompt(mockSkills, mockJobDescription)

      expect(prompt).toContain('DO NOT add, remove, or modify')
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
      expect(result?.skillOrder.Languages).toEqual(['Python', 'JavaScript'])
    })

    it('should handle markdown code blocks in response', () => {
      const response =
        '```json\n' +
        JSON.stringify({
          groupOrder: ['Frameworks', 'Languages'],
          skillOrder: {
            Languages: ['Python', 'JavaScript'],
            Frameworks: ['React', 'Next.js'],
          },
        }) +
        '\n```'

      const result = parseSkillsSortResponse(response, mockSkills)

      expect(result).not.toBeNull()
      expect(result?.groupOrder).toEqual(['Frameworks', 'Languages'])
    })

    it('should handle plain code blocks (without json specifier)', () => {
      const response =
        '```\n' +
        JSON.stringify({
          groupOrder: ['Frameworks', 'Languages'],
          skillOrder: {
            Languages: ['Python', 'JavaScript'],
            Frameworks: ['React', 'Next.js'],
          },
        }) +
        '\n```'

      const result = parseSkillsSortResponse(response, mockSkills)

      expect(result).not.toBeNull()
      expect(result?.groupOrder).toEqual(['Frameworks', 'Languages'])
    })

    it('should return null for invalid JSON', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = parseSkillsSortResponse('not valid json', mockSkills)

      expect(result).toBeNull()
      consoleErrorSpy.mockRestore()
    })

    it('should return null when groups are missing', () => {
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

    it('should return null when skills are missing from a group', () => {
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

    it('should return null when skillOrder is missing for a group', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = JSON.stringify({
        groupOrder: ['Frameworks', 'Languages'],
        skillOrder: {
          Languages: ['Python', 'JavaScript'],
          // Missing Frameworks
        },
      })

      const result = parseSkillsSortResponse(response, mockSkills)

      expect(result).toBeNull()
      consoleErrorSpy.mockRestore()
    })

    it('should return null for missing groupOrder', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = JSON.stringify({
        skillOrder: {
          Languages: ['Python', 'JavaScript'],
          Frameworks: ['React', 'Next.js'],
        },
      })

      const result = parseSkillsSortResponse(response, mockSkills)

      expect(result).toBeNull()
      consoleErrorSpy.mockRestore()
    })

    it('should return null for missing skillOrder', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = JSON.stringify({
        groupOrder: ['Frameworks', 'Languages'],
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

    it('should handle markdown code blocks in response', () => {
      const response =
        '```json\n' +
        JSON.stringify({
          achievementOrder: ['Achievement C', 'Achievement A', 'Achievement B'],
        }) +
        '\n```'

      const result = parseAchievementsSortResponse(response, mockAchievements)

      expect(result).not.toBeNull()
      expect(result?.achievementOrder).toEqual([
        'Achievement C',
        'Achievement A',
        'Achievement B',
      ])
    })

    it('should handle plain code blocks (without json specifier)', () => {
      const response =
        '```\n' +
        JSON.stringify({
          achievementOrder: ['Achievement C', 'Achievement A', 'Achievement B'],
        }) +
        '\n```'

      const result = parseAchievementsSortResponse(response, mockAchievements)

      expect(result).not.toBeNull()
      expect(result?.achievementOrder).toEqual([
        'Achievement C',
        'Achievement A',
        'Achievement B',
      ])
    })

    it('should return null for invalid JSON', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = parseAchievementsSortResponse(
        'not valid json',
        mockAchievements
      )

      expect(result).toBeNull()
      consoleErrorSpy.mockRestore()
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

    it('should return null when an achievement is missing', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = JSON.stringify({
        achievementOrder: ['Achievement A', 'Achievement B', 'Achievement D'], // D doesn't exist
      })

      const result = parseAchievementsSortResponse(response, mockAchievements)

      expect(result).toBeNull()
      consoleErrorSpy.mockRestore()
    })

    it('should return null for missing achievementOrder', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = JSON.stringify({
        wrongKey: ['Achievement A', 'Achievement B', 'Achievement C'],
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

      expect(result[0].title).toBe('Frameworks')
      expect(result[1].title).toBe('Languages')
      expect(result[0].skills[0].text).toBe('Next.js')
      expect(result[0].skills[1].text).toBe('React')
      expect(result[1].skills[0].text).toBe('Python')
      expect(result[1].skills[1].text).toBe('JavaScript')
    })

    it('should preserve original skill objects', () => {
      const sortResult: SkillsSortResult = {
        groupOrder: ['Languages', 'Frameworks'],
        skillOrder: {
          Languages: ['JavaScript', 'Python'],
          Frameworks: ['React', 'Next.js'],
        },
      }

      const result = applySortedSkills(mockSkills, sortResult)

      // Same order, should be equivalent
      expect(result[0].skills[0]).toBe(mockSkills[0].skills[0])
    })

    it('should throw error for missing group', () => {
      const sortResult: SkillsSortResult = {
        groupOrder: ['NonExistent'],
        skillOrder: {
          NonExistent: [],
        },
      }

      expect(() => applySortedSkills(mockSkills, sortResult)).toThrow(
        'Group "NonExistent" not found'
      )
    })

    it('should throw error for missing skill', () => {
      const sortResult: SkillsSortResult = {
        groupOrder: ['Languages', 'Frameworks'],
        skillOrder: {
          Languages: ['NonExistent', 'Python'],
          Frameworks: ['React', 'Next.js'],
        },
      }

      expect(() => applySortedSkills(mockSkills, sortResult)).toThrow(
        'Skill "NonExistent" not found in group "Languages"'
      )
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

      expect(result[0].text).toBe('Achievement C')
      expect(result[1].text).toBe('Achievement A')
      expect(result[2].text).toBe('Achievement B')
    })

    it('should preserve original achievement objects', () => {
      const sortResult: AchievementsSortResult = {
        achievementOrder: ['Achievement A', 'Achievement B', 'Achievement C'],
      }

      const result = applySortedAchievements(mockAchievements, sortResult)

      // Same order, should be same objects
      expect(result[0]).toBe(mockAchievements[0])
      expect(result[1]).toBe(mockAchievements[1])
      expect(result[2]).toBe(mockAchievements[2])
    })

    it('should throw error for missing achievement', () => {
      const sortResult: AchievementsSortResult = {
        achievementOrder: ['NonExistent'],
      }

      expect(() =>
        applySortedAchievements(mockAchievements, sortResult)
      ).toThrow('Achievement not found: "NonExistent"')
    })
  })
})
