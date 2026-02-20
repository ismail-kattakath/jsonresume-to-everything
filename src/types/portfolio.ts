/**
 * Professional experience entry for the portfolio.
 */
export interface Experience {
  title: string
  organization: string
  location: string
  duration: string
  summary?: string // Organization/role description
  description: string[]
  technologies: string[]
}

/**
 * Skill category and associated items for the portfolio.
 */
export interface Skill {
  category: string
  items: string[]
}

/**
 * Featured project details for the portfolio showcase.
 */
export interface Project {
  name: string
  description: string
  technologies: string[]
  highlights: string[]
}

/**
 * Contact details and social profile links for the portfolio.
 */
export interface ContactInfo {
  name: string
  title: string
  location: string
  phone: string
  email: string
  github: string
  linkedin: string
  website?: string
  calendar?: string
}
