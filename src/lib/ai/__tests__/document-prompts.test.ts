import {
  buildCoverLetterPrompt,
  validateCoverLetter,
  postProcessCoverLetter,
} from '@/lib/ai/document-prompts'
import type { ResumeData } from '@/types'

const mockResumeData: ResumeData = {
  name: 'Jane Smith',
  position: 'Senior Developer',
  contactInformation: '+1234567890',
  email: 'jane@example.com',
  address: '123 Main St',
  profilePicture: '',
  calendarLink: '',
  socialMedia: [],
  summary:
    'Experienced full-stack developer with 8 years of building web applications',
  education: [],
  workExperience: [
    {
      company: 'Tech Corp',
      url: 'techcorp.com',
      position: 'Lead Engineer',
      description: 'Leading a team',
      keyAchievements: [
        { text: 'Built microservices architecture' },
        { text: 'Reduced deployment time by 70%' },
        { text: 'Mentored 5 junior developers' },
      ],
      startYear: '2020',
      endYear: 'Present',
      technologies: ['React', 'Node.js', 'AWS'],
    },
    {
      company: 'StartupCo',
      url: 'startupco.com',
      position: 'Frontend Developer',
      description: 'Building UI',
      keyAchievements: [
        { text: 'Created design system' },
        { text: 'Improved performance by 40%' },
      ],
      startYear: '2018',
      endYear: '2020',
      technologies: ['Vue.js', 'TypeScript'],
    },
  ],
  skills: [
    {
      title: 'Programming',
      skills: [
        { text: 'JavaScript', highlight: false },
        { text: 'TypeScript', highlight: false },
        { text: 'Python', highlight: false },
      ],
    },
    {
      title: 'Frameworks',
      skills: [
        { text: 'React', highlight: false },
        { text: 'Node.js', highlight: false },
      ],
    },
  ],
  languages: ['English'],
  certifications: [],
}

