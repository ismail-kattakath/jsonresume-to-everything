// @ts-nocheck
import {
  buildCoverLetterPrompt,
  validateCoverLetter,
  postProcessCoverLetter,
  buildJobTitlePrompt,
  validateJobTitle,
  postProcessJobTitle,
  buildSkillsToHighlightPrompt,
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
      organization: 'Tech Corp',
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
      organization: 'StartupCo',
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
            organization: 'Company3',
            url: '' as any,
            position: 'Position3',
            description: '',
            keyAchievements: [{ text: 'Achievement 3' }],
            startYear: '2015',
            endYear: '2018',
            technologies: [],
          },
          {
            organization: 'Company4',
            url: '' as any,
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

describe('Job Title Prompt Engineering', () => {
  describe('buildJobTitlePrompt', () => {
    it('includes candidate current position', () => {
      const prompt = buildJobTitlePrompt(
        mockResumeData,
        'Looking for a Senior Full Stack Engineer'
      )

      expect(prompt).toContain('Senior Developer')
    })

    it('includes recent positions', () => {
      const prompt = buildJobTitlePrompt(
        mockResumeData,
        'Software Engineering role'
      )

      expect(prompt).toContain('Lead Engineer')
      expect(prompt).toContain('Frontend Developer')
    })

    it('limits recent positions to top 3', () => {
      const dataWithManyJobs: ResumeData = {
        ...mockResumeData,
        workExperience: [
          ...mockResumeData.workExperience,
          {
            organization: 'Company3',
            url: '' as any,
            position: 'Position3',
            description: '',
            keyAchievements: [],
            startYear: '2015',
            endYear: '2018',
            technologies: [],
          },
          {
            organization: 'Company4',
            url: '' as any,
            position: 'Position4',
            description: '',
            keyAchievements: [],
            startYear: '2012',
            endYear: '2015',
            technologies: [],
          },
        ],
      }

      const prompt = buildJobTitlePrompt(dataWithManyJobs, 'Job description')

      expect(prompt).toContain('Position3')
      expect(prompt).not.toContain('Position4')
    })

    it('includes key skills', () => {
      const prompt = buildJobTitlePrompt(mockResumeData, 'Job description')

      expect(prompt).toContain('JavaScript')
      expect(prompt).toContain('TypeScript')
      expect(prompt).toContain('React')
    })

    it('limits skills to top 10', () => {
      const dataWithManySkills: ResumeData = {
        ...mockResumeData,
        skills: [
          {
            title: 'Programming',
            skills: Array.from({ length: 15 }, (_, i) => ({
              text: `Skill${i + 1}`,
              highlight: false,
            })),
          },
        ],
      }

      const prompt = buildJobTitlePrompt(dataWithManySkills, 'Job description')

      expect(prompt).toContain('Skill1')
      expect(prompt).toContain('Skill10')
      expect(prompt).not.toContain('Skill11')
    })

    it('includes job description', () => {
      const jobDesc = 'Senior Full Stack Engineer with React and Node.js'
      const prompt = buildJobTitlePrompt(mockResumeData, jobDesc)

      expect(prompt).toContain(jobDesc)
    })

    it('includes generation instructions', () => {
      const prompt = buildJobTitlePrompt(mockResumeData, 'Job description')

      expect(prompt).toContain('2-6 words maximum')
      expect(prompt).toContain('ONLY the job title')
      expect(prompt).toContain('Title case')
      expect(prompt).toContain('Maximum 60 characters')
    })

    it('handles empty work experience', () => {
      const dataWithNoExperience: ResumeData = {
        ...mockResumeData,
        workExperience: [],
      }

      const prompt = buildJobTitlePrompt(
        dataWithNoExperience,
        'Entry level position'
      )

      expect(prompt).toContain('No experience provided')
      expect(prompt).toBeTruthy()
    })

    it('handles empty skills', () => {
      const dataWithNoSkills: ResumeData = {
        ...mockResumeData,
        skills: [],
      }

      const prompt = buildJobTitlePrompt(dataWithNoSkills, 'Job description')

      expect(prompt).toContain('No skills provided')
      expect(prompt).toBeTruthy()
    })
  })

  describe('validateJobTitle', () => {
    it('validates correct job title', () => {
      const title = 'Senior Software Engineer'

      const result = validateJobTitle(title)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('validates multi-word titles', () => {
      const titles = [
        'Lead Frontend Developer',
        'Principal Full Stack Engineer',
        'Staff Software Engineer',
        'Engineering Manager',
      ]

      titles.forEach((title) => {
        const result = validateJobTitle(title)
        expect(result.isValid).toBe(true)
      })
    })

    it('rejects title that is too short', () => {
      const title = 'De'

      const result = validateJobTitle(title)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Job title is too short')
    })

    it('rejects title that is too long', () => {
      const title = 'A'.repeat(70)

      const result = validateJobTitle(title)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Job title exceeds 60 character limit')
    })

    it('detects placeholder brackets', () => {
      const title = '[Position Title]'

      const result = validateJobTitle(title)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.includes('placeholder'))).toBe(true)
    })

    it('detects quotes in title', () => {
      const title = '"Senior Developer"'

      const result = validateJobTitle(title)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.includes('quotes'))).toBe(true)
    })

    it('detects multiple lines', () => {
      const title = 'Senior Developer\nFull Stack'

      const result = validateJobTitle(title)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.includes('single line'))).toBe(true)
    })
  })

  describe('postProcessJobTitle', () => {
    it('trims whitespace', () => {
      const title = '  Senior Developer  '
      const result = postProcessJobTitle(title)

      expect(result).toBe('Senior Developer')
    })

    it('removes leading/trailing quotes', () => {
      const title = '"Senior Developer"'
      const result = postProcessJobTitle(title)

      expect(result).toBe('Senior Developer')
    })

    it('removes trailing periods', () => {
      const title = 'Senior Developer.'
      const result = postProcessJobTitle(title)

      expect(result).toBe('Senior Developer')
    })

    it('applies title case', () => {
      const title = 'senior software engineer'
      const result = postProcessJobTitle(title)

      expect(result).toBe('Senior Software Engineer')
    })

    it('handles mixed case input', () => {
      const title = 'sEnIoR sOfTwArE eNgInEeR'
      const result = postProcessJobTitle(title)

      expect(result).toBe('SEnIoR SOfTwArE ENgInEeR')
    })

    it('handles single quotes', () => {
      const title = "'Lead Developer'"
      const result = postProcessJobTitle(title)

      expect(result).toBe('Lead Developer')
    })

    it('handles multiple trailing periods', () => {
      const title = 'Senior Developer...'
      const result = postProcessJobTitle(title)

      expect(result).toBe('Senior Developer')
    })

    it('handles complex cleanup', () => {
      const title = '  "senior full stack engineer"...  '
      const result = postProcessJobTitle(title)

      expect(result).toBe('Senior Full Stack Engineer')
    })
  })
})

describe('Skills to Highlight Prompt Engineering', () => {
  describe('buildSkillsToHighlightPrompt', () => {
    it('includes target job description', () => {
      const jobDesc = 'Looking for a Senior React Engineer with Node.js and AWS'
      const prompt = buildSkillsToHighlightPrompt(jobDesc)

      expect(prompt).toContain(jobDesc)
    })

    it('contains instruction to extract ONLY from JD', () => {
      const prompt = buildSkillsToHighlightPrompt('Job description')

      expect(prompt).toContain('Extract ONLY skills')
      expect(prompt).toContain(
        'DO NOT include any skills that are NOT mentioned'
      )
    })

    it('contains formatting instructions', () => {
      const prompt = buildSkillsToHighlightPrompt('Job description')

      expect(prompt).toContain('comma-separated list')
      expect(prompt).toContain('proper professional branding')
    })
  })
})
