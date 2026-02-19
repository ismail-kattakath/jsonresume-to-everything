/**
 * Text Export Utility
 * Converts resume data to plain text format for ATS compatibility and accessibility
 */

import { ResumeData } from '@/types/resume'

/**
 * Convert resume data to plain text format
 * @param data - Resume data structure
 * @returns Formatted plain text resume
 */
export function convertResumeToText(data: ResumeData): string {
  const lines: string[] = []
  const separator = '='.repeat(80)
  const subSeparator = '-'.repeat(80)

  // Header
  lines.push(separator)
  lines.push(data.name.toUpperCase())
  lines.push(data.position)
  lines.push(separator)
  lines.push('')

  // Contact Information
  lines.push('CONTACT INFORMATION')
  lines.push(subSeparator)
  if (data.email) lines.push(`Email: ${data.email}`)
  if (data.contactInformation) lines.push(`Phone: ${data.contactInformation}`)
  if (data.address) lines.push(`Address: ${data.address}`)

  // Social Media Links
  if (data.socialMedia && data.socialMedia.length > 0) {
    data.socialMedia.forEach((social) => {
      if (social.socialMedia && social.link) {
        lines.push(`${social.socialMedia}: ${social.link}`)
      }
    })
  }
  lines.push('')

  // Professional Summary
  if (data.summary) {
    lines.push('PROFESSIONAL SUMMARY')
    lines.push(subSeparator)
    lines.push(data.summary)
    lines.push('')
  }

  // Work Experience
  if (data.workExperience && data.workExperience.length > 0) {
    lines.push('WORK EXPERIENCE')
    lines.push(subSeparator)
    data.workExperience.forEach((job, index) => {
      if (index > 0) lines.push('')
      lines.push(`${job.position} at ${job.organization}`)
      lines.push(
        `${job.startYear} - ${job.endYear === 'Present' ? 'Present' : job.endYear}`
      )
      if (job.url) lines.push(`Website: ${job.url}`)
      if (job.description) {
        lines.push('')
        lines.push(job.description)
      }
      if (job.keyAchievements && job.keyAchievements.length > 0) {
        lines.push('')
        lines.push('Key Achievements:')
        job.keyAchievements.forEach((achievement) => {
          lines.push(`  • ${achievement.text}`)
        })
      }
      if (
        job.technologies &&
        job.technologies.length > 0 &&
        job.showTechnologies !== false
      ) {
        lines.push('')
        lines.push(`Tech Stack: ${job.technologies.join(', ')}`)
      }
    })
    lines.push('')
  }

  // Education
  if (data.education && data.education.length > 0) {
    lines.push('EDUCATION')
    lines.push(subSeparator)
    data.education.forEach((edu, index) => {
      if (index > 0) lines.push('')
      lines.push(`${edu.studyType} in ${edu.area}`)
      lines.push(`${edu.school}`)
      lines.push(`${edu.startYear} - ${edu.endYear}`)
      if (edu.url) lines.push(`Website: ${edu.url}`)
    })
    lines.push('')
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    lines.push('SKILLS')
    lines.push(subSeparator)
    data.skills.forEach((skillGroup) => {
      lines.push(`${skillGroup.title}:`)
      const skillTexts = skillGroup.skills.map((skill) => skill.text)
      lines.push(`  ${skillTexts.join(', ')}`)
    })
    lines.push('')
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    lines.push('PROJECTS')
    lines.push(subSeparator)
    data.projects.forEach((project, index) => {
      if (index > 0) lines.push('')
      lines.push(project.name)
      lines.push(
        `${project.startYear} - ${project.endYear === 'Present' ? 'Present' : project.endYear}`
      )
      if (project.link) lines.push(`Link: ${project.link}`)
      if (project.description) {
        lines.push('')
        lines.push(project.description)
      }
      if (project.keyAchievements && project.keyAchievements.length > 0) {
        lines.push('')
        lines.push('Key Achievements:')
        project.keyAchievements.forEach((achievement) => {
          lines.push(`  • ${achievement.text}`)
        })
      }
    })
    lines.push('')
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    lines.push('CERTIFICATIONS')
    lines.push(subSeparator)
    data.certifications.forEach((cert, index) => {
      if (index > 0) lines.push('')
      lines.push(cert.name)
      lines.push(`Issued by: ${cert.issuer}`)
      lines.push(`Date: ${cert.date}`)
      if (cert.url) lines.push(`Verification: ${cert.url}`)
    })
    lines.push('')
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    lines.push('LANGUAGES')
    lines.push(subSeparator)
    lines.push(data.languages.join(', '))
    lines.push('')
  }

  // Footer
  lines.push(separator)
  lines.push('End of Resume')
  lines.push(separator)

  return lines.join('\n')
}
