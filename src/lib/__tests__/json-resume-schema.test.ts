import { validateJSONResume } from '@/lib/json-resume-schema'

describe('jsonResumeSchema', () => {
  it('validates a correct resume', () => {
    const validResume = {
      basics: {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.com',
        location: {
          city: 'San Francisco',
        },
      },
      work: [
        {
          name: 'Company',
          position: 'Developer',
          startDate: '2020-01-01',
        },
      ],
    }

    const result = validateJSONResume(validResume)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('identifies invalid email format', () => {
    const invalidResume = {
      basics: {
        name: 'John Doe',
        email: 'not-an-email',
      },
    }

    const result = validateJSONResume(invalidResume)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('/basics/email: must match format "email"')
  })

  it('identifies invalid URL format', () => {
    const invalidResume = {
      basics: {
        url: 'not-a-url',
      },
    }

    const result = validateJSONResume(invalidResume)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('/basics/url: must match format "uri"')
  })

  it('allows additional properties due to strict: false', () => {
    const resumeWithExtra = {
      basics: {
        name: 'John Doe',
        extraField: 'Some value',
      },
    }

    const result = validateJSONResume(resumeWithExtra)
    expect(result.valid).toBe(true)
  })

  it('validates education and skills arrays', () => {
    const resume = {
      education: [
        {
          institution: 'Uni',
          area: 'CS',
        },
      ],
      skills: [
        {
          name: 'Web Development',
          keywords: ['React', 'Node'],
        },
      ],
    }

    const result = validateJSONResume(resume)
    expect(result.valid).toBe(true)
  })

  it('handles empty object gracefully', () => {
    const result = validateJSONResume({})
    expect(result.valid).toBe(true)
  })

  it('handles root-level validation errors', () => {
    // Passing a non-object to trigger instancePath || 'root'
    const result = validateJSONResume(null)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/^root:/)
  })
})
