import {
  buildOnDeviceRefineJDPrompt,
  buildOnDeviceExtractSkillsPrompt,
  buildOnDeviceCoverLetterPrompt,
  buildOnDeviceSummaryPrompt,
  buildOnDeviceWorkExperiencePrompt,
} from '@/lib/ai/on-device/prompts'

describe('prompts', () => {
  const mockResume = {
    name: 'John Doe',
    position: 'Software Engineer',
    workExperience: [
      {
        organization: 'Company A',
        position: 'Dev',
        keyAchievements: [{ text: 'Did things' }],
        summary: 'Good times',
      },
    ],
    skills: [
      {
        title: 'Languages',
        skills: [{ text: 'JavaScript' }],
      },
    ],
  } as any

  describe('buildOnDeviceRefineJDPrompt', () => {
    it('generates prompt for job description', () => {
      const prompt = buildOnDeviceRefineJDPrompt('Full stack dev role')
      expect(prompt).toContain('Full stack dev role')
      expect(prompt).toContain('Refine the provided job description')
    })

    it('handles empty string', () => {
      expect(buildOnDeviceRefineJDPrompt('')).toBeDefined()
    })
  })

  describe('buildOnDeviceExtractSkillsPrompt', () => {
    it('generates prompt for skill extraction', () => {
      const prompt = buildOnDeviceExtractSkillsPrompt('React, Node')
      expect(prompt).toContain('React, Node')
      expect(prompt).toContain('Extract the top 10 relevant hard skills')
    })

    it('handles empty string', () => {
      expect(buildOnDeviceExtractSkillsPrompt('')).toBeDefined()
    })
  })

  describe('buildOnDeviceCoverLetterPrompt', () => {
    it('generates prompt with resume and JD', () => {
      const prompt = buildOnDeviceCoverLetterPrompt(mockResume, 'JD Text')
      expect(prompt).toContain('JD Text')
      expect(prompt).toContain('John Doe')
      expect(prompt).toContain('Company A')
    })

    it('handles missing data', () => {
      const prompt = buildOnDeviceCoverLetterPrompt({} as any, '')
      expect(prompt).toBeDefined()
      expect(prompt).toContain('No work experience provided')
      expect(prompt).toContain('No skills provided')
    })
  })

  describe('buildOnDeviceSummaryPrompt', () => {
    it('generates prompt with resume data', () => {
      const prompt = buildOnDeviceSummaryPrompt(mockResume, 'JD content')
      expect(prompt).toContain('JD content')
      expect(prompt).toContain('John Doe')
    })

    it('handles defaults', () => {
      const prompt = buildOnDeviceSummaryPrompt({} as any, '')
      expect(prompt).toBeDefined()
      expect(prompt).toContain('Candidate')
    })
  })

  describe('buildOnDeviceWorkExperiencePrompt', () => {
    it('generates prompt for experience tailoring', () => {
      const prompt = buildOnDeviceWorkExperiencePrompt(
        'Existing description',
        'Software Engineer',
        'Google',
        ['Achievement 1'],
        'JD text'
      )
      expect(prompt).toContain('JD text')
      expect(prompt).toContain('Google')
      expect(prompt).toContain('Achievement 1')
    })

    it('handles missing fields', () => {
      const prompt = buildOnDeviceWorkExperiencePrompt('', '', '', [], '')
      expect(prompt).toBeDefined()
    })
  })
})
