/**
 * Internal Resume Data Types
 * These types represent the application's internal data structure
 * after conversion from JSON Resume format
 */

export interface SocialMediaLink {
  socialMedia: string
  link: string
}

export interface Achievement {
  text: string
}

export interface WorkExperience {
  organization: string
  url: string
  position: string
  description: string
  keyAchievements: Achievement[]
  startYear: string
  endYear: string
  technologies: string[]
  showTechnologies?: boolean // Optional: controls visibility of technologies in preview
}

export interface Education {
  school: string
  url: string
  degree: string
  startYear: string
  endYear: string
}

export interface Skill {
  text: string
}

export interface SkillGroup {
  title: string
  skills: Skill[]
}

export interface Project {
  name: string
  link: string
  description: string
  keyAchievements: Achievement[]
  startYear: string
  endYear: string
}

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
  profilePicture: string
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