describe('Cover Letter Prompt Engineering', () => {
  describe('buildCoverLetterPrompt', () => {
    it('includes candidate name and position', () => {
      const prompt = buildCoverLetterPrompt(
        mockResumeData,
        'Looking for a senior developer'
      )

      expect(prompt).toContain('Jane Smith')
      expect(prompt).toContain('Senior Developer')
    })

    it('includes professional summary', () => {
      const prompt = buildCoverLetterPrompt(mockResumeData, 'Job description')

      expect(prompt).toContain(mockResumeData.summary)
    })

    it('includes work experience with achievements', () => {
      const prompt = buildCoverLetterPrompt(mockResumeData, 'Job description')

      expect(prompt).toContain('Tech Corp')
      expect(prompt).toContain('Lead Engineer')
      expect(prompt).toContain('microservices architecture')
      expect(prompt).toContain('StartupCo')
    })

    it('limits work experience to top 3 positions', () => {
      const dataWithManyJobs: ResumeData = {
        ...mockResumeData,
        workExperience: [
          ...mockResumeData.workExperience,
          {
            company: 'Company3',
            url: '',
            position: 'Position3',
            description: '',
            keyAchievements: [{ text: 'Achievement 3' }],
            startYear: '2015',
            endYear: '2018',
            technologies: [],
          },
          {
            company: 'Company4',
            url: '',
            position: 'Position4',
            description: '',
            keyAchievements: [{ text: 'Achievement 4' }],
            startYear: '2012',
            endYear: '2015',
            technologies: [],
          },
        ],
      }

      const prompt = buildCoverLetterPrompt(dataWithManyJobs, 'Job description')

      // Should include first 3 jobs
      expect(prompt).toContain('Company3')
      // Should not include 4th job
      expect(prompt).not.toContain('Company4')
    })

    it('includes skills summary', () => {
      const prompt = buildCoverLetterPrompt(mockResumeData, 'Job description')

      expect(prompt).toContain('JavaScript')
      expect(prompt).toContain('TypeScript')
      expect(prompt).toContain('React')
    })

    it('limits top 3 achievements per job', () => {
      const dataWithManyAchievements: ResumeData = {
        ...mockResumeData,
        workExperience: [
          {
            ...mockResumeData.workExperience[0],
            keyAchievements: [
              { text: 'Achievement 1' },
              { text: 'Achievement 2' },
              { text: 'Achievement 3' },
              { text: 'Achievement 4' },
              { text: 'Achievement 5' },
            ],
          },
        ],
      }

      const prompt = buildCoverLetterPrompt(
        dataWithManyAchievements,
        'Job description'
      )

      // Count semicolons (achievements separator)
      const achievementCount = (prompt.match(/Achievement/g) || []).length
      expect(achievementCount).toBeLessThanOrEqual(3)
    })

    it('includes job description', () => {
      const jobDesc =
        'We are looking for a React developer with 5+ years of experience'
      const prompt = buildCoverLetterPrompt(mockResumeData, jobDesc)

      expect(prompt).toContain(jobDesc)
    })

    it('includes generation instructions', () => {
      const prompt = buildCoverLetterPrompt(mockResumeData, 'Job description')

      expect(prompt).toContain('3-4 paragraphs')
      expect(prompt).toContain('250-350 words')
      expect(prompt).toContain('DO NOT include a salutation')
      expect(prompt).toContain('DO NOT include placeholders')
    })
  })

  describe('validateCoverLetter', () => {
    it('validates correct cover letter', () => {
      const content =
        'I am writing to express my interest in the position. With 8 years of experience in full-stack development, I have successfully built and deployed numerous web applications. My expertise in React and Node.js aligns perfectly with your requirements. I would love to discuss how my skills can contribute to your team.'

      const result = validateCoverLetter(content)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects cover letter that is too short', () => {
      const content = 'I want this job.'

      const result = validateCoverLetter(content)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Cover letter is too short')
    })

    it('rejects cover letter that is too long', () => {
      const content = 'A'.repeat(2500)

      const result = validateCoverLetter(content)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Cover letter is too long')
    })

    it('detects placeholder [Company Name]', () => {
      const content =
        'I am very interested in joining [Company Name] because I believe my skills align well with your requirements. '.repeat(
          3
        )

      const result = validateCoverLetter(content)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.includes('[Company Name]'))).toBe(true)
    })

    it('detects unwanted salutation', () => {
      const content =
        'Dear Hiring Manager, I am writing to express my interest in the position. With years of experience, I have built many applications. '.repeat(
          2
        )

      const result = validateCoverLetter(content)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.includes('Dear Hiring Manager'))).toBe(
        true
      )
    })

    it('detects unwanted closing', () => {
      const content =
        'I am interested in this position. My experience aligns well with your needs. '.repeat(
          3
        ) + 'Sincerely, John Doe'

      const result = validateCoverLetter(content)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.includes('Sincerely,'))).toBe(true)
    })
  })

  describe('postProcessCoverLetter', () => {
    it('trims whitespace', () => {
      const content = '  \n  Content here  \n  '
      const result = postProcessCoverLetter(content)

      expect(result).toBe('Content here')
    })

    it('removes leading/trailing quotes', () => {
      const content = '"This is a cover letter"'
      const result = postProcessCoverLetter(content)

      expect(result).toBe('This is a cover letter')
    })

    it('normalizes excessive line breaks', () => {
      const content = 'Paragraph 1\n\n\n\n\nParagraph 2'
      const result = postProcessCoverLetter(content)

      expect(result).toBe('Paragraph 1\n\nParagraph 2')
    })

    it('removes markdown bold formatting', () => {
      const content = 'This is **bold text** in cover letter'
      const result = postProcessCoverLetter(content)

      expect(result).toBe('This is bold text in cover letter')
    })

    it('removes markdown italic formatting', () => {
      const content = 'This is *italic text* in cover letter'
      const result = postProcessCoverLetter(content)

      expect(result).toBe('This is italic text in cover letter')
    })

    it('removes markdown headings', () => {
      const content = '# Heading\nContent here'
      const result = postProcessCoverLetter(content)

      expect(result).toBe('Heading\nContent here')
    })

    it('handles complex formatting cleanup', () => {
      const content =
        '  \n"**Introduction**\n\n\n\nI am interested in this *role*."\n  '
      const result = postProcessCoverLetter(content)

      expect(result).toBe('Introduction\n\nI am interested in this role.')
    })

    it('preserves valid paragraph breaks', () => {
      const content =
        'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.'
      const result = postProcessCoverLetter(content)

      expect(result).toBe(content)
    })
  })
})
