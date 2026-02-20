/**
 * Text Export Utility
 * Converts resume data to Markdown-flavored plain text format for ATS compatibility and accessibility.
 * Uses sentence splitting for professional summaries.
 */

import { ResumeData } from '@/types/resume'
import { splitTextIntoSentences } from '@/lib/utils/stringHelpers'
import { ensureProtocol } from '@/lib/utils/urlHelpers'

/**
 * Convert resume data to Markdown-flavored plain text format
 * @param data - Resume data structure
 * @returns Formatted Markdown text resume
 */
export function convertResumeToText(data: ResumeData): string {
  const lines: string[] = []
  const horizontalLine = '-'.repeat(80)

  // Header
  lines.push(`# ${data.name.toUpperCase()}`)
  lines.push(`## ${data.position}`)
  lines.push('')

  // Contact Information
  if (data.email) lines.push(`- Email: [${data.email}](mailto:${data.email})`)
  if (data.contactInformation) lines.push(`- Phone: ${data.contactInformation}`)
  if (data.address) lines.push(`- Address: ${data.address}`)

  // Social Media Links
  if (data.socialMedia && data.socialMedia.length > 0) {
    data.socialMedia.forEach((social) => {
      if (social.socialMedia && social.link) {
        lines.push(`- ${social.socialMedia}: [${social.link}](${ensureProtocol(social.link)})`)
      }
    })
  }
  lines.push('')
  lines.push(horizontalLine)

  // Professional Summary (Split into bullet points)
  if (data.summary) {
    lines.push(`## SUMMARY`)
    lines.push('')
    splitTextIntoSentences(data.summary).forEach((sentence) => {
      lines.push(`- ${sentence}`)
    })
    lines.push('')
    lines.push(horizontalLine)
  }

  // Work Experience
  if (data.workExperience && data.workExperience.length > 0) {
    lines.push(`## EXPERIENCE`)
    lines.push('')
    data.workExperience.forEach((job, index) => {
      if (index > 0) lines.push('')
      lines.push(`### ${job.position} @ [${job.organization}](${job.url ? ensureProtocol(job.url) : '#'})`)
      lines.push(`${job.startYear} - ${job.endYear === 'Present' ? 'Present' : job.endYear}`)
      if (job.description) {
        lines.push(job.description)
      }
      if (job.keyAchievements && job.keyAchievements.length > 0) {
        job.keyAchievements.forEach((achievement) => {
          lines.push(`- ${achievement.text}`)
        })
      }
      if (job.technologies && job.technologies.length > 0 && job.showTechnologies !== false) {
        lines.push(`> Tech Stack: ${job.technologies.join(', ')}`)
      }
    })
    lines.push('')
    lines.push(horizontalLine)
  }

  // Education
  if (data.education && data.education.length > 0) {
    lines.push(`## EDUCATION`)
    lines.push('')
    data.education.forEach((edu, index) => {
      if (index > 0) lines.push('')
      lines.push(`### ${edu.studyType} @ [${edu.school}](${edu.url ? ensureProtocol(edu.url) : '#'})`)
      lines.push(`${edu.startYear} - ${edu.endYear}`)
      lines.push(`Major: ${edu.area}`)
    })
    lines.push('')
    lines.push(horizontalLine)
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    lines.push(`## SKILLS`)
    lines.push('')
    data.skills.forEach((skillGroup) => {
      const skillTexts = skillGroup.skills.map((skill) => skill.text)
      lines.push(`- ${skillGroup.title}: ${skillTexts.join(', ')}`)
    })
    lines.push('')
    lines.push(horizontalLine)
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    lines.push(`## PROJECTS`)
    lines.push('')
    data.projects.forEach((project, index) => {
      if (index > 0) lines.push('')
      lines.push(`### [${project.name}](${project.link ? ensureProtocol(project.link) : '#'})`)
      if (project.startYear || project.endYear) {
        lines.push(
          `${project.startYear || ''}${project.startYear && project.endYear ? ' - ' : ''}${project.endYear || ''}`
        )
      }
      if (project.description) {
        lines.push(project.description)
      }
      if (project.keyAchievements && project.keyAchievements.length > 0) {
        project.keyAchievements.forEach((achievement) => {
          lines.push(`- ${achievement.text}`)
        })
      }
    })
    lines.push('')
    lines.push(horizontalLine)
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    lines.push(`## CERTIFICATIONS`)
    lines.push('')
    data.certifications.forEach((cert, index) => {
      if (index > 0) lines.push('')
      lines.push(`### ${cert.name}`)
      lines.push(`- Issued by: ${cert.issuer}`)
      lines.push(`- Date: ${cert.date}`)
      if (cert.url) lines.push(`- Verification: ${ensureProtocol(cert.url)}`)
    })
    lines.push('')
    lines.push(horizontalLine)
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    lines.push(`## LANGUAGES`)
    lines.push('')
    data.languages.forEach((language, index) => {
      if (index > 0) lines.push('')
      lines.push(`- ${language}`)
    })
    lines.push('')
  }

  return lines.join('\n')
}
