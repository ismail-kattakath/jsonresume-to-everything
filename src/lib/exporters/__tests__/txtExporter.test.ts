import { convertResumeToText } from '../txtExporter'
import { ResumeData } from '@/types/resume'

describe('txtExporter', () => {
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
    summary:
      'Experienced software engineer with expertise in full-stack development.',
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
        keyAchievements: [
          { text: 'Improved performance by 40%' },
          { text: 'Mentored 5 junior developers' },
        ],
        startYear: '2020',
        endYear: 'Present',
        technologies: ['React', 'Node.js', 'TypeScript'],
        showTechnologies: true,
      },
    ],
    skills: [
      {
        title: 'Programming Languages',
        skills: [
          { text: 'JavaScript' },
          { text: 'TypeScript' },
          { text: 'Python' },
        ],
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

  describe('convertResumeToText', () => {
    it('should convert resume data to plain text format', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('JOHN DOE')
      expect(result).toContain('Senior Software Engineer')
      expect(result).toContain('CONTACT INFORMATION')
      expect(result).toContain('john.doe@example.com')
      expect(result).toContain('+1 (555) 123-4567')
    })

    it('should include all major sections', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('PROFESSIONAL SUMMARY')
      expect(result).toContain('WORK EXPERIENCE')
      expect(result).toContain('EDUCATION')
      expect(result).toContain('SKILLS')
      expect(result).toContain('PROJECTS')
      expect(result).toContain('CERTIFICATIONS')
      expect(result).toContain('LANGUAGES')
    })

    it('should format work experience correctly', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('Senior Software Engineer at Tech Corp')
      expect(result).toContain('2020 - Present')
      expect(result).toContain('Led development of core platform features')
      expect(result).toContain('• Improved performance by 40%')
      expect(result).toContain('Technologies: React, Node.js, TypeScript')
    })

    it('should format education correctly', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('Bachelor of Science in Computer Science')
      expect(result).toContain('University of California')
      expect(result).toContain('2010 - 2014')
    })

    it('should include social media links', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('LinkedIn: https://linkedin.com/in/johndoe')
      expect(result).toContain('GitHub: https://github.com/johndoe')
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

      const result = convertResumeToText(minimalData)

      expect(result).toContain('JANE SMITH')
      expect(result).toContain('Developer')
      expect(result).not.toContain('PROFESSIONAL SUMMARY')
      expect(result).not.toContain('WORK EXPERIENCE')
    })

    it('should include contact information when provided', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('Email: john.doe@example.com')
      expect(result).toContain('Phone: +1 (555) 123-4567')
      expect(result).toContain('Address: 123 Main St, San Francisco, CA 94102')
    })

    it('should format work experience with description', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('Led development of core platform features')
    })

    it('should format work experience with URL', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('Website: https://techcorp.com')
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

      const result = convertResumeToText(dataWithHiddenTech)

      expect(result).not.toContain('Technologies:')
    })

    it('should format education with URL', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('Website: https://berkeley.edu')
    })

    it('should format projects with description', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('A popular open source library')
    })

    it('should format projects with link', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('Link: https://github.com/johndoe/project')
    })

    it('should format projects with key achievements', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain('1000+ stars on GitHub')
    })

    it('should format certifications with URL', () => {
      const result = convertResumeToText(mockResumeData)

      expect(result).toContain(
        'Verification: https://aws.amazon.com/certification'
      )
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

      const result = convertResumeToText(dataWithMultipleJobs)

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

      const result = convertResumeToText(dataWithMultipleEdu)

      expect(result).toContain('University A')
      expect(result).toContain('University B')
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

      const result = convertResumeToText(dataWithMultipleProjects)

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

      const result = convertResumeToText(dataWithMultipleCerts)

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

      const result = convertResumeToText(dataWithIncompleteSocial)

      // Should not include incomplete social media entries
      expect(result).not.toContain('LinkedIn:')
      expect(result).not.toContain('https://example.com')
    })
  })
})
