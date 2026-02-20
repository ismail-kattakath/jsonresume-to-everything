import { convertResumeToMarkdown } from '@/lib/exporters/markdown-exporter'
import { ResumeData, WorkExperience, Project } from '@/types/resume'

describe('markdownExporter', () => {
  const mockResumeData: ResumeData = {
    name: 'John Doe',
    position: 'Senior Software Engineer',
    email: 'john.doe@example.com',
    contactInformation: '+1 (555) 123-4567',
    address: '123 Main St, San Francisco, CA 94102',
    profilePicture: '',
    socialMedia: [
      { socialMedia: 'LinkedIn', link: 'https://linkedin.com/in/johndoe' },
      { socialMedia: 'GitHub', link: 'https://github.com/johndoe' },
    ],
    summary: 'Experienced software engineer with expertise in full-stack development.',
    education: [
      {
        school: 'University of California',
        url: 'https://berkeley.edu',
        studyType: 'Bachelor of Science',
        area: 'Computer Science',
        startYear: '2010',
        endYear: '2014',
      },
    ],
    workExperience: [
      {
        organization: 'Tech Corp',
        url: 'https://techcorp.com',
        position: 'Senior Software Engineer',
        description: 'Led development of core platform features.',
        keyAchievements: [{ text: 'Improved performance by 40%' }, { text: 'Mentored 5 junior developers' }],
        startYear: '2020',
        endYear: 'Present',
        technologies: ['React', 'Node.js', 'TypeScript'],
        showTechnologies: true,
      },
    ],
    skills: [
      {
        title: 'Programming Languages',
        skills: [{ text: 'JavaScript' }, { text: 'TypeScript' }, { text: 'Python' }],
      },
    ],
    projects: [
      {
        name: 'Open Source Project',
        link: 'https://github.com/johndoe/project',
        description: 'A popular open source library.',
        keyAchievements: [{ text: '1000+ stars on GitHub' }],
        startYear: '2019',
        endYear: 'Present',
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2021-06',
        url: 'https://aws.amazon.com/certification',
      },
    ],
    languages: ['English', 'Spanish'],
  }

  describe('convertResumeToMarkdown', () => {
    it('should convert resume data to Markdown format', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('JOHN DOE')
      expect(result).toContain('Senior Software Engineer')
      expect(result).toContain('john.doe@example.com')
      expect(result).toContain('+1 (555) 123-4567')
    })

    it('should include all major sections', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('## SUMMARY')
      expect(result).toContain('## EXPERIENCE')
      expect(result).toContain('## EDUCATION')
      expect(result).toContain('## SKILLS')
      expect(result).toContain('## PROJECTS')
      expect(result).toContain('## CERTIFICATIONS')
      expect(result).toContain('## LANGUAGES')
    })

    it('should format work experience correctly', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('### Senior Software Engineer @ [Tech Corp](https://techcorp.com)')
      expect(result).toContain('2020 - Present')
      expect(result).toContain('Led development of core platform features.')
      expect(result).toContain('- Improved performance by 40%')
      expect(result).toContain('> Tech Stack: React, Node.js, TypeScript')
    })

    it('should format education correctly', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('### Bachelor of Science in Computer Science')
      expect(result).toContain('2010 - 2014  ')
      expect(result).toContain('[University of California](https://berkeley.edu)')
    })

    it('should include social media links', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('- LinkedIn: [https://linkedin.com/in/johndoe](https://linkedin.com/in/johndoe)')
      expect(result).toContain('- GitHub: [https://github.com/johndoe](https://github.com/johndoe)')
    })

    it('should handle empty optional sections gracefully', () => {
      const minimalData: ResumeData = {
        name: 'Jane Smith',
        position: 'Developer',
        email: 'jane@example.com',
        contactInformation: '',
        address: '',
        profilePicture: '',
        socialMedia: [],
        summary: '',
        education: [],
        workExperience: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
      }

      const result = convertResumeToMarkdown(minimalData)

      expect(result).toContain('JANE SMITH')
      expect(result).toContain('Developer')
      expect(result).not.toContain('## SUMMARY')
      expect(result).not.toContain('## EXPERIENCE')
    })

    it('should include contact information when provided', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('- Email: [john.doe@example.com](mailto:john.doe@example.com)')
      expect(result).toContain('- Phone: +1 (555) 123-4567')
      expect(result).toContain('- Address: 123 Main St, San Francisco, CA 94102')
    })

    it('should handle missing email gracefully', () => {
      const dataWithoutEmail: ResumeData = {
        ...mockResumeData,
        email: '',
      }
      const result = convertResumeToMarkdown(dataWithoutEmail)
      expect(result).not.toContain('Email:')
    })

    it('should format work experience with description', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('Led development of core platform features.')
    })

    it('should format work experience without description to increase coverage', () => {
      const firstJob = mockResumeData.workExperience[0]
      const dataWithoutDesc: ResumeData = {
        ...mockResumeData,
        workExperience: [
          {
            ...firstJob,
            description: '',
          } as WorkExperience,
        ],
      }
      const result = convertResumeToMarkdown(dataWithoutDesc)
      expect(result).toContain('### Senior Software Engineer @ [Tech Corp]')
    })

    it('should format work experience without technologies when showTechnologies is false', () => {
      const dataWithHiddenTech: ResumeData = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Tech Corp',
            url: 'https://techcorp.com',
            position: 'Developer',
            description: 'Work description',
            keyAchievements: [],
            startYear: '2020',
            endYear: 'Present',
            technologies: ['React', 'Node.js'],
            showTechnologies: false,
          },
        ],
      }

      const result = convertResumeToMarkdown(dataWithHiddenTech)

      expect(result).not.toContain('> Tech Stack:')
    })

    it('should format projects with description', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('A popular open source library.')
    })

    it('should format projects without description to increase coverage', () => {
      const firstProject = mockResumeData.projects![0]
      const dataWithoutDesc: ResumeData = {
        ...mockResumeData,
        projects: [
          {
            ...firstProject,
            description: '',
          } as Project,
        ],
      }
      const result = convertResumeToMarkdown(dataWithoutDesc)
      expect(result).toContain('### [Open Source Project]')
    })

    it('should format items with partial years to increase coverage', () => {
      const firstProject = mockResumeData.projects![0]
      const dataPartialYears: ResumeData = {
        ...mockResumeData,
        projects: [
          {
            ...firstProject,
            startYear: '2019',
            endYear: '',
          } as Project,
          {
            ...firstProject,
            name: 'Project 2',
            startYear: '',
            endYear: '2020',
          } as Project,
        ],
      }
      const result = convertResumeToMarkdown(dataPartialYears)
      expect(result).toContain('2019')
      expect(result).toContain('2020')
    })

    it('should format projects with highlights', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('- 1000+ stars on GitHub')
    })

    it('should format certifications with URL', () => {
      const result = convertResumeToMarkdown(mockResumeData)

      expect(result).toContain('- Verification: https://aws.amazon.com/certification')
    })

    it('should handle multiple work experiences', () => {
      const dataWithMultipleJobs: ResumeData = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Company A',
            url: '',
            position: 'Senior Developer',
            description: 'First job',
            keyAchievements: [],
            startYear: '2020',
            endYear: 'Present',
            technologies: [],
            showTechnologies: false,
          },
          {
            organization: 'Company B',
            url: '',
            position: 'Junior Developer',
            description: 'Second job',
            keyAchievements: [],
            startYear: '2018',
            endYear: '2020',
            technologies: [],
            showTechnologies: false,
          },
        ],
      }

      const result = convertResumeToMarkdown(dataWithMultipleJobs)

      expect(result).toContain('Company A')
      expect(result).toContain('Company B')
    })

    it('should handle multiple education entries', () => {
      const dataWithMultipleEdu: ResumeData = {
        ...mockResumeData,
        education: [
          {
            school: 'University A',
            url: '',
            studyType: "Bachelor's",
            area: 'CS',
            startYear: '2010',
            endYear: '2014',
          },
          {
            school: 'University B',
            url: '',
            studyType: "Master's",
            area: 'AI',
            startYear: '2014',
            endYear: '2016',
          },
        ],
      }

      const result = convertResumeToMarkdown(dataWithMultipleEdu)

      expect(result).toContain('University A')
      expect(result).toContain('University B')
    })

    it('should handle education with missing years', () => {
      const dataWithPartialEdu: ResumeData = {
        ...mockResumeData,
        education: [
          {
            school: 'Self Taught',
            url: '',
            studyType: 'Cert',
            area: 'Web Development',
            startYear: '',
            endYear: '',
          },
        ],
      }

      const result = convertResumeToMarkdown(dataWithPartialEdu)

      expect(result).toContain('### Cert in Web Development')
      expect(result).toContain('[Self Taught](#)')
      // Check that the header index and following line are correct
      const lines = result.split('\n')
      const headerIndex = lines.findIndex((l) => l.includes('### Cert in Web Development'))
      expect(lines[headerIndex + 1]).not.toContain(' - ')
      expect(lines[headerIndex + 1]).toContain('[Self Taught](#)')
    })

    it('should handle multiple projects', () => {
      const dataWithMultipleProjects: ResumeData = {
        ...mockResumeData,
        projects: [
          {
            name: 'Project A',
            link: '',
            description: 'First project',
            keyAchievements: [],
            startYear: '2020',
            endYear: 'Present',
          },
          {
            name: 'Project B',
            link: '',
            description: 'Second project',
            keyAchievements: [],
            startYear: '2019',
            endYear: '2020',
          },
        ],
      }

      const result = convertResumeToMarkdown(dataWithMultipleProjects)

      expect(result).toContain('Project A')
      expect(result).toContain('Project B')
    })

    it('should handle multiple certifications', () => {
      const dataWithMultipleCerts: ResumeData = {
        ...mockResumeData,
        certifications: [
          {
            name: 'Cert A',
            issuer: 'Issuer A',
            date: '2020',
            url: '',
          },
          {
            name: 'Cert B',
            issuer: 'Issuer B',
            date: '2021',
            url: '',
          },
        ],
      }

      const result = convertResumeToMarkdown(dataWithMultipleCerts)

      expect(result).toContain('Cert A')
      expect(result).toContain('Cert B')
    })

    it('should format social media without link', () => {
      const dataWithIncompleteSocial: ResumeData = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'LinkedIn', link: '' },
          { socialMedia: '', link: 'https://example.com' },
        ],
      }

      const result = convertResumeToMarkdown(dataWithIncompleteSocial)

      // Should not include incomplete social media entries
      expect(result).not.toContain('LinkedIn:')
      expect(result).not.toContain('https://example.com')
    })
  })
})
