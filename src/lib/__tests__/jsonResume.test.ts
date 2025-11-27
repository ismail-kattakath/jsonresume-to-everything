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
          degree: "Bachelor's Degree in Computer Science",
          startYear: '2015-09-01',
          endYear: '2019-06-01',
        },
      ],
      workExperience: [
        {
          company: 'Tech Corp',
          url: 'techcorp.com',
          position: 'Senior Developer',
          description: 'Led development of key features',
          keyAchievements: 'Increased performance by 50%\nReduced bugs by 30%',
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
      const result = convertToJSONResume(mockResumeData)

      expect(result).toHaveProperty('$schema')
      expect(result).toHaveProperty('basics')
      expect(result).toHaveProperty('work')
      expect(result).toHaveProperty('education')
      expect(result).toHaveProperty('skills')
      expect(result).toHaveProperty('languages')
    })

    it('should produce valid JSON Resume schema output', () => {
      const result = convertToJSONResume(mockResumeData)
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
      const result = convertToJSONResume(mockResumeData)

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
      const result = convertToJSONResume(mockResumeData)

      expect(result.basics.location.address).toBe('123 Main St')
      expect(result.basics.location.city).toBe('Toronto')
      expect(result.basics.location.region).toBe('ON')
      expect(result.basics.location.postalCode).toBe('M5H 2N2')
      expect(result.basics.location.countryCode).toBe('CA')
    })

    it('should convert social media profiles correctly', () => {
      const result = convertToJSONResume(mockResumeData)

      const githubProfile = result.basics.profiles.find(
        (p) => p.network === 'Github'
      )
      expect(githubProfile?.username).toBe('johndoe')
      expect(githubProfile?.url).toBe('https://github.com/johndoe')

      const linkedInProfile = result.basics.profiles.find(
        (p) => p.network === 'LinkedIn'
      )
      expect(linkedInProfile?.username).toBe('johndoe')
      expect(linkedInProfile?.url).toBe('https://linkedin.com/in/johndoe')
    })

    it('should convert work experience with all fields', () => {
      const result = convertToJSONResume(mockResumeData)

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
      const result = convertToJSONResume(mockResumeData)

      expect(result.education).toHaveLength(1)
      expect(result.education[0].institution).toBe('University of Toronto')
      expect(result.education[0].url).toBe('https://utoronto.ca')
      expect(result.education[0].area).toBe('Computer Science and Engineering')
      expect(result.education[0].studyType).toBe("Bachelor's Degree")
      expect(result.education[0].startDate).toBe('2015-09-01')
      expect(result.education[0].endDate).toBe('2019-06-01')
    })

    it('should convert skills to JSON Resume format', () => {
      const result = convertToJSONResume(mockResumeData)

      expect(result.skills).toHaveLength(1)
      expect(result.skills[0].name).toBe('Programming Languages')
      expect(result.skills[0].keywords).toContain('JavaScript')
      expect(result.skills[0].keywords).toContain('Python')
    })

    it('should convert languages', () => {
      const result = convertToJSONResume(mockResumeData)

      expect(result.languages).toHaveLength(2)
      expect(result.languages[0].language).toBe('English')
      expect(result.languages[0].fluency).toBe('Native speaker')
      expect(result.languages[1].language).toBe('French')
    })

    it('should handle URLs without http protocol', () => {
      const result = convertToJSONResume(mockResumeData)

      // Website is now kept in profiles array, not in basics.url
      expect(result.basics.url).toBeUndefined()
      const websiteProfile = result.basics.profiles.find(
        (p) => p.network === 'Website'
      )
      expect(websiteProfile?.url).toBe('https://example.com')
      expect(result.work[0].url).toBe('https://techcorp.com')
      expect(result.education[0].url).toBe('https://utoronto.ca')
    })

    it('should handle empty URL fields', () => {
      const dataWithEmptyUrls = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'Github', link: '' },
          { socialMedia: 'LinkedIn', link: '' },
        ],
        workExperience: [
          {
            ...mockResumeData.workExperience[0],
            url: '',
          },
        ],
        education: [
          {
            ...mockResumeData.education[0],
            url: '',
          },
        ],
      }

      const result = convertToJSONResume(dataWithEmptyUrls)

      const githubProfile = result.basics.profiles.find(
        (p) => p.network === 'Github'
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

      const result = convertToJSONResume(dataWithOnlyStreet)

      // When parsing fails, empty strings are used
      expect(result.basics.location.address).toBe('Only Street Address')
    })

    it('should handle empty work experience array', () => {
      const dataWithNoWork = {
        ...mockResumeData,
        workExperience: [],
      }

      const result = convertToJSONResume(dataWithNoWork)

      expect(result.work).toEqual([])
    })

    it('should handle empty education array', () => {
      const dataWithNoEducation = {
        ...mockResumeData,
        education: [],
      }

      const result = convertToJSONResume(dataWithNoEducation)

      expect(result.education).toEqual([])
    })

    it('should handle empty skills array', () => {
      const dataWithNoSkills = {
        ...mockResumeData,
        skills: [],
      }

      const result = convertToJSONResume(dataWithNoSkills)

      expect(result.skills).toEqual([])
    })

    it('should handle empty languages array', () => {
      const dataWithNoLanguages = {
        ...mockResumeData,
        languages: [],
      }

      const result = convertToJSONResume(dataWithNoLanguages)

      expect(result.languages).toEqual([])
    })

    it('should handle empty certifications array', () => {
      const dataWithNoCerts = {
        ...mockResumeData,
        certifications: [],
      }

      const result = convertToJSONResume(dataWithNoCerts)

      expect(result.certificates).toEqual([])
    })

    it('should handle work experience with empty keyAchievements', () => {
      const dataWithNoAchievements = {
        ...mockResumeData,
        workExperience: [
          {
            ...mockResumeData.workExperience[0],
            keyAchievements: '',
          },
        ],
      }

      const result = convertToJSONResume(dataWithNoAchievements)

      expect(result.work[0].highlights).toEqual([])
    })

    it('should handle work experience with single line keyAchievement', () => {
      const dataWithSingleAchievement = {
        ...mockResumeData,
        workExperience: [
          {
            ...mockResumeData.workExperience[0],
            keyAchievements: 'Single achievement',
          },
        ],
      }

      const result = convertToJSONResume(dataWithSingleAchievement)

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

      const result = convertToJSONResume(dataWithCertNoUrl)

      // URL field is not added when empty
      expect(result.certificates[0].url).toBeUndefined()
    })

    it('should handle missing profile picture', () => {
      const dataWithNoPicture = {
        ...mockResumeData,
        profilePicture: '',
      }

      const result = convertToJSONResume(dataWithNoPicture)

      expect(result.basics.image).toBe('')
    })

    it('should handle missing calendar link', () => {
      const dataWithNoCalendar = {
        ...mockResumeData,
        calendarLink: '',
      }

      const result = convertToJSONResume(dataWithNoCalendar)

      // Calendar link is not in JSON Resume standard, so no assertion needed
      expect(result).toBeDefined()
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
      const result = convertFromJSONResume(mockJSONResume)

      expect(result).not.toBeNull()
      expect(result.name).toBe('Jane Smith')
      expect(result.position).toBe('Product Manager')
      expect(result.email).toBe('jane@example.com')
      expect(result.contactInformation).toBe('+1 (555) 987-6543')
      expect(result.summary).toBe('Product manager with 5 years of experience.')
      expect(result.profilePicture).toBe('https://example.com/jane.jpg')
    })

    it('should reconstruct address from location fields', () => {
      const result = convertFromJSONResume(mockJSONResume)

      expect(result.address).toBe('456 Oak Ave, Vancouver, BC V6B 1A1')
    })

    it('should convert profiles to social media format', () => {
      const result = convertFromJSONResume(mockJSONResume)

      expect(result.socialMedia).toHaveLength(3) // Website + 2 profiles

      const website = result.socialMedia.find(
        (s) => s.socialMedia === 'Website'
      )
      expect(website?.link).toBe('janesmith.com')

      const github = result.socialMedia.find((s) => s.socialMedia === 'Github')
      expect(github?.link).toBe('github.com/janesmith')

      const linkedin = result.socialMedia.find(
        (s) => s.socialMedia === 'LinkedIn'
      )
      expect(linkedin?.link).toBe('linkedin.com/in/janesmith')
    })

    it('should convert work experience to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume)

      expect(result.workExperience).toHaveLength(1)
      expect(result.workExperience[0].company).toBe('Product Inc')
      expect(result.workExperience[0].position).toBe('Product Manager')
      expect(result.workExperience[0].url).toBe('productinc.com')
      expect(result.workExperience[0].description).toBe(
        'Managed product development'
      )
      expect(result.workExperience[0].keyAchievements).toBe(
        'Launched 3 major features\nGrew user base by 200%'
      )
      expect(result.workExperience[0].startYear).toBe('2019-01-01')
      expect(result.workExperience[0].endYear).toBe('2024-01-01')
      expect(result.workExperience[0].technologies).toEqual([
        'Product Strategy',
        'Agile',
        'User Research',
      ])
    })

    it('should convert education to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume)

      expect(result.education).toHaveLength(1)
      expect(result.education[0].school).toBe('University of British Columbia')
      expect(result.education[0].url).toBe('ubc.ca')
      expect(result.education[0].degree).toBe('MBA')
      expect(result.education[0].startYear).toBe('2015-09-01')
      expect(result.education[0].endYear).toBe('2017-06-01')
    })

    it('should convert skills to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume)

      expect(result.skills).toHaveLength(1)
      expect(result.skills[0].title).toBe('Product Management')
      expect(result.skills[0].skills).toHaveLength(3)
      expect(result.skills[0].skills[0].text).toBe('Roadmapping')
    })

    it('should convert languages to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume)

      expect(result.languages).toHaveLength(2)
      expect(result.languages).toContain('English')
      expect(result.languages).toContain('Spanish')
    })

    it('should convert certifications to internal format', () => {
      const result = convertFromJSONResume(mockJSONResume)

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

      const result = convertFromJSONResume(minimalJSONResume)

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
      const result = convertFromJSONResume(mockJSONResume)

      result.socialMedia.forEach((social) => {
        expect(social.link).not.toMatch(/^https?:\/\//)
      })
    })

    it('should return null for invalid JSON Resume', () => {
      const invalidJSONResume = {
        basics: 'not an object', // Invalid structure
      }

      const result = convertFromJSONResume(invalidJSONResume)

      expect(result).toBeNull()
    })

    it('should handle JSON Resume with empty profiles array', () => {
      const resumeWithNoProfiles = {
        ...mockJSONResume,
        basics: {
          ...mockJSONResume.basics,
          profiles: [],
        },
      }
      // Remove url to avoid validation error
      delete resumeWithNoProfiles.basics.url

      const result = convertFromJSONResume(resumeWithNoProfiles)

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

      const result = convertFromJSONResume(resumeWithPartialLocation)

      expect(result.address).toBe('123 Street')
    })

    it('should handle JSON Resume with empty work array', () => {
      const resumeWithNoWork = {
        ...mockJSONResume,
        work: [],
      }

      const result = convertFromJSONResume(resumeWithNoWork)

      expect(result.workExperience).toEqual([])
    })

    it('should handle JSON Resume with empty education array', () => {
      const resumeWithNoEducation = {
        ...mockJSONResume,
        education: [],
      }

      const result = convertFromJSONResume(resumeWithNoEducation)

      expect(result.education).toEqual([])
    })

    it('should handle JSON Resume with empty skills array', () => {
      const resumeWithNoSkills = {
        ...mockJSONResume,
        skills: [],
      }

      const result = convertFromJSONResume(resumeWithNoSkills)

      expect(result.skills).toHaveLength(1)
      expect(result.skills[0].skills).toEqual([])
    })

    it('should handle JSON Resume with empty languages array', () => {
      const resumeWithNoLanguages = {
        ...mockJSONResume,
        languages: [],
      }

      const result = convertFromJSONResume(resumeWithNoLanguages)

      expect(result.languages).toEqual([])
    })

    it('should handle JSON Resume with empty certificates array', () => {
      const resumeWithNoCerts = {
        ...mockJSONResume,
        certificates: [],
      }

      const result = convertFromJSONResume(resumeWithNoCerts)

      expect(result.certifications).toEqual([])
    })

    it('should handle work with empty highlights array', () => {
      const resumeWithNoHighlights = {
        ...mockJSONResume,
        work: [
          {
            ...mockJSONResume.work[0],
            highlights: [],
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithNoHighlights)

      expect(result.workExperience[0].keyAchievements).toBe('')
    })

    it('should handle work with single highlight', () => {
      const resumeWithSingleHighlight = {
        ...mockJSONResume,
        work: [
          {
            ...mockJSONResume.work[0],
            highlights: ['Single highlight'],
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithSingleHighlight)

      expect(result.workExperience[0].keyAchievements).toBe('Single highlight')
    })

    it('should handle work with empty keywords array', () => {
      const resumeWithNoKeywords = {
        ...mockJSONResume,
        work: [
          {
            ...mockJSONResume.work[0],
            keywords: [],
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithNoKeywords)

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

      const result = convertFromJSONResume(resumeWithNoSkillKeywords)

      expect(result.skills[0].skills).toEqual([])
    })

    it('should handle certificates without URL field', () => {
      const resumeWithCertNoUrl = {
        ...mockJSONResume,
        certificates: [
          {
            name: mockJSONResume.certificates[0].name,
            date: mockJSONResume.certificates[0].date,
            issuer: mockJSONResume.certificates[0].issuer,
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithCertNoUrl)

      expect(result).not.toBeNull()
      // Missing URL field results in undefined, which becomes empty string
      expect(result.certifications[0].url).toBeUndefined()
    })

    it('should handle work with missing URL field', () => {
      const resumeWithNoWorkUrl = {
        ...mockJSONResume,
        work: [
          {
            name: mockJSONResume.work[0].name,
            position: mockJSONResume.work[0].position,
            startDate: mockJSONResume.work[0].startDate,
            endDate: mockJSONResume.work[0].endDate,
            summary: mockJSONResume.work[0].summary,
            highlights: mockJSONResume.work[0].highlights,
            keywords: mockJSONResume.work[0].keywords,
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithNoWorkUrl)

      expect(result).not.toBeNull()
      expect(result.workExperience[0].url).toBe('')
    })

    it('should handle education with missing URL field', () => {
      const resumeWithNoEduUrl = {
        ...mockJSONResume,
        education: [
          {
            institution: mockJSONResume.education[0].institution,
            area: mockJSONResume.education[0].area,
            studyType: mockJSONResume.education[0].studyType,
            startDate: mockJSONResume.education[0].startDate,
            endDate: mockJSONResume.education[0].endDate,
          },
        ],
      }

      const result = convertFromJSONResume(resumeWithNoEduUrl)

      expect(result).not.toBeNull()
      expect(result.education[0].url).toBe('')
    })
  })
})
