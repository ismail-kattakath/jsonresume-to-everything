import { validateJSONResume } from '@/lib/jsonResumeSchema'

describe('JSON Resume Schema Validation', () => {
  const validJSONResume = {
    $schema:
      'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: 'John Doe',
      position: 'Software Engineer',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      url: 'https://example.com',
      summary: 'Experienced developer',
      location: {
        address: '123 Main St',
        city: 'Toronto',
        region: 'ON',
        postalCode: 'M5H 2N2',
        countryCode: 'CA',
      },
      profiles: [
        {
          network: 'Github',
          username: 'johndoe',
          url: 'https://github.com/johndoe',
        },
      ],
    },
    work: [],
    volunteer: [],
    education: [],
    awards: [],
    certificates: [],
    publications: [],
    skills: [],
    languages: [],
    interests: [],
    references: [],
    projects: [],
  }

  describe('validateJSONResume', () => {
    it('should validate a correct JSON Resume', () => {
      const result = validateJSONResume(validJSONResume)

      expect(result.valid).toBe(true)
      if (!result.valid) {
        expect(result.errors).toBeDefined()
      }
    })

    it('should accept minimal valid JSON Resume', () => {
      const minimalResume = {
        basics: {
          name: 'Jane Doe',
        },
      }

      const result = validateJSONResume(minimalResume)

      expect(result.valid).toBe(true)
    })

    it('should validate work experience fields', () => {
      const resumeWithWork = {
        ...validJSONResume,
        work: [
          {
            name: 'Tech Corp',
            position: 'Developer',
            startDate: '2020-01-01',
            endDate: '2023-01-01',
            summary: 'Developed software',
            highlights: ['Built features', 'Fixed bugs'],
            url: 'https://techcorp.com',
          },
        ],
      }

      const result = validateJSONResume(resumeWithWork)

      expect(result.valid).toBe(true)
    })

    it('should validate education fields', () => {
      const resumeWithEducation = {
        ...validJSONResume,
        education: [
          {
            institution: 'University of Toronto',
            area: 'Computer Science',
            degree: "Bachelor's Degree",
            startDate: '2015-09-01',
            endDate: '2019-06-01',
            score: '3.8',
            courses: ['Algorithms', 'Data Structures'],
          },
        ],
      }

      const result = validateJSONResume(resumeWithEducation)

      expect(result.valid).toBe(true)
    })

    it('should validate skills array', () => {
      const resumeWithSkills = {
        ...validJSONResume,
        skills: [
          {
            name: 'Web Development',
            level: 'Expert',
            keywords: ['JavaScript', 'React', 'Node.js'],
          },
        ],
      }

      const result = validateJSONResume(resumeWithSkills)

      expect(result.valid).toBe(true)
    })

    it('should validate languages array', () => {
      const resumeWithLanguages = {
        ...validJSONResume,
        languages: [
          {
            language: 'English',
            fluency: 'Native',
          },
          {
            language: 'French',
            fluency: 'Professional',
          },
        ],
      }

      const result = validateJSONResume(resumeWithLanguages)

      expect(result.valid).toBe(true)
    })

    it('should validate certificates array', () => {
      const resumeWithCerts = {
        ...validJSONResume,
        certificates: [
          {
            name: 'AWS Certified',
            date: '2022',
            issuer: 'Amazon',
            url: 'https://aws.com/cert',
          },
        ],
      }

      const result = validateJSONResume(resumeWithCerts)

      expect(result.valid).toBe(true)
    })

    it('should return false for completely invalid data', () => {
      const invalid = 'not an object'

      const result = validateJSONResume(invalid)

      expect(result.valid).toBe(false)
      expect(result.errors).not.toBeNull()
    })

    it('should handle empty object', () => {
      const result = validateJSONResume({})

      // JSON Resume schema allows empty objects (all fields are optional)
      expect(result.valid).toBe(true)
    })

    it('should validate optional fields when present', () => {
      const resumeWithOptionals = {
        ...validJSONResume,
        basics: {
          ...validJSONResume.basics,
          image: 'https://example.com/photo.jpg',
        },
      }

      const result = validateJSONResume(resumeWithOptionals)

      expect(result.valid).toBe(true)
    })

    it('should validate date formats', () => {
      const resumeWithDates = {
        ...validJSONResume,
        work: [
          {
            name: 'Company',
            position: 'Role',
            startDate: '2020-01-01',
            endDate: '2023-12-31',
          },
        ],
      }

      const result = validateJSONResume(resumeWithDates)

      expect(result.valid).toBe(true)
    })

    it('should validate URL formats when provided', () => {
      const resumeWithUrls = {
        ...validJSONResume,
        basics: {
          ...validJSONResume.basics,
          url: 'https://example.com',
          profiles: [
            {
              network: 'Twitter',
              url: 'https://twitter.com/johndoe',
            },
          ],
        },
      }

      const result = validateJSONResume(resumeWithUrls)

      expect(result.valid).toBe(true)
    })

    it('should validate email format in basics', () => {
      const resumeWithEmail = {
        ...validJSONResume,
        basics: {
          ...validJSONResume.basics,
          email: 'valid.email@example.com',
        },
      }

      const result = validateJSONResume(resumeWithEmail)

      expect(result.valid).toBe(true)
    })

    it('should handle volunteer work validation', () => {
      const resumeWithVolunteer = {
        ...validJSONResume,
        volunteer: [
          {
            company: 'Non-Profit Org',
            position: 'Volunteer',
            startDate: '2021-01-01',
            endDate: '2022-01-01',
            summary: 'Helped with community programs',
            highlights: ['Organized events', 'Raised funds'],
          },
        ],
      }

      const result = validateJSONResume(resumeWithVolunteer)

      expect(result.valid).toBe(true)
    })

    it('should handle projects validation', () => {
      const resumeWithProjects = {
        ...validJSONResume,
        projects: [
          {
            name: 'Open Source Project',
            description: 'A useful tool',
            highlights: ['Feature A', 'Feature B'],
            keywords: ['JavaScript', 'Open Source'],
            startDate: '2022-01-01',
            endDate: '2023-01-01',
            url: 'https://github.com/project',
            roles: ['Maintainer'],
            entity: 'GitHub',
            type: 'application',
          },
        ],
      }

      const result = validateJSONResume(resumeWithProjects)

      expect(result.valid).toBe(true)
    })
  })
})
