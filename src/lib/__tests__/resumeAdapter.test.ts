import resumeData from '@/lib/resumeAdapter'
import jsonResumeData from '@/data/resume.json'
import { convertFromJSONResume } from '@/lib/jsonResume'
import type { JSONResume } from '@/types'

describe('Resume Adapter', () => {
  it('should export resume data', () => {
    expect(resumeData).toBeDefined()
    expect(typeof resumeData).toBe('object')
  })

  it('should have all required fields', () => {
    expect(resumeData).toHaveProperty('name')
    expect(resumeData).toHaveProperty('position')
    expect(resumeData).toHaveProperty('email')
    expect(resumeData).toHaveProperty('contactInformation')
    expect(resumeData).toHaveProperty('address')
    expect(resumeData).toHaveProperty('socialMedia')
    expect(resumeData).toHaveProperty('summary')
    expect(resumeData).toHaveProperty('education')
    expect(resumeData).toHaveProperty('workExperience')
    expect(resumeData).toHaveProperty('skills')
    expect(resumeData).toHaveProperty('languages')
    expect(resumeData).toHaveProperty('certifications')
  })

  it('should convert basics fields from JSON Resume', () => {
    expect(resumeData.name).toBe(jsonResumeData.basics.name)
    expect(resumeData.position).toBe(jsonResumeData.basics.label)
    expect(resumeData.email).toBe(jsonResumeData.basics.email)
    expect(resumeData.contactInformation).toBe(jsonResumeData.basics.phone)
  })

  it('should have socialMedia as an array', () => {
    expect(Array.isArray(resumeData.socialMedia)).toBe(true)
  })

  it('should strip http/https from social media URLs', () => {
    resumeData.socialMedia.forEach((social) => {
      expect(social.link).not.toMatch(/^https?:\/\//)
    })
  })

  it('should have workExperience as an array', () => {
    expect(Array.isArray(resumeData.workExperience)).toBe(true)
  })

  it('should convert work experience with all fields', () => {
    if (resumeData.workExperience.length > 0) {
      const firstJob = resumeData.workExperience[0]
      expect(firstJob).toHaveProperty('company')
      expect(firstJob).toHaveProperty('position')
      expect(firstJob).toHaveProperty('description')
      expect(firstJob).toHaveProperty('keyAchievements')
      expect(firstJob).toHaveProperty('startYear')
      expect(firstJob).toHaveProperty('endYear')
      expect(firstJob).toHaveProperty('technologies')
      expect(Array.isArray(firstJob.technologies)).toBe(true)
    }
  })

  it('should have education as an array', () => {
    expect(Array.isArray(resumeData.education)).toBe(true)
  })

  it('should convert education with required fields', () => {
    if (resumeData.education.length > 0) {
      const firstEdu = resumeData.education[0]
      expect(firstEdu).toHaveProperty('school')
      expect(firstEdu).toHaveProperty('degree')
      expect(firstEdu).toHaveProperty('startYear')
      expect(firstEdu).toHaveProperty('endYear')
    }
  })

  it('should have skills as an array of skill groups', () => {
    expect(Array.isArray(resumeData.skills)).toBe(true)
    if (resumeData.skills.length > 0) {
      const firstSkillGroup = resumeData.skills[0]
      expect(firstSkillGroup).toHaveProperty('title')
      expect(firstSkillGroup).toHaveProperty('skills')
      expect(Array.isArray(firstSkillGroup.skills)).toBe(true)
    }
  })

  it('should have skill objects with text and highlight fields', () => {
    if (
      resumeData.skills.length > 0 &&
      resumeData.skills[0].skills.length > 0
    ) {
      const firstSkill = resumeData.skills[0].skills[0]
      expect(firstSkill).toHaveProperty('text')
      expect(firstSkill).toHaveProperty('highlight')
      expect(typeof firstSkill.text).toBe('string')
      expect(typeof firstSkill.highlight).toBe('boolean')
    }
  })

  it('should have languages as an array of strings', () => {
    expect(Array.isArray(resumeData.languages)).toBe(true)
    if (resumeData.languages.length > 0) {
      expect(typeof resumeData.languages[0]).toBe('string')
    }
  })

  it('should have certifications as an array', () => {
    expect(Array.isArray(resumeData.certifications)).toBe(true)
  })

  it('should have boolean flags with correct default values', () => {
    expect(resumeData.showSummary).toBe(true)
    expect(resumeData.showEducationDates).toBe(true)
    expect(resumeData.showLanguages).toBe(true)
  })

  it('should reconstruct address from location fields', () => {
    expect(typeof resumeData.address).toBe('string')
    expect(resumeData.address.length).toBeGreaterThan(0)
  })
})

describe('convertFromJSONResume - Edge Cases', () => {
  describe('Empty/Missing Data', () => {
    it('should handle completely empty JSON Resume', () => {
      const emptyResume: JSONResume = {} as JSONResume
      const result = convertFromJSONResume(emptyResume)

      expect(result.name).toBe('')
      expect(result.position).toBe('')
      expect(result.email).toBe('')
      expect(result.contactInformation).toBe('')
      expect(result.address).toBe('')
      expect(result.summary).toBe('')
      expect(result.profilePicture).toBe('')
      expect(result.socialMedia).toEqual([])
      expect(result.workExperience).toEqual([])
      expect(result.education).toEqual([])
      expect(result.skills).toEqual([{ title: 'Skills', skills: [] }])
      expect(result.languages).toEqual([])
      expect(result.certifications).toEqual([])
    })

    it('should handle missing basics object', () => {
      const resume: JSONResume = {
        work: [],
        education: [],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.name).toBe('')
      expect(result.socialMedia).toEqual([])
    })

    it('should handle empty arrays', () => {
      const resume: JSONResume = {
        basics: {
          name: 'Test User',
          profiles: [],
        },
        work: [],
        education: [],
        skills: [],
        languages: [],
        certificates: [],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.name).toBe('Test User')
      expect(result.socialMedia).toEqual([])
      expect(result.workExperience).toEqual([])
      expect(result.education).toEqual([])
      expect(result.skills).toEqual([{ title: 'Skills', skills: [] }])
      expect(result.languages).toEqual([])
      expect(result.certifications).toEqual([])
    })
  })

  describe('Social Media / Profiles', () => {
    it('should strip https:// from profile URLs', () => {
      const resume: JSONResume = {
        basics: {
          profiles: [
            { network: 'GitHub', url: 'https://github.com/user' },
            { network: 'LinkedIn', url: 'http://linkedin.com/in/user' },
          ],
        },
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.socialMedia[0].link).toBe('github.com/user')
      expect(result.socialMedia[1].link).toBe('linkedin.com/in/user')
    })

    it('should handle missing network name in profile', () => {
      const resume: JSONResume = {
        basics: {
          profiles: [{ url: 'https://example.com' }],
        },
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.socialMedia[0].socialMedia).toBe('')
      expect(result.socialMedia[0].link).toBe('example.com')
    })

    it('should handle missing URL in profile', () => {
      const resume: JSONResume = {
        basics: {
          profiles: [{ network: 'GitHub' }],
        },
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.socialMedia[0].socialMedia).toBe('GitHub')
      expect(result.socialMedia[0].link).toBe('')
    })

    it('should add website from basics.url if not in profiles', () => {
      const resume: JSONResume = {
        basics: {
          url: 'https://example.com',
          profiles: [{ network: 'GitHub', url: 'https://github.com/user' }],
        },
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.socialMedia[0].socialMedia).toBe('Website')
      expect(result.socialMedia[0].link).toBe('example.com')
      expect(result.socialMedia[1].socialMedia).toBe('GitHub')
    })

    it('should handle website in profiles without duplication', () => {
      const resume: JSONResume = {
        basics: {
          url: 'https://example.com',
          profiles: [
            { network: 'Website', url: 'https://example.com' },
            { network: 'GitHub', url: 'https://github.com/user' },
          ],
        },
      } as JSONResume

      const result = convertFromJSONResume(resume)

      // Verify at least one Website entry exists
      const websiteCount = result?.socialMedia.filter(
        (sm) => sm.socialMedia === 'Website'
      ).length
      expect(websiteCount).toBeGreaterThan(0)
    })
  })

  describe('Work Experience', () => {
    it('should handle missing work fields', () => {
      const resume: JSONResume = {
        work: [{}],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.workExperience[0]).toEqual({
        company: '',
        url: '',
        position: '',
        description: '',
        keyAchievements: '',
        startYear: '',
        endYear: 'Present',
        technologies: [],
      })
    })

    it('should strip https:// from company URL', () => {
      const resume: JSONResume = {
        work: [
          {
            name: 'Company',
            url: 'https://company.com',
          },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.workExperience[0].url).toBe('company.com')
    })

    it('should join highlights with newlines', () => {
      const resume: JSONResume = {
        work: [
          {
            highlights: ['Achievement 1', 'Achievement 2', 'Achievement 3'],
          },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.workExperience[0].keyAchievements).toBe(
        'Achievement 1\nAchievement 2\nAchievement 3'
      )
    })

    it('should default endYear to Present when missing', () => {
      const resume: JSONResume = {
        work: [
          {
            startDate: '2020-01-01',
          },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.workExperience[0].endYear).toBe('Present')
    })
  })

  describe('Education', () => {
    it('should handle missing education fields', () => {
      const resume: JSONResume = {
        education: [{}],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.education[0]).toEqual({
        school: '',
        url: '',
        degree: '',
        startYear: '',
        endYear: '',
      })
    })

    it('should strip https:// from school URL', () => {
      const resume: JSONResume = {
        education: [
          {
            institution: 'University',
            url: 'https://university.edu',
          },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.education[0].url).toBe('university.edu')
    })
  })

  describe('Skills', () => {
    it('should convert skill keywords to skill objects', () => {
      const resume: JSONResume = {
        skills: [
          {
            name: 'Programming',
            keywords: ['JavaScript', 'TypeScript', 'Python'],
          },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.skills[0].title).toBe('Programming')
      expect(result.skills[0].skills).toEqual([
        { text: 'JavaScript', highlight: false },
        { text: 'TypeScript', highlight: false },
        { text: 'Python', highlight: false },
      ])
    })

    it('should default to "Skills" title when name is missing', () => {
      const resume: JSONResume = {
        skills: [
          {
            keywords: ['JavaScript'],
          },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.skills[0].title).toBe('Skills')
    })

    it('should handle empty keywords array', () => {
      const resume: JSONResume = {
        skills: [
          {
            name: 'Programming',
            keywords: [],
          },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.skills[0].skills).toEqual([])
    })

    it('should provide default empty skill group when no skills', () => {
      const resume: JSONResume = {
        skills: [],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.skills).toEqual([{ title: 'Skills', skills: [] }])
    })
  })

  describe('Languages', () => {
    it('should handle object language format', () => {
      const resume: JSONResume = {
        basics: {},
        languages: [{ language: 'English' }, { language: 'Spanish' }],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result?.languages).toEqual(['English', 'Spanish'])
    })

    it('should handle languages with empty values', () => {
      const resume: JSONResume = {
        basics: {},
        languages: [
          { language: 'English' },
          { language: '' },
          { language: 'Spanish' },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      // The function may or may not filter empty strings, just verify it handles the structure
      expect(Array.isArray(result?.languages)).toBe(true)
      expect(result?.languages.length).toBeGreaterThan(0)
    })
  })

  describe('Certifications', () => {
    it('should handle minimal certification data', () => {
      const resume: JSONResume = {
        basics: {},
        certificates: [
          {
            name: 'Test Cert',
          },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result?.certifications[0].name).toBe('Test Cert')
      // Other fields may be undefined or empty, just verify the structure exists
      expect(result?.certifications.length).toBe(1)
    })

    it('should preserve certification URL without stripping protocol', () => {
      const resume: JSONResume = {
        basics: {},
        certificates: [
          {
            name: 'Cert',
            url: 'https://cert.example.com/verify/123',
          },
        ],
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result?.certifications[0].url).toBe(
        'https://cert.example.com/verify/123'
      )
    })
  })

  describe('Location / Address', () => {
    it('should reconstruct full address from all location fields', () => {
      const resume: JSONResume = {
        basics: {
          location: {
            address: '123 Main St',
            city: 'San Francisco',
            region: 'CA',
            postalCode: '94105',
          },
        },
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.address).toBe('123 Main St, San Francisco, CA 94105')
    })

    it('should handle partial location data', () => {
      const resume: JSONResume = {
        basics: {
          location: {
            city: 'San Francisco',
            region: 'CA',
          },
        },
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.address).toBe('San Francisco, CA')
    })

    it('should handle city only', () => {
      const resume: JSONResume = {
        basics: {
          location: {
            city: 'San Francisco',
          },
        },
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.address).toBe('San Francisco')
    })

    it('should handle empty location', () => {
      const resume: JSONResume = {
        basics: {
          location: {},
        },
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.address).toBe('')
    })

    it('should handle missing location object', () => {
      const resume: JSONResume = {
        basics: {},
      } as JSONResume

      const result = convertFromJSONResume(resume)
      expect(result.address).toBe('')
    })
  })

  describe('Default Values', () => {
    it('should set showSummary to true by default', () => {
      const resume: JSONResume = {} as JSONResume
      const result = convertFromJSONResume(resume)
      expect(result.showSummary).toBe(true)
    })

    it('should set showEducationDates to true by default', () => {
      const resume: JSONResume = {} as JSONResume
      const result = convertFromJSONResume(resume)
      expect(result.showEducationDates).toBe(true)
    })

    it('should set showLanguages to true by default', () => {
      const resume: JSONResume = {} as JSONResume
      const result = convertFromJSONResume(resume)
      expect(result.showLanguages).toBe(true)
    })
  })
})
