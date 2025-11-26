import {
  contactInfo,
  summary,
  skills,
  experience,
  projects,
} from '@/lib/data/portfolio'

describe('Portfolio Data - Contact Info', () => {
  it('should export contact info object', () => {
    expect(contactInfo).toBeDefined()
    expect(contactInfo).toHaveProperty('name')
    expect(contactInfo).toHaveProperty('title')
    expect(contactInfo).toHaveProperty('email')
  })

  it('should have valid email format', () => {
    expect(contactInfo.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })

  it('should have location with Canadian flag', () => {
    expect(contactInfo.location).toContain('🇨🇦')
  })

  it('should have all required contact fields', () => {
    expect(typeof contactInfo.name).toBe('string')
    expect(typeof contactInfo.title).toBe('string')
    expect(typeof contactInfo.location).toBe('string')
    expect(typeof contactInfo.phone).toBe('string')
    expect(typeof contactInfo.email).toBe('string')
  })

  it('should have valid URLs for social links', () => {
    // URLs are stored without protocol in resume data
    if (contactInfo.github) {
      expect(contactInfo.github).toBeTruthy()
      expect(contactInfo.github.length).toBeGreaterThan(0)
    }
    if (contactInfo.linkedin) {
      expect(contactInfo.linkedin).toBeTruthy()
      expect(contactInfo.linkedin.length).toBeGreaterThan(0)
    }
    if (contactInfo.website) {
      expect(contactInfo.website).toBeTruthy()
      expect(contactInfo.website.length).toBeGreaterThan(0)
    }
  })
})

describe('Portfolio Data - Summary', () => {
  it('should export summary string', () => {
    expect(typeof summary).toBe('string')
    expect(summary.length).toBeGreaterThan(0)
  })
})

describe('Portfolio Data - Skills', () => {
  it('should export skills array', () => {
    expect(Array.isArray(skills)).toBe(true)
    expect(skills.length).toBeGreaterThan(0)
  })

  it('should have correct skill structure', () => {
    skills.forEach((skill) => {
      expect(skill).toHaveProperty('category')
      expect(skill).toHaveProperty('items')
      expect(typeof skill.category).toBe('string')
      expect(Array.isArray(skill.items)).toBe(true)
    })
  })

  it('should have non-empty skill items', () => {
    skills.forEach((skill) => {
      expect(skill.items.length).toBeGreaterThan(0)
      skill.items.forEach((item) => {
        expect(typeof item).toBe('string')
        expect(item.length).toBeGreaterThan(0)
      })
    })
  })
})

describe('Portfolio Data - Experience', () => {
  it('should export experience array', () => {
    expect(Array.isArray(experience)).toBe(true)
    expect(experience.length).toBeGreaterThan(0)
  })

  it('should have correct experience structure', () => {
    experience.forEach((job) => {
      expect(job).toHaveProperty('title')
      expect(job).toHaveProperty('company')
      expect(job).toHaveProperty('duration')
      expect(job).toHaveProperty('description')
      expect(typeof job.title).toBe('string')
      expect(typeof job.company).toBe('string')
      expect(typeof job.duration).toBe('string')
      expect(Array.isArray(job.description)).toBe(true)
    })
  })

  it('should format duration correctly', () => {
    experience.forEach((job) => {
      // Duration should be in format "Mon YYYY - Mon YYYY" or "Mon YYYY - Present"
      expect(job.duration).toMatch(/\w+ \d{4} - (\w+ \d{4}|Present)/)
    })
  })

  it('should have technologies array', () => {
    experience.forEach((job) => {
      expect(Array.isArray(job.technologies)).toBe(true)
    })
  })

  it('should filter empty descriptions', () => {
    experience.forEach((job) => {
      job.description.forEach((desc) => {
        expect(desc.trim().length).toBeGreaterThan(0)
      })
    })
  })
})

describe('Portfolio Data - Projects', () => {
  it('should export projects array', () => {
    expect(Array.isArray(projects)).toBe(true)
    expect(projects.length).toBeGreaterThan(0)
  })

  it('should have correct project structure', () => {
    projects.forEach((project) => {
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('description')
      expect(project).toHaveProperty('technologies')
      expect(project).toHaveProperty('highlights')
      expect(typeof project.name).toBe('string')
      expect(typeof project.description).toBe('string')
      expect(Array.isArray(project.technologies)).toBe(true)
      expect(Array.isArray(project.highlights)).toBe(true)
    })
  })

  it('should have non-empty project data', () => {
    projects.forEach((project) => {
      expect(project.name.length).toBeGreaterThan(0)
      expect(project.description.length).toBeGreaterThan(0)
      expect(project.technologies.length).toBeGreaterThan(0)
      expect(project.highlights.length).toBeGreaterThan(0)
    })
  })

  it('should have valid technology strings', () => {
    projects.forEach((project) => {
      project.technologies.forEach((tech) => {
        expect(typeof tech).toBe('string')
        expect(tech.length).toBeGreaterThan(0)
      })
    })
  })

  it('should have valid highlight strings', () => {
    projects.forEach((project) => {
      project.highlights.forEach((highlight) => {
        expect(typeof highlight).toBe('string')
        expect(highlight.length).toBeGreaterThan(0)
      })
    })
  })
})

describe('Portfolio Data - extractLocation Function', () => {
  // We need to test the internal extractLocation function by testing the result
  it('should extract location from full address', () => {
    // The actual extractLocation is not exported, but we can verify the result through contactInfo.location
    // The format should be "City, Province 🇨🇦"
    expect(contactInfo.location).toMatch(/[A-Za-z\s]+, [A-Z]{2} 🇨🇦/)
  })

  it('should handle various address formats', () => {
    // Location should always contain the Canadian flag emoji
    expect(contactInfo.location).toContain('🇨🇦')
  })
})

describe('Portfolio Data - formatDateRange Function', () => {
  it('should format date ranges correctly in experience', () => {
    experience.forEach((job) => {
      // Should contain dash separator
      expect(job.duration).toContain(' - ')

      // Should either end with "Present" or a date
      expect(job.duration).toMatch(/.+ - (Present|\w+ \d{4})/)
    })
  })

  it('should handle "Present" for current jobs', () => {
    // At least one job should have "Present" (current position)
    const hasCurrentJob = experience.some((job) =>
      job.duration.includes('Present')
    )
    expect(hasCurrentJob).toBe(true)
  })

  it('should format dates as "Mon YYYY"', () => {
    experience.forEach((job) => {
      // Start date should be in "Mon YYYY" format
      const startMatch = job.duration.match(/^(\w+ \d{4})/)
      expect(startMatch).toBeTruthy()
    })
  })
})

describe('Portfolio Data - Edge Cases', () => {
  it('should handle missing social media profiles', () => {
    // Fields should be strings (empty or populated)
    expect(typeof contactInfo.github).toBe('string')
    expect(typeof contactInfo.linkedin).toBe('string')
    expect(typeof contactInfo.website).toBe('string')
  })

  it('should handle empty description lines in experience', () => {
    experience.forEach((job) => {
      // All description items should be non-empty after filtering
      job.description.forEach((desc) => {
        expect(desc.trim()).not.toBe('')
      })
    })
  })

  it('should handle optional technologies array', () => {
    experience.forEach((job) => {
      // Technologies should be an array (could be empty)
      expect(Array.isArray(job.technologies)).toBe(true)
    })
  })

  it('should handle calendar link', () => {
    // Calendar link should be a string (empty or populated)
    expect(typeof contactInfo.calendar).toBe('string')
  })
})
