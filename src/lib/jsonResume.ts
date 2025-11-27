import resumeData from '@/lib/resumeAdapter'
import { validateJSONResume } from '@/lib/jsonResumeSchema'
import { ensureProtocol } from '@/lib/utils/urlHelpers'
import type {
  ResumeData,
  SocialMediaLink,
  WorkExperience,
  Education,
  SkillGroup,
} from '@/types'

/**
 * Converts our resumeData format to JSON Resume standard format
 * Schema: https://jsonresume.org/schema/
 */
export function convertToJSONResume(customData?: ResumeData) {
  const data = customData || resumeData

  // Parse social media links
  const profiles = data.socialMedia.map((social: SocialMediaLink) => ({
    network: social.socialMedia,
    username:
      social.socialMedia === 'Github'
        ? social.link.replace('github.com/', '')
        : social.socialMedia === 'LinkedIn'
          ? social.link.replace('linkedin.com/in/', '')
          : '',
    url: ensureProtocol(social.link),
  }))

  // Convert work experience
  const work = data.workExperience.map((job: WorkExperience) => ({
    name: job.company,
    position: job.position,
    url: job.url ? ensureProtocol(job.url) : undefined,
    startDate: job.startYear,
    endDate: job.endYear === 'Present' ? '' : job.endYear,
    summary: job.description,
    highlights: job.keyAchievements.split('\n').filter((h: string) => h.trim()),
    keywords: job.technologies || [],
  }))

  // Convert education
  const education = data.education.map((edu: Education) => ({
    institution: edu.school,
    url: edu.url ? ensureProtocol(edu.url) : undefined,
    area: 'Computer Science and Engineering',
    studyType: "Bachelor's Degree",
    startDate: edu.startYear,
    endDate: edu.endYear,
  }))

  // Convert skills
  const skills = data.skills.map((skillGroup: SkillGroup) => ({
    name: skillGroup.title,
    level: '',
    keywords: skillGroup.skills.map((s) => s.text),
  }))

  // Convert languages
  const languages = data.languages.map((lang: string) => ({
    language: lang,
    fluency: 'Native speaker',
  }))

  // Parse address from the current format
  const addressParts = data.address.split(',').map((s) => s.trim())
  const location = {
    address: addressParts[0] || '',
    postalCode: addressParts[2]?.match(/[A-Z]\d[A-Z]\s?\d[A-Z]\d/)?.[0] || '',
    city: addressParts[1] || '',
    countryCode: 'CA',
    region: addressParts[2]?.match(/[A-Z]{2}/)?.[0] || 'ON',
  }

  // Keep Website in profiles array to preserve ordering
  // The JSON Resume standard has basics.url but no ordering concept
  // By keeping Website as a profile, we preserve drag-and-drop order
  const websiteProfile = profiles.find(
    (p: { network: string; username: string; url: string }) =>
      p.network === 'Website'
  )

  // Build basics object without url field (kept in profiles for order preservation)
  const basics: any = {
    name: data.name,
    label: data.position,
    image: data.profilePicture || '',
    email: data.email,
    phone: data.contactInformation,
    summary: data.summary,
    location,
    profiles: profiles, // Keep all profiles including Website for order preservation
  }

  // Process certifications - add https:// to URLs and omit empty URLs
  const certificates = (data.certifications || []).map((cert) => {
    const certObj: any = {
      name: cert.name,
      date: cert.date,
      issuer: cert.issuer,
    }
    // Only include url if it's not empty
    if (cert.url && cert.url.trim()) {
      certObj.url = ensureProtocol(cert.url)
    }
    return certObj
  })

  const jsonResume = {
    $schema:
      'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics,
    work,
    volunteer: [],
    education,
    awards: [],
    certificates,
    publications: [],
    skills,
    languages,
    interests: [],
    references: [],
    projects: [],
  }

  return jsonResume
}

/**
 * Converts JSON Resume format back to our internal resumeData format
 * Returns null if conversion fails
 */
export function convertFromJSONResume(
  jsonResume: JSONResume
): ResumeData | null {
  try {
    // Validate first
    const validation = validateJSONResume(jsonResume)
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors)
      return null
    }

    const basics = jsonResume.basics || {}

    // Convert profiles back to social media format
    const profiles = basics.profiles || []
    const socialMedia = profiles.map((profile) => ({
      socialMedia: profile.network || '',
      link: profile.url?.replace(/^https?:\/\//, '') || '',
    }))

    // Add website if present in basics.url
    if (basics.url) {
      socialMedia.unshift({
        socialMedia: 'Website',
        link: basics.url.replace(/^https?:\/\//, ''),
      })
    }

    // Convert work experience back
    const workExperience = (jsonResume.work || []).map((job) => ({
      company: job.name || '',
      url: job.url?.replace(/^https?:\/\//, '') || '',
      position: job.position || '',
      description: job.summary || '',
      keyAchievements: (job.highlights || []).join('\n'),
      startYear: job.startDate || '',
      endYear: job.endDate || 'Present',
      technologies: job.keywords || [],
    }))

    // Convert education back
    const education = (jsonResume.education || []).map((edu) => ({
      school: edu.institution || '',
      url: edu.url?.replace(/^https?:\/\//, '') || '',
      degree: edu.studyType || '',
      startYear: edu.startDate || '',
      endYear: edu.endDate || '',
    }))

    // Convert skills back - merge all skill keywords into categories
    const skills = (jsonResume.skills || []).map((skillGroup) => ({
      title: skillGroup.name || 'Skills',
      skills: (skillGroup.keywords || []).map((keyword: string) => ({
        text: keyword,
      })),
    }))

    // Convert languages back
    const languages = (jsonResume.languages || []).map(
      (lang) => lang.language || (typeof lang === 'string' ? lang : '')
    )

    // Convert certifications back
    const certifications = jsonResume.certificates || []

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
      socialMedia,
      summary: basics.summary || '',
      education,
      workExperience,
      skills: skills.length > 0 ? skills : [{ title: 'Skills', skills: [] }],
      languages,
      certifications,
    }
  } catch (error) {
    console.error('Error converting JSON Resume:', error)
    return null
  }
}
