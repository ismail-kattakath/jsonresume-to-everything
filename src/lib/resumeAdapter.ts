import jsonResumeData from '@/data/resume.json'
import { stripProtocol } from '@/lib/utils/urlHelpers'
import type { JSONResume, ResumeData } from '@/types'

/**
 * Converts JSON Resume format to internal resume data format
 * This allows the project to use a standard JSON Resume file as the source of truth
 */
function convertFromJSONResume(jsonResume: JSONResume): ResumeData {
  const basics = jsonResume.basics || {}

  // Convert profiles back to social media format
  const profiles = basics.profiles || []
  const socialMedia = profiles.map((profile) => ({
    socialMedia: profile.network || '',
    link: stripProtocol(profile.url || ''),
  }))

  // Add website if present AND not already in profiles (for backward compatibility)
  // New exports include Website in profiles array to preserve order
  const hasWebsiteInProfiles = socialMedia.some(
    (sm) => sm.socialMedia === 'Website'
  )
  if (basics.url && !hasWebsiteInProfiles) {
    socialMedia.unshift({
      socialMedia: 'Website',
      link: stripProtocol(basics.url),
    })
  }

  // Convert work experience back
  const workExperience = (jsonResume.work || []).map((job) => ({
    organization: job.name || '',
    url: stripProtocol(job.url || ''),
    position: job.position || '',
    description: job.summary || '',
    keyAchievements: (job.highlights || []).map((highlight) => ({
      text: highlight,
    })),
    startYear: job.startDate || '',
    endYear: job.endDate || 'Present',
    technologies: job.keywords || [],
  }))

  // Convert education back
  const education = (jsonResume.education || []).map((edu) => ({
    school: edu.institution || '',
    url: stripProtocol(edu.url || ''),
    degree: edu.studyType || '',
    startYear: edu.startDate || '',
    endYear: edu.endDate || '',
  }))

  // Convert skills back
  const skills = (jsonResume.skills || []).map((skillGroup) => ({
    title: skillGroup.name || 'Skills',
    skills: (skillGroup.keywords || []).map((keyword) => ({
      text: keyword,
    })),
  }))

  // Convert languages back
  const languages = (jsonResume.languages || [])
    .map((lang) => (typeof lang === 'string' ? lang : lang.language || ''))
    .filter(Boolean)

  // Convert certifications back
  const certifications = (jsonResume.certificates || []).map((cert) => ({
    name: cert.name || '',
    date: cert.date || '',
    issuer: cert.issuer || '',
    url: cert.url || '',
  }))

  // Convert projects back
  const projects = (jsonResume.projects || []).map((project) => ({
    name: project.name || '',
    link: stripProtocol(project.url || ''),
    description: project.description || '',
    keyAchievements: (project.highlights || []).map((highlight) => ({
      text: highlight,
    })),
    startYear: project.startDate || '',
    endYear: project.endDate || '',
  }))

  // Reconstruct location
  const location = basics.location || {}
  const address = [
    location.address,
    location.city,
    [location.region, location.postalCode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ')

  return {
    name: basics.name || '',
    position: basics.label || '',
    contactInformation: basics.phone || '',
    email: basics.email || '',
    address: address || '',
    profilePicture: basics.image || '',
    calendarLink:
      (basics as JSONResumeBasics & { calendar?: string }).calendar || '',
    socialMedia,
    summary: basics.summary || '',
    education,
    workExperience,
    skills: skills.length > 0 ? skills : [{ title: 'Skills', skills: [] }],
    languages,
    certifications,
    projects: projects.length > 0 ? projects : undefined,
  }
}

// Convert the JSON Resume data to internal format
const resumeData = convertFromJSONResume(jsonResumeData)

export default resumeData
