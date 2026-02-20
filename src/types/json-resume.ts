/**
 * JSON Resume Schema Types
 * Based on https://jsonresume.org/schema/
 *
 * This represents the standard JSON Resume format v1.0.0
 * Used as the source of truth for resume data
 */

/**
 * Basic information about the individual in JSON Resume format.
 */
export interface JSONResumeBasics {
  name?: string
  label?: string
  image?: string
  email?: string
  phone?: string
  url?: string
  summary?: string
  location?: {
    address?: string
    postalCode?: string
    city?: string
    countryCode?: string
    region?: string
  }
  profiles?: JSONResumeProfile[]
}

/**
 * Social media profiles linked in the resume.
 */
export interface JSONResumeProfile {
  network?: string
  username?: string
  url?: string
}

/**
 * Professional work experience entries.
 */
export interface JSONResumeWork {
  name?: string
  position?: string
  url?: string
  startDate?: string
  endDate?: string
  summary?: string
  highlights?: string[]
  keywords?: string[]
}

/**
 * Educational background and credentials.
 */
export interface JSONResumeEducation {
  institution?: string
  url?: string
  area?: string
  studyType?: string
  startDate?: string
  endDate?: string
  score?: string
  courses?: string[]
}

/**
 * Professional and technical skill categories.
 */
export interface JSONResumeSkill {
  name?: string
  level?: string
  keywords?: string[]
}

/**
 * Languages spoken by the individual.
 */
export interface JSONResumeLanguage {
  language?: string
  fluency?: string
}

/**
 * Professional certifications and credentials.
 */
export interface JSONResumeCertificate {
  name?: string
  date?: string
  issuer?: string
  url?: string
}

/**
 * Professional or personal projects.
 */
export interface JSONResumeProject {
  name?: string
  description?: string
  highlights?: string[]
  keywords?: string[]
  startDate?: string
  endDate?: string
  url?: string
  roles?: string[]
  entity?: string
  type?: string
}

/**
 * Awards and recognitions received.
 */
export interface JSONResumeAward {
  title?: string
  date?: string
  awarder?: string
  summary?: string
}

/**
 * Volunteer work and non-profit experience.
 */
export interface JSONResumeVolunteer {
  organization?: string
  position?: string
  url?: string
  startDate?: string
  endDate?: string
  summary?: string
  highlights?: string[]
}

/**
 * Published work such as articles or books.
 */
export interface JSONResumePublication {
  name?: string
  publisher?: string
  releaseDate?: string
  url?: string
  summary?: string
}

/**
 * Professional references.
 */
export interface JSONResumeReference {
  name?: string
  reference?: string
}

/**
 * Personal interests and hobbies.
 */
export interface JSONResumeInterest {
  name?: string
  keywords?: string[]
}

/**
 * Complete JSON Resume schema
 */
export interface JSONResume {
  $schema?: string
  basics?: JSONResumeBasics
  work?: JSONResumeWork[]
  volunteer?: JSONResumeVolunteer[]
  education?: JSONResumeEducation[]
  awards?: JSONResumeAward[]
  certificates?: JSONResumeCertificate[]
  publications?: JSONResumePublication[]
  skills?: JSONResumeSkill[]
  languages?: JSONResumeLanguage[]
  interests?: JSONResumeInterest[]
  references?: JSONResumeReference[]
  projects?: JSONResumeProject[]
}
