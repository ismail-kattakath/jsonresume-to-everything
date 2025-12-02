import { convertResumeToText, downloadResumeAsText } from '../txtExporter'
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
  })

  describe('downloadResumeAsText', () => {
    beforeEach(() => {
      // Mock DOM methods
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
      global.URL.revokeObjectURL = jest.fn()
    })

    it('should trigger download with correct filename', () => {
      const clickSpy = jest.fn()
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue({
          click: clickSpy,
          href: '',
          download: '',
        } as unknown as HTMLAnchorElement)

      downloadResumeAsText(mockResumeData, 'John_Doe_Resume')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(clickSpy).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalled()

      createElementSpy.mockRestore()
    })

    it('should create blob with correct type', () => {
      const mockBlob = { size: 1000, type: 'text/plain;charset=utf-8' }
      const BlobConstructor = jest.fn(() => mockBlob)
      global.Blob = BlobConstructor as unknown as typeof Blob

      downloadResumeAsText(mockResumeData, 'Test_Resume')

      expect(BlobConstructor).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          type: 'text/plain;charset=utf-8',
        })
      )
    })
  })
})
