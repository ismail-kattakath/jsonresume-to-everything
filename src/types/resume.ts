/**
 * Internal Resume Data Types
 * These types represent the application's internal data structure
 * after conversion from JSON Resume format
 */

/**
 * Represents a link to a social media profile.
 */
export interface SocialMediaLink {
  socialMedia: string
  link: string
}

/**
 * Represents a specific professional achievement or bullet point.
 */
export interface Achievement {
  text: string
}

/**
 * Represents a single work experience entry in the resume.
 */
export interface WorkExperience {
  organization: string
  url: string
  position: string
  description: string
  keyAchievements: Achievement[]
  startYear: string
  endYear: string
  technologies?: string[]
  showTechnologies?: boolean // Optional: controls visibility of technologies in preview
}

/**
 * Represents an educational qualification or period of study.
 */
export interface Education {
  school: string
  url: string
  studyType: string
  area: string
  startYear: string
  endYear: string
}

/**
 * Represents a single skill or expertise area.
 */
export interface Skill {
  text: string
  highlight?: boolean
}

/**
 * Represents a group of related skills.
 */
export interface SkillGroup {
  title: string
  skills: Skill[]
}

/**
 * Represents a professional project or significant undertaking.
 */
export interface Project {
  name: string
  link: string
  description: string
  keyAchievements: Achievement[]
  keywords?: string[]
  startYear: string
  endYear: string
}

/**
 * Represents a professional certification or award.
 */
export interface Certification {
  name: string
  date: string
  issuer: string
  url: string
}

/**
 * Complete internal resume data structure
 */
export interface ResumeData {
  name: string
  position: string
  contactInformation: string
  email: string
  address: string
  nationality?: string
  visaStatus?: string
  profilePicture: string
  profileImage?: string
  calendarLink?: string
  socialMedia: SocialMediaLink[]
  summary: string
  education: Education[]
  workExperience: WorkExperience[]
  skills: SkillGroup[]
  languages: string[]
  certifications: Certification[]
  projects?: Project[]
  content?: string // Cover letter content
}
