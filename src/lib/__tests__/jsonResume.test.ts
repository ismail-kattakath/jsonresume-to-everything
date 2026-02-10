// @ts-nocheck
import { convertToJSONResume, convertFromJSONResume } from '@/lib/jsonResume'
import { validateJSONResume } from '@/lib/jsonResumeSchema'
import type { ResumeData } from '@/types'

describe('JSON Resume Conversion', () => {
  describe('convertToJSONResume', () => {
    const mockResumeData: ResumeData = {
      name: 'John Doe',
      position: 'Software Engineer',
      contactInformation: '+1 (555) 123-4567',
      email: 'john@example.com',
      address: '123 Main St, Toronto, ON M5H 2N2',
      profilePicture: 'https://example.com/photo.jpg',
      calendarLink: 'https://calendar.example.com',
      socialMedia: [
        { socialMedia: 'Website', link: 'example.com' },
        { socialMedia: 'Github', link: 'github.com/johndoe' },
        { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
      ],
      summary:
        'Experienced software engineer with a passion for building great products.',
      education: [
        {
          school: 'University of Toronto',
          url: 'utoronto.ca',
          studyType: "Bachelor's Degree",
          area: 'Computer Science',
          startYear: '2015-09-01',
          endYear: '2019-06-01',
        },
      ],
      workExperience: [
        {
          organization: 'Tech Corp',
          url: 'techcorp.com',
          position: 'Senior Developer',
          description: 'Led development of key features',
          keyAchievements: [
            { text: 'Increased performance by 50%' },
            { text: 'Reduced bugs by 30%' },
          ],
          startYear: '2020-01-01',
          endYear: 'Present',
          technologies: ['React', 'Node.js', 'TypeScript'],
        },
      ],
      skills: [
        {
          title: 'Programming Languages',
          skills: [
            { text: 'JavaScript', highlight: true },
            { text: 'Python', highlight: false },
          ],
        },
      ],
      languages: ['English', 'French'],
      certifications: [
        {
          name: 'AWS Certified',
          date: '2022',
          issuer: 'Amazon',
          url: 'aws.com',
        },
      ],
    }

    it('should convert resume data to JSON Resume format', () => {
      const result = convertToJSONResume(mockResumeData) as any

      expect(result).toHaveProperty('$schema')
      expect(result).toHaveProperty('basics')
      expect(result).toHaveProperty('work')
      expect(result).toHaveProperty('education')
      expect(result).toHaveProperty('skills')
      expect(result).toHaveProperty('languages')
    })

    it('should produce valid JSON Resume schema output', () => {
      const result = convertToJSONResume(mockResumeData) as any
      const validation = validateJSONResume(result)

      if (!validation.valid) {
        console.error(
          'Validation errors:',
          JSON.stringify(validation.errors, null, 2)
        )
      }
      expect(validation.valid).toBe(true)
    })

    it('should correctly map basics fields', () => {
      const result = convertToJSONResume(mockResumeData) as any

      expect(result.basics.name).toBe('John Doe')
      expect(result.basics.label).toBe('Software Engineer')
      expect(result.basics.email).toBe('john@example.com')
      expect(result.basics.phone).toBe('+1 (555) 123-4567')
      expect(result.basics.image).toBe('https://example.com/photo.jpg')
      expect(result.basics.summary).toBe(
        'Experienced software engineer with a passion for building great products.'
      )
    })

    it('should parse location from address', () => {
      const result = convertToJSONResume(mockResumeData) as any

      expect(result.basics.location.address).toBe('123 Main St')
      expect(result.basics.location.city).toBe('Toronto')
      expect(result.basics.location.region).toBe('ON')
      expect(result.basics.location.postalCode).toBe('M5H 2N2')
      expect(result.basics.location.countryCode).toBe('CA')
    })

    it('should convert social media profiles correctly', () => {
      const result = convertToJSONResume(mockResumeData) as any

      const githubProfile = result.basics.profiles.find(
        (p: any) => p.network === 'Github'
      )
      expect(githubProfile?.username).toBe('johndoe')
      expect(githubProfile?.url).toBe('https://github.com/johndoe')

      const linkedInProfile = result.basics.profiles.find(
        (p: any) => p.network === 'LinkedIn'
      )
      expect(linkedInProfile?.username).toBe('johndoe')
      expect(linkedInProfile?.url).toBe('https://linkedin.com/in/johndoe')
    })

    it('should convert work experience with all fields', () => {
      const result = convertToJSONResume(mockResumeData) as any

      expect(result.work).toHaveLength(1)
      expect(result.work[0].name).toBe('Tech Corp')
      expect(result.work[0].position).toBe('Senior Developer')
      expect(result.work[0].url).toBe('https://techcorp.com')
      expect(result.work[0].startDate).toBe('2020-01-01')
      expect(result.work[0].endDate).toBe('')
      expect(result.work[0].summary).toBe('Led development of key features')
      expect(result.work[0].highlights).toContain(
        'Increased performance by 50%'
      )
      expect(result.work[0].highlights).toContain('Reduced bugs by 30%')
      expect(result.work[0].keywords).toEqual([
        'React',
        'Node.js',
        'TypeScript',
      ])
    })

    it('should convert education with correct fields', () => {
      const result = convertToJSONResume(mockResumeData) as any

      expect(result.education).toHaveLength(1)
      expect(result.education[0].institution).toBe('University of Toronto')
      expect(result.education[0].url).toBe('https://utoronto.ca')
      expect(result.education[0].area).toBe('Computer Science')
      expect(result.education[0].studyType).toBe("Bachelor's Degree")
      expect(result.education[0].startDate).toBe('2015-09-01')
      expect(result.education[0].endDate).toBe('2019-06-01')
    })

    it('should convert skills to JSON Resume format', () => {
      const result = convertToJSONResume(mockResumeData) as any

      expect(result.skills).toHaveLength(1)
      expect(result.skills[0].name).toBe('Programming Languages')
      expect(result.skills[0].keywords).toContain('JavaScript')
      expect(result.skills[0].keywords).toContain('Python')
    })

    it('should convert languages', () => {
      const result = convertToJSONResume(mockResumeData) as any

      expect(result.languages).toHaveLength(2)
      expect(result.languages[0].language).toBe('English')
      expect(result.languages[0].fluency).toBe('Native speaker')
      expect(result.languages[1].language).toBe('French')
    })

    it('should handle URLs without http protocol', () => {
      const result = convertToJSONResume(mockResumeData) as any

      // Website is now kept in profiles array, not in basics.url
      expect(result.basics.url).toBeUndefined()
      const websiteProfile = result.basics.profiles.find(
        (p: any) => p.network === 'Website'
      )
      expect(websiteProfile?.url).toBe('https://example.com')
      expect(result.work[0].url).toBe('https://techcorp.com')
      expect(result.education[0].url).toBe('https://utoronto.ca')
    })

    it('should handle empty URL fields', () => {
      const dataWithEmptyUrls: any = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'Github', link: '' },
          { socialMedia: 'LinkedIn', link: '' },
        ],
        workExperience: [
          {
            ...(mockResumeData as any).workExperience[0],
            url: '',
          } as any,
        ],
        education: [
          {
            ...(mockResumeData as any).education[0],
            url: '',
          } as any,
        ],
      }

      const result = convertToJSONResume(dataWithEmptyUrls as any) as any

      const githubProfile = result.basics.profiles.find(
        (p: any) => p.network === 'Github'
      )
      // Empty URLs remain empty (improved behavior with urlHelpers)
      expect(githubProfile?.url).toBe('')

      // Empty URLs are undefined when falsy
      expect(result.work[0].url).toBeUndefined()
      expect(result.education[0].url).toBeUndefined()
    })

    it('should handle location with only street address', () => {
      const dataWithOnlyStreet = {
        ...mockResumeData,
        address: 'Only Street Address',
      }

      const result = convertToJSONResume(dataWithOnlyStreet as any) as any

      // When parsing fails, empty strings are used
      expect(result.basics.location.address).toBe('Only Street Address')
    })

    it('should handle empty work experience array', () => {
      const dataWithNoWork = {
        ...mockResumeData,
        workExperience: [],
      }

      const result = convertToJSONResume(dataWithNoWork as any) as any

      expect(result.work).toEqual([])
    })

    it('should handle empty education array', () => {
      const dataWithNoEducation = {
        ...mockResumeData,
        education: [],
      }

      const result = convertToJSONResume(dataWithNoEducation as any) as any

      expect(result.education).toEqual([])
    })

    it('should handle empty skills array', () => {
      const dataWithNoSkills = {
        ...mockResumeData,
        skills: [],
      }

      const result = convertToJSONResume(dataWithNoSkills as any) as any

      expect(result.skills).toEqual([])
    })

    it('should handle empty languages array', () => {
      const dataWithNoLanguages = {
        ...mockResumeData,
        languages: [],
      }

      const result = convertToJSONResume(dataWithNoLanguages as any) as any

      expect(result.languages).toEqual([])
    })

    it('should handle empty certifications array', () => {
      const dataWithNoCerts = {
        ...mockResumeData,
        certifications: [],
      }

      const result = convertToJSONResume(dataWithNoCerts as any) as any

      expect(result.certificates).toEqual([])
    })

    it('should handle work experience with empty keyAchievements', () => {
      const dataWithNoAchievements = {
        ...mockResumeData,
        workExperience: [
          {
            ...(mockResumeData as any).workExperience[0],
            keyAchievements: [],
          },
        ],
      }

      const result = convertToJSONResume(dataWithNoAchievements as any) as any

      expect(result.work[0].highlights).toEqual([])
    })

    it('should handle work experience with single line keyAchievement', () => {
      const dataWithSingleAchievement = {
        ...mockResumeData,
        workExperience: [
          {
            ...(mockResumeData as any).workExperience[0],
            keyAchievements: [{ text: 'Single achievement' }],
          },
        ],
      }

      const result = convertToJSONResume(
        dataWithSingleAchievement as any
      ) as any

      expect(result.work[0].highlights).toEqual(['Single achievement'])
    })

    it('should handle certifications with empty URLs', () => {
      const dataWithCertNoUrl = {
        ...mockResumeData,
        certifications: [
          {
            name: 'Test Cert',
            date: '2023',
            issuer: 'Test Issuer',
            url: '',
          },
        ],
      }

      const result = convertToJSONResume(dataWithCertNoUrl as any) as any

      // URL field is not added when empty
      expect(result.certificates[0].url).toBeUndefined()
    })

    it('should handle missing profile picture', () => {
      const dataWithNoPicture = {
        ...mockResumeData,
        profilePicture: '',
      }

      const result = convertToJSONResume(dataWithNoPicture as any) as any

      expect(result.basics.image).toBe('')
    })

    it('should handle missing calendar link', () => {
      const dataWithNoCalendar = {
        ...mockResumeData,
        calendarLink: '',
      }

      const result = convertToJSONResume(dataWithNoCalendar as any) as any

      // Calendar link is not in JSON Resume standard, so no assertion needed
      expect(result).toBeDefined()
    })

    it('should handle projects with URLs', () => {
      const mockData: any = {
        ...mockResumeData,
        projects: [
          {
            name: 'Open Source Project',
            link: 'github.com/project',
            description: 'A great project',
            keyAchievements: [{ text: 'Achievement 1' }],
            startYear: '2020-01',
            endYear: '2021-12',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.projects).toHaveLength(1)
      expect(result.projects[0].url).toBe('https://github.com/project')
      expect(result.projects[0].name).toBe('Open Source Project')
    })

    it('should handle projects without URLs', () => {
      const mockData: any = {
        ...mockResumeData,
        projects: [
          {
            name: 'Internal Project',
            link: '',
            description: 'Internal project',
            keyAchievements: [],
            startYear: '2020-01',
            endYear: '2021-12',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.projects).toHaveLength(1)
      expect(result.projects[0].url).toBeUndefined()
    })

    // Branch Coverage Tests
    it('should extract GitHub username from profile link', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/johndoe' }],
      }

      const result = convertToJSONResume(mockData) as any
      const githubProfile = result.basics.profiles.find(
        (p: any) => p.network === 'Github'
      )
      expect(githubProfile?.username).toBe('johndoe')
    })

    it('should extract LinkedIn username from profile link', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      const linkedinProfile = result.basics.profiles.find(
        (p: any) => p.network === 'LinkedIn'
      )
      expect(linkedinProfile?.username).toBe('johndoe')
    })

    it('should handle non-GitHub/LinkedIn social media with empty username', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [{ socialMedia: 'Twitter', link: 'twitter.com/johndoe' }],
      }

      const result = convertToJSONResume(mockData) as any
      const twitterProfile = result.basics.profiles.find(
        (p: any) => p.network === 'Twitter'
      )
      expect(twitterProfile?.username).toBe('')
    })

    it('should handle work experience with Present end date', () => {
      const mockData: any = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Current Company',
            url: 'current.com',
            position: 'Developer',
            description: 'Current role',
            keyAchievements: [],
            startYear: '2023-01',
            endYear: 'Present',
            technologies: ['React'],
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.work[0].endDate).toBe('')
    })

    it('should handle work experience without technologies array', () => {
      const mockData: any = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Company',
            url: 'company.com',
            position: 'Developer',
            description: 'Role',
            keyAchievements: [],
            startYear: '2020-01',
            endYear: '2021-12',
            technologies: undefined as any,
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.work[0].keywords).toEqual([])
    })

    it('should handle address without postal code pattern', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, Ontario',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.postalCode).toBe('')
      expect(result.basics.location.city).toBe('Toronto')
    })

    it('should handle address without region pattern', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, M5H 2N2',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.region).toBe('ON')
    })

    it('should handle missing certifications array', () => {
      const mockData: any = {
        ...mockResumeData,
        certifications: undefined as any,
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.certificates).toEqual([])
    })

    it('should handle certificate with empty URL', () => {
      const mockData: any = {
        ...mockResumeData,
        certifications: [
          { name: 'Cert', date: '2023', issuer: 'Issuer', url: '   ' },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.certificates[0].url).toBeUndefined()
    })

    it('should handle missing projects array', () => {
      const mockData: any = {
        ...mockResumeData,
        projects: undefined as any,
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.projects).toEqual([])
    })

    it('should handle work with normal end date', () => {
      const mockData: any = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Company',
            url: 'company.com',
            position: 'Developer',
            description: 'Role',
            keyAchievements: [],
            startYear: '2020-01',
            endYear: '2021-12',
            technologies: ['React'],
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.work[0].endDate).toBe('2021-12')
    })

    it('should handle address with all parts present', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '456 Elm St, Vancouver, BC V6B 1A1',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.address).toBe('456 Elm St')
      expect(result.basics.location.city).toBe('Vancouver')
      expect(result.basics.location.region).toBe('BC')
      expect(result.basics.location.postalCode).toBe('V6B 1A1')
    })

    it('should handle certificate with valid URL', () => {
      const mockData: any = {
        ...mockResumeData,
        certifications: [
          {
            name: 'AWS Certified',
            date: '2023',
            issuer: 'Amazon',
            url: 'aws.amazon.com/cert',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.certificates[0].url).toBe('https://aws.amazon.com/cert')
    })

    it('should handle empty address parts with defaults', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.address).toBe('')
      expect(result.basics.location.city).toBe('')
      expect(result.basics.location.region).toBe('ON')
      expect(result.basics.location.postalCode).toBe('')
    })

    it('should handle education with both studyType and area', () => {
      const mockData: any = {
        ...mockResumeData,
        education: [
          {
            school: 'MIT',
            url: 'mit.edu',
            studyType: "Master's Degree",
            area: 'Computer Science',
            startYear: '2020',
            endYear: '2022',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.education[0].studyType).toBe("Master's Degree")
      expect(result.education[0].area).toBe('Computer Science')
    })

    it('should use default resumeData when customData is undefined', () => {
      const result = convertToJSONResume() as any
      expect(result).toBeDefined()
      expect(result.basics).toBeDefined()
    })

    it('should handle profile without network name', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [{ socialMedia: '', link: 'example.com' }],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.profiles[0].network).toBe('')
      expect(result.basics.profiles[0].username).toBe('')
    })

    it('should handle projects array with multiple items', () => {
      const mockData: any = {
        ...mockResumeData,
        projects: [
          {
            name: 'Project 1',
            link: 'github.com/p1',
            description: 'Desc 1',
            keyAchievements: [{ text: 'Achievement 1' }],
            startYear: '2020',
            endYear: '2021',
          },
          {
            name: 'Project 2',
            link: '',
            description: 'Desc 2',
            keyAchievements: [],
            startYear: '2021',
            endYear: '2022',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.projects).toHaveLength(2)
      expect(result.projects[0].url).toBe('https://github.com/p1')
      expect(result.projects[1].url).toBeUndefined()
    })

    it('should handle work experience with all fields populated', () => {
      const mockData: any = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Tech Corp',
            url: 'techcorp.com',
            position: 'Senior Engineer',
            description: 'Led team',
            keyAchievements: [
              { text: 'Built platform' },
              { text: 'Improved performance' },
            ],
            startYear: '2020-01',
            endYear: '2023-12',
            technologies: ['React', 'Node.js', 'TypeScript'],
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.work[0].url).toBe('https://techcorp.com')
      expect(result.work[0].keywords).toHaveLength(3)
      expect(result.work[0].highlights).toHaveLength(2)
    })

    it('should handle address with only city and province', () => {
      const mockData: any = {
        ...mockResumeData,
        address: ', Toronto, ON',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.address).toBe('')
      expect(result.basics.location.city).toBe('Toronto')
      expect(result.basics.location.region).toBe('ON')
    })

    it('should handle multiple social media with different username extraction logic', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/user123' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/user456' },
          { socialMedia: 'Website', link: 'example.com' },
          { socialMedia: 'Twitter', link: 'twitter.com/handle' },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      const github = result.basics.profiles.find(
        (p: any) => p.network === 'Github'
      )
      const linkedin = result.basics.profiles.find(
        (p: any) => p.network === 'LinkedIn'
      )
      const website = result.basics.profiles.find(
        (p: any) => p.network === 'Website'
      )
      const twitter = result.basics.profiles.find(
        (p: any) => p.network === 'Twitter'
      )

      expect(github?.username).toBe('user123')
      expect(linkedin?.username).toBe('user456')
      expect(website?.username).toBe('')
      expect(twitter?.username).toBe('')
    })

    it('should handle education with URL present', () => {
      const mockData: any = {
        ...mockResumeData,
        education: [
          {
            school: 'Stanford',
            url: 'stanford.edu',
            studyType: 'PhD',
            area: 'AI',
            startYear: '2018',
            endYear: '2023',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.education[0].url).toBe('https://stanford.edu')
    })

    it('should handle work with URL present', () => {
      const mockData: any = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Google',
            url: 'google.com',
            position: 'Engineer',
            description: 'Work',
            keyAchievements: [],
            startYear: '2020',
            endYear: '2023',
            technologies: [],
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.work[0].url).toBe('https://google.com')
    })

    it('should handle address with postal code but no region in third part', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, M5H2N2',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.postalCode).toBe('M5H2N2')
      expect(result.basics.location.region).toBe('ON')
    })

    it('should handle address with region but no postal code in third part', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, ON Canada',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.region).toBe('ON')
      expect(result.basics.location.postalCode).toBe('')
    })

    it('should handle address with neither postal code nor region', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, Canada',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.region).toBe('ON')
      expect(result.basics.location.postalCode).toBe('')
    })

    it('should handle LinkedIn profile with complex path', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/john-doe-123' },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      const linkedin = result.basics.profiles.find(
        (p: any) => p.network === 'LinkedIn'
      )
      expect(linkedin?.username).toBe('john-doe-123')
    })

    it('should handle GitHub profile with complex path', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/user-name_123' },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      const github = result.basics.profiles.find(
        (p: any) => p.network === 'Github'
      )
      expect(github?.username).toBe('user-name_123')
    })

    it('should handle empty profile picture', () => {
      const mockData: any = {
        ...mockResumeData,
        profilePicture: '',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.image).toBe('')
    })

    it('should handle profile picture with value', () => {
      const mockData: any = {
        ...mockResumeData,
        profilePicture: 'https://example.com/photo.jpg',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.image).toBe('https://example.com/photo.jpg')
    })

    it('should handle certifications with non-empty URL', () => {
      const mockData: any = {
        ...mockResumeData,
        certifications: [
          {
            name: 'Cert',
            date: '2023',
            issuer: 'Issuer',
            url: 'example.com/cert',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.certificates[0].url).toBe('https://example.com/cert')
    })

    it('should handle work with technologies array with multiple items', () => {
      const mockData: any = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Company',
            url: 'company.com',
            position: 'Developer',
            description: 'Role',
            keyAchievements: [],
            startYear: '2020-01',
            endYear: '2021-12',
            technologies: ['React', 'Node', 'TypeScript', 'GraphQL'],
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.work[0].keywords).toHaveLength(4)
    })

    it('should handle non-Github and non-LinkedIn social media profiles', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'Twitter', link: 'twitter.com/johndoe' },
          { socialMedia: 'Facebook', link: 'facebook.com/johndoe' },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      // Non-Github/LinkedIn profiles should have empty username
      const twitterProfile = result.basics.profiles.find(
        (p: any) => p.network === 'Twitter'
      )
      expect(twitterProfile?.username).toBe('')
      const facebookProfile = result.basics.profiles.find(
        (p: any) => p.network === 'Facebook'
      )
      expect(facebookProfile?.username).toBe('')
    })

    it('should handle address without region pattern', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, 123456',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.region).toBe('ON') // Falls back to 'ON'
      expect(result.basics.location.postalCode).toBe('')
    })

    it('should handle address with short third part', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, X',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.region).toBe('ON')
      expect(result.basics.location.postalCode).toBe('')
    })

    it('should handle work experience with non-Present end date', () => {
      const mockData: any = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Past Company',
            url: 'pastcompany.com',
            position: 'Developer',
            description: 'Worked here',
            keyAchievements: [],
            startYear: '2018',
            endYear: '2020',
            technologies: [],
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.work[0].endDate).toBe('2020')
    })

    it('should handle certificates with empty URL', () => {
      const mockData: any = {
        ...mockResumeData,
        certifications: [
          {
            name: 'Cert',
            date: '2023',
            issuer: 'Issuer',
            url: '',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.certificates[0]).not.toHaveProperty('url')
    })

    it('should handle certificates with whitespace-only URL', () => {
      const mockData: any = {
        ...mockResumeData,
        certifications: [
          {
            name: 'Cert',
            date: '2023',
            issuer: 'Issuer',
            url: '   ',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.certificates[0]).not.toHaveProperty('url')
    })

    it('should handle projects with empty link', () => {
      const mockData: any = {
        ...mockResumeData,
        projects: [
          {
            name: 'Project',
            link: '',
            description: 'Desc',
            keyAchievements: [],
            startYear: '2020',
            endYear: '2021',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.projects[0].url).toBeUndefined()
    })

    it('should handle work experience with empty url', () => {
      const mockData: any = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Company',
            url: '',
            position: 'Developer',
            description: 'Work',
            keyAchievements: [],
            startYear: '2020',
            endYear: 'Present',
            technologies: [],
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.work[0].url).toBeUndefined()
    })

    it('should handle education with empty url', () => {
      const mockData: any = {
        ...mockResumeData,
        education: [
          {
            school: 'School',
            url: '',
            studyType: 'Degree',
            area: 'Field',
            startYear: '2015',
            endYear: '2019',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.education[0].url).toBeUndefined()
    })

    it('should handle address with only two parts', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.address).toBe('123 Main St')
      expect(result.basics.location.city).toBe('Toronto')
      expect(result.basics.location.region).toBe('ON') // Falls back to default
      expect(result.basics.location.postalCode).toBe('')
    })

    it('should handle address with valid Canadian postal code', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, ON M5H2N2',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.postalCode).toBe('M5H2N2')
    })

    it('should handle GitHub social media link without domain prefix', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/username' }],
      }

      const result = convertToJSONResume(mockData) as any
      const githubProfile = result.basics.profiles.find(
        (p: any) => p.network === 'Github'
      )
      expect(githubProfile?.username).toBe('username')
    })

    it('should handle LinkedIn social media link without domain prefix', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/username' },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      const linkedinProfile = result.basics.profiles.find(
        (p: any) => p.network === 'LinkedIn'
      )
      expect(linkedinProfile?.username).toBe('username')
    })

    it('should handle certificates with valid URL containing protocol', () => {
      const mockData: any = {
        ...mockResumeData,
        certifications: [
          {
            name: 'Certification',
            date: '2023',
            issuer: 'Provider',
            url: 'https://example.com/cert',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.certificates[0].url).toBe('https://example.com/cert')
    })

    it('should handle projects with valid link', () => {
      const mockData: any = {
        ...mockResumeData,
        projects: [
          {
            name: 'My Project',
            link: 'github.com/user/project',
            description: 'A project',
            keyAchievements: [{ text: 'Achievement 1' }],
            startYear: '2020',
            endYear: '2022',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.projects[0].url).toBe('https://github.com/user/project')
    })

    it('should handle GitHub link without github.com prefix', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [{ socialMedia: 'Github', link: 'johndoe' }],
      }

      const result = convertToJSONResume(mockData) as any
      const githubProfile = result.basics.profiles.find(
        (p: any) => p.network === 'Github'
      )
      // If link doesn't contain 'github.com/', replace won't do anything
      expect(githubProfile?.username).toBe('johndoe')
    })

    it('should handle LinkedIn link without linkedin.com/in prefix', () => {
      const mockData: any = {
        ...mockResumeData,
        socialMedia: [{ socialMedia: 'LinkedIn', link: 'janedoe' }],
      }

      const result = convertToJSONResume(mockData) as any
      const linkedinProfile = result.basics.profiles.find(
        (p: any) => p.network === 'LinkedIn'
      )
      // If link doesn't contain 'linkedin.com/in/', replace won't do anything
      expect(linkedinProfile?.username).toBe('janedoe')
    })

    it('should handle work experience with undefined url field', () => {
      const mockData: any = {
        ...mockResumeData,
        workExperience: [
          {
            organization: 'Company',
            url: undefined as any,
            position: 'Dev',
            description: 'Work',
            keyAchievements: [],
            startYear: '2020',
            endYear: '2021',
            technologies: [],
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.work[0].url).toBeUndefined()
    })

    it('should handle education with undefined url field', () => {
      const mockData: any = {
        ...mockResumeData,
        education: [
          {
            school: 'School',
            url: undefined as any,
            studyType: 'Degree',
            area: 'Field',
            startYear: '2015',
            endYear: '2019',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.education[0].url).toBeUndefined()
    })

    it('should handle projects with undefined link field', () => {
      const mockData: any = {
        ...mockResumeData,
        projects: [
          {
            name: 'Project',
            link: undefined as any,
            description: 'Desc',
            keyAchievements: [],
            startYear: '2020',
            endYear: '2021',
          },
        ],
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.projects[0].url).toBeUndefined()
    })

    it('should handle address with region code but no postal code', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, ON',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.region).toBe('ON')
      expect(result.basics.location.postalCode).toBe('')
    })

    it('should handle address with only postal code in third part', () => {
      const mockData: any = {
        ...mockResumeData,
        address: '123 Main St, Toronto, M5H 2N2',
      }

      const result = convertToJSONResume(mockData) as any
      expect(result.basics.location.postalCode).toBe('M5H 2N2')
      expect(result.basics.location.region).toBe('ON') // Falls back to default
    })
  })

  describe('convertFromJSONResume', () => {
    const mockJSONResume = {
      $schema:
        'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
      basics: {
        name: 'Jane Smith',
        label: 'Product Manager',
        email: 'jane@example.com',
        phone: '+1 (555) 987-6543',
        url: 'https://janesmith.com',
        summary: 'Product manager with 5 years of experience.',
        location: {
          address: '456 Oak Ave',
          city: 'Vancouver',
          region: 'BC',
          postalCode: 'V6B 1A1',
          countryCode: 'CA',
        },
        profiles: [
          {
            network: 'Github',
            username: 'janesmith',
            url: 'https://github.com/janesmith',
          },
          {
            network: 'LinkedIn',
            username: 'janesmith',
            url: 'https://linkedin.com/in/janesmith',
          },
        ],
        image: 'https://example.com/jane.jpg',
      },
      work: [
        {
          name: 'Product Inc',
          position: 'Product Manager',
          url: 'https://productinc.com',
          startDate: '2019-01-01',
          endDate: '2024-01-01',
          summary: 'Managed product development',
          highlights: ['Launched 3 major features', 'Grew user base by 200%'],
          keywords: ['Product Strategy', 'Agile', 'User Research'],
        },
      ],
      education: [
        {
          institution: 'University of British Columbia',
          url: 'https://ubc.ca',
          area: 'Business Administration',
          studyType: 'MBA',
          startDate: '2015-09-01',
          endDate: '2017-06-01',
        },
      ],
      skills: [
        {
          name: 'Product Management',
          level: 'Expert',
          keywords: ['Roadmapping', 'User Stories', 'Analytics'],
        },
      ],
      languages: [
        {
          language: 'English',
          fluency: 'Native',
        },
        {
          language: 'Spanish',
          fluency: 'Professional',
        },
      ],
      certificates: [
        {
          name: 'Certified Scrum Product Owner',
          date: '2021',
          issuer: 'Scrum Alliance',
          url: 'https://scrumalliance.org',
        },
      ],
      volunteer: [],
      awards: [],
      publications: [],
      interests: [],
      references: [],
      projects: [],
    }

    it('should convert JSON Resume to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume) as any

      expect(result).not.toBeNull()
      expect(result.name).toBe('Jane Smith')
      expect(result.position).toBe('Product Manager')
      expect(result.email).toBe('jane@example.com')
      expect(result.contactInformation).toBe('+1 (555) 987-6543')
      expect(result.summary).toBe('Product manager with 5 years of experience.')
      expect(result.profilePicture).toBe('https://example.com/jane.jpg')
    })

    it('should reconstruct address from location fields', () => {
      const result = convertFromJSONResume(mockJSONResume) as any

      expect(result.address).toBe('456 Oak Ave, Vancouver, BC V6B 1A1')
    })

    it('should convert profiles to social media format', () => {
      const result = convertFromJSONResume(mockJSONResume) as any

      expect(result.socialMedia).toHaveLength(3) // Website + 2 profiles

      const website = result.socialMedia.find(
        (s: any) => s.socialMedia === 'Website'
      )
      expect(website?.link).toBe('janesmith.com')

      const github = result.socialMedia.find(
        (s: any) => s.socialMedia === 'Github'
      )
      expect(github?.link).toBe('github.com/janesmith')

      const linkedin = result.socialMedia.find(
        (s: any) => s.socialMedia === 'LinkedIn'
      )
      expect(linkedin?.link).toBe('linkedin.com/in/janesmith')
    })

    it('should convert work experience to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume) as any

      expect(result.workExperience).toHaveLength(1)
      expect(result.workExperience[0].organization).toBe('Product Inc')
      expect(result.workExperience[0].position).toBe('Product Manager')
      expect(result.workExperience[0].url).toBe('productinc.com')
      expect(result.workExperience[0].description).toBe(
        'Managed product development'
      )
      expect(result.workExperience[0].keyAchievements).toEqual([
        { text: 'Launched 3 major features' },
        { text: 'Grew user base by 200%' },
      ])
      expect(result.workExperience[0].startYear).toBe('2019-01-01')
      expect(result.workExperience[0].endYear).toBe('2024-01-01')
      expect(result.workExperience[0].technologies).toEqual([
        'Product Strategy',
        'Agile',
        'User Research',
      ])
    })

    it('should convert education to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume) as any

      expect(result.education).toHaveLength(1)
      expect(result.education[0].school).toBe('University of British Columbia')
      expect(result.education[0].url).toBe('ubc.ca')
      expect(result.education[0].studyType).toBe('MBA')
      expect(result.education[0].area).toBe('Business Administration')
      expect(result.education[0].startYear).toBe('2015-09-01')
      expect(result.education[0].endYear).toBe('2017-06-01')
    })

    it('should convert skills to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume) as any

      expect(result.skills).toHaveLength(1)
      expect(result.skills[0].title).toBe('Product Management')
      expect(result.skills[0].skills).toHaveLength(3)
      expect(result.skills[0].skills[0].text).toBe('Roadmapping')
    })

    it('should convert languages to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume) as any

      expect(result.languages).toHaveLength(2)
      expect(result.languages).toContain('English')
      expect(result.languages).toContain('Spanish')
    })

    it('should convert certifications to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume) as any

      expect(result.certifications).toHaveLength(1)
      expect(result.certifications[0].name).toBe(
        'Certified Scrum Product Owner'
      )
      expect(result.certifications[0].date).toBe('2021')
      expect(result.certifications[0].issuer).toBe('Scrum Alliance')
      expect(result.certifications[0].url).toBe('https://scrumalliance.org')
    })

    it('should handle missing optional fields gracefully', () => {
      const minimalJSONResume = {
        basics: {
          name: 'Test User',
        },
      }

      const result = convertFromJSONResume(minimalJSONResume) as any

      expect(result).not.toBeNull()
      expect(result.name).toBe('Test User')
      expect(result.position).toBe('')
      expect(result.email).toBe('')
      expect(result.socialMedia).toEqual([])
      expect(result.workExperience).toEqual([])
      expect(result.education).toEqual([])
      expect(result.skills).toHaveLength(1)
      expect(result.skills[0].skills).toEqual([])
    })

    it('should strip http/https from URLs in social media', () => {
      const result = convertFromJSONResume(mockJSONResume) as any

      result.socialMedia.forEach((social: any) => {
        expect(social.link).not.toMatch(/^https?:\/\//)
      })
    })

    it('should return null for invalid JSON Resume', () => {
      const invalidJSONResume = {
        basics: 'not an object', // Invalid structure
      }

      const result = convertFromJSONResume(invalidJSONResume as any) as any

      expect(result).toBeNull()
    })

    it('should handle JSON Resume with empty profiles array', () => {
      const resumeWithNoProfiles: any = {
        ...mockJSONResume,
        basics: {
          ...mockJSONResume.basics,
          profiles: [],
        },
      }
      // Remove url to avoid validation error
      delete resumeWithNoProfiles.basics.url

      const result = convertFromJSONResume(resumeWithNoProfiles) as any

      expect(result).not.toBeNull()
      expect(result.socialMedia).toEqual([])
    })

    it('should handle JSON Resume with missing location fields', () => {
      const resumeWithPartialLocation = {
        ...mockJSONResume,
        basics: {
          ...mockJSONResume.basics,
          location: {
            address: '123 Street',
          },
        },
      }

      const result = convertFromJSONResume(resumeWithPartialLocation) as any

      expect(result.address).toBe('123 Street')
    })

    it('should handle JSON Resume with empty work array', () => {
      const resumeWithNoWork = {
        ...mockJSONResume,
        work: [],
      }

      const result = convertFromJSONResume(resumeWithNoWork) as any

      expect(result.workExperience).toEqual([])
    })

    it('should handle JSON Resume with empty education array', () => {
      const resumeWithNoEducation = {
        ...mockJSONResume,
        education: [],
      }

      const result = convertFromJSONResume(resumeWithNoEducation) as any

      expect(result.education).toEqual([])
    })

    it('should handle JSON Resume with empty skills array', () => {
      const resumeWithNoSkills = {
        ...mockJSONResume,
        skills: [],
      }

      const result = convertFromJSONResume(resumeWithNoSkills) as any

      expect(result.skills).toHaveLength(1)
      expect(result.skills[0].skills).toEqual([])
    })

    it('should handle JSON Resume with empty languages array', () => {
      const resumeWithNoLanguages = {
        ...mockJSONResume,
        languages: [],
      }

      const result = convertFromJSONResume(resumeWithNoLanguages) as any

      expect(result.languages).toEqual([])
    })

    it('should handle JSON Resume with empty certificates array', () => {
      const resumeWithNoCerts = {
        ...mockJSONResume,
        certificates: [],
      }

      const result = convertFromJSONResume(resumeWithNoCerts) as any

      expect(result.certifications).toEqual([])
    })

    it('should handle work with empty highlights array', () => {
      const resumeWithNoHighlights = {
        ...mockJSONResume,
        work: [
          {
            ...(mockJSONResume as any).work[0],
            highlights: [],
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithNoHighlights) as any

      expect(result.workExperience[0].keyAchievements).toEqual([])
    })

    it('should handle work with single highlight', () => {
      const resumeWithSingleHighlight = {
        ...mockJSONResume,
        work: [
          {
            ...(mockJSONResume as any).work[0],
            highlights: ['Single highlight'],
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithSingleHighlight) as any

      expect(result.workExperience[0].keyAchievements).toEqual([
        { text: 'Single highlight' },
      ])
    })

    it('should handle work with empty keywords array', () => {
      const resumeWithNoKeywords = {
        ...mockJSONResume,
        work: [
          {
            ...(mockJSONResume as any).work[0],
            keywords: [],
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithNoKeywords) as any

      expect(result.workExperience[0].technologies).toEqual([])
    })

    it('should handle skills with empty keywords array', () => {
      const resumeWithNoSkillKeywords = {
        ...mockJSONResume,
        skills: [
          {
            name: 'Test Skill',
            keywords: [],
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithNoSkillKeywords) as any

      expect(result.skills[0].skills).toEqual([])
    })

    it('should handle certificates without URL field', () => {
      const resumeWithCertNoUrl = {
        ...mockJSONResume,
        certificates: [
          {
            name: (mockJSONResume as any).certificates[0].name,
            date: (mockJSONResume as any).certificates[0].date,
            issuer: (mockJSONResume as any).certificates[0].issuer,
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithCertNoUrl) as any

      expect(result).not.toBeNull()
      // Missing URL field results in undefined, which becomes empty string
      expect(result.certifications[0].url).toBe('')
    })

    it('should handle work with missing URL field', () => {
      const resumeWithNoWorkUrl = {
        ...mockJSONResume,
        work: [
          {
            name: (mockJSONResume as any).work[0].name,
            position: (mockJSONResume as any).work[0].position,
            startYear: (mockJSONResume as any).work[0].startDate,
            endYear: (mockJSONResume as any).work[0].endDate,
            summary: (mockJSONResume as any).work[0].summary,
            highlights: (mockJSONResume as any).work[0].highlights,
            keywords: (mockJSONResume as any).work[0].keywords,
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithNoWorkUrl) as any

      expect(result).not.toBeNull()
      expect(result.workExperience[0].url).toBe('')
    })

    it('should handle education with missing URL field', () => {
      const resumeWithNoEduUrl = {
        ...mockJSONResume,
        education: [
          {
            institution: (mockJSONResume as any).education[0].institution,
            area: (mockJSONResume as any).education[0].area,
            studyType: (mockJSONResume as any).education[0].studyType,
            startYear: (mockJSONResume as any).education[0].startDate,
            endYear: (mockJSONResume as any).education[0].endDate,
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithNoEduUrl) as any

      expect(result).not.toBeNull()
      expect(result.education[0].url).toBe('')
    })

    it('should convert projects from JSON Resume with URLs', () => {
      const jsonResume = {
        ...mockJSONResume,
        projects: [
          {
            name: 'Sample Project',
            url: 'https://example.com/project',
            description: 'Description',
            highlights: ['Highlight 1'],
            startYear: '2020-01',
            endYear: '2021-12',
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.projects).toHaveLength(1)
      expect(result?.projects[0].link).toBe('example.com/project')
      expect(result?.projects[0].name).toBe('Sample Project')
    })

    it('should handle JSON Resume with website URL in basics', () => {
      const jsonResume = {
        ...mockJSONResume,
        basics: {
          ...mockJSONResume.basics,
          url: 'https://example.com',
          profiles: [],
        },
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.socialMedia[0].socialMedia).toBe('Website')
      expect(result?.socialMedia[0].link).toBe('example.com')
    })

    it('should handle work with Present end date (empty string)', () => {
      const jsonResume = {
        ...mockJSONResume,
        work: [
          {
            name: 'Company',
            position: 'Developer',
            startYear: '2020-01',
            endYear: '',
            summary: 'Description',
            highlights: [],
            keywords: [],
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.workExperience[0].endYear).toBe('Present')
    })

    it('should handle language objects with fluency', () => {
      const jsonResume = {
        ...mockJSONResume,
        languages: [
          { language: 'French', fluency: 'Professional' },
          { language: 'German', fluency: 'Conversational' },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.languages).toContain('French')
      expect(result?.languages).toContain('German')
    })

    it('should handle projects with URL stripping', () => {
      const jsonResume = {
        ...mockJSONResume,
        projects: [
          {
            name: 'Project',
            url: 'https://github.com/project',
            description: 'Desc',
            highlights: [],
            startYear: '2020',
            endYear: '2021',
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.projects[0].link).toBe('github.com/project')
    })

    it('should handle address with only street address', () => {
      const jsonResume = {
        ...mockJSONResume,
        basics: {
          ...mockJSONResume.basics,
          location: {
            address: '123 Main St',
          },
        },
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.address).toContain('123 Main St')
    })

    it('should handle JSON Resume without location object', () => {
      const jsonResume = {
        ...mockJSONResume,
        basics: {
          ...mockJSONResume.basics,
          location: undefined,
        },
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.address).toBe('')
    })

    it('should handle work without keywords field', () => {
      const jsonResume = {
        ...mockJSONResume,
        work: [
          {
            name: 'Company',
            position: 'Developer',
            startYear: '2020',
            endYear: '2021',
            summary: 'Summary',
            highlights: [],
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.workExperience[0].technologies).toEqual([])
    })

    it('should handle skill group without keywords', () => {
      const jsonResume = {
        ...mockJSONResume,
        skills: [
          {
            name: 'Programming',
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.skills[0].skills).toEqual([])
    })

    it('should handle empty basics object', () => {
      const jsonResume = {
        ...mockJSONResume,
        basics: {},
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result).not.toBeNull()
      expect(result?.name).toBe('')
    })

    it('should handle profile without URL', () => {
      const jsonResume = {
        ...mockJSONResume,
        basics: {
          ...mockJSONResume.basics,
          profiles: [
            {
              network: 'Twitter',
              username: 'user',
              url: undefined,
            },
          ],
        },
      }

      const result = convertFromJSONResume(jsonResume) as any
      const twitterProfile = result?.socialMedia.find(
        (s: any) => s.socialMedia === 'Twitter'
      )
      expect(twitterProfile?.link).toBe('')
    })

    it('should handle project without link', () => {
      const jsonResume = {
        ...mockJSONResume,
        projects: [
          {
            name: 'Internal Project',
            description: 'Desc',
            highlights: [],
            startYear: '2020',
            endYear: '2021',
            url: undefined,
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.projects[0].link).toBe('')
    })

    it('should handle education without URL', () => {
      const jsonResume = {
        ...mockJSONResume,
        education: [
          {
            institution: 'University',
            area: 'Computer Science',
            studyType: "Bachelor's",
            startYear: '2015',
            endYear: '2019',
            url: undefined,
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.education[0].url).toBe('')
    })

    it('should handle work without URL', () => {
      const jsonResume = {
        ...mockJSONResume,
        work: [
          {
            name: 'Company',
            position: 'Developer',
            startYear: '2020',
            endYear: '2021',
            summary: 'Work',
            highlights: [],
            keywords: [],
            url: undefined,
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.workExperience[0].url).toBe('')
    })

    it('should handle work with empty endDate falling back to Present', () => {
      const jsonResume = {
        ...mockJSONResume,
        work: [
          {
            name: 'Company',
            position: 'Developer',
            startYear: '2020',
            endYear: '',
            summary: 'Work',
            highlights: [],
            keywords: [],
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.workExperience[0].endYear).toBe('Present')
    })

    it('should handle work with undefined endDate falling back to Present', () => {
      const jsonResume = {
        ...mockJSONResume,
        work: [
          {
            name: 'Company',
            position: 'Developer',
            startYear: '2020',
            summary: 'Work',
            highlights: [],
            keywords: [],
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.workExperience[0].endYear).toBe('Present')
    })

    it('should handle certificate with URL', () => {
      const jsonResume = {
        ...mockJSONResume,
        certificates: [
          {
            name: 'Cert',
            date: '2023',
            issuer: 'Issuer',
            url: 'https://example.com/cert',
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      // Certificates are copied directly without transformation
      expect(result?.certifications[0].url).toBe('https://example.com/cert')
    })

    it('should handle profile with network and url', () => {
      const jsonResume = {
        ...mockJSONResume,
        basics: {
          ...mockJSONResume.basics,
          profiles: [
            {
              network: 'Twitter',
              username: 'handle',
              url: 'https://twitter.com/handle',
            },
          ],
        },
      }

      const result = convertFromJSONResume(jsonResume) as any
      // Find Twitter profile (Website profile from basics.url is added first)
      const twitterProfile = result?.socialMedia.find(
        (s: any) => s.socialMedia === 'Twitter'
      )
      expect(twitterProfile?.link).toBe('twitter.com/handle')
    })

    it('should handle location with all fields present', () => {
      const jsonResume = {
        ...mockJSONResume,
        basics: {
          ...mockJSONResume.basics,
          location: {
            address: '456 Oak St',
            city: 'Seattle',
            region: 'WA',
            postalCode: '98101',
            countryCode: 'US',
          },
        },
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.address).toContain('456 Oak St')
      expect(result?.address).toContain('Seattle')
    })

    it('should handle education with all fields', () => {
      const jsonResume = {
        ...mockJSONResume,
        education: [
          {
            institution: 'MIT',
            url: 'https://mit.edu',
            area: 'CS',
            studyType: 'PhD',
            startYear: '2018',
            endYear: '2023',
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.education[0].school).toBe('MIT')
      expect(result?.education[0].url).toBe('mit.edu')
    })

    it('should handle skills with keywords array', () => {
      const jsonResume = {
        ...mockJSONResume,
        skills: [
          {
            name: 'Languages',
            keywords: ['JavaScript', 'TypeScript', 'Python'],
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.skills[0].skills).toHaveLength(3)
    })

    it('should handle project with all fields', () => {
      const jsonResume = {
        ...mockJSONResume,
        projects: [
          {
            name: 'Project',
            url: 'https://github.com/proj',
            description: 'Desc',
            highlights: ['Feat 1', 'Feat 2'],
            startYear: '2020',
            endYear: '2021',
          },
        ],
      }

      const result = convertFromJSONResume(jsonResume) as any
      expect(result?.projects[0].keyAchievements).toHaveLength(2)
    })

    it('should return null when validation fails', () => {
      const invalidJSONResume = {
        $schema:
          'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
        basics: {
          // Invalid basics: name is required but type should be string, not number
          name: 12345 as any,
        },
      }

      const result = convertFromJSONResume(invalidJSONResume as any) as any
      expect(result).toBeNull()
    })

    it('should handle error in conversion gracefully', () => {
      // Pass invalid data that will cause an error
      const result = convertFromJSONResume(null as any) as any
      expect(result).toBeNull()
    })
  })
})
