import jsonResumeData from '@/data/resume.json';
import type { JSONResume, ResumeData } from '@/types';

/**
 * Converts JSON Resume format to internal resume data format
 * This allows the project to use a standard JSON Resume file as the source of truth
 */
function convertFromJSONResume(jsonResume: JSONResume): ResumeData {
  const basics = jsonResume.basics || {};

  // Convert profiles back to social media format
  const profiles = basics.profiles || [];
  const socialMedia = profiles.map((profile) => ({
    socialMedia: profile.network || '',
    link: profile.url?.replace(/^https?:\/\//, '') || '',
  }));

  // Add website if present
  if (basics.url) {
    socialMedia.unshift({
      socialMedia: 'Website',
      link: basics.url.replace(/^https?:\/\//, ''),
    });
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
  }));

  // Convert education back
  const education = (jsonResume.education || []).map((edu) => ({
    school: edu.institution || '',
    url: edu.url?.replace(/^https?:\/\//, '') || '',
    degree: edu.studyType || '',
    startYear: edu.startDate || '',
    endYear: edu.endDate || '',
  }));

  // Convert skills back
  const skills = (jsonResume.skills || []).map((skillGroup) => ({
    title: skillGroup.name || 'Skills',
    skills: (skillGroup.keywords || []).map((keyword) => ({
      text: keyword,
      highlight: false,
    })),
  }));

  // Convert languages back
  const languages = (jsonResume.languages || []).map((lang) =>
    typeof lang === 'string' ? lang : (lang.language || '')
  ).filter(Boolean);

  // Convert certifications back
  const certifications = (jsonResume.certificates || []).map((cert) => ({
    name: cert.name || '',
    date: cert.date || '',
    issuer: cert.issuer || '',
    url: cert.url || '',
  }));

  // Reconstruct location
  const location = basics.location || {};
  const address = [
    location.address,
    location.city,
    [location.region, location.postalCode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

  return {
    name: basics.name || '',
    position: basics.label || '',
    contactInformation: basics.phone || '',
    email: basics.email || '',
    address: address || '',
    profilePicture: basics.image || '',
    socialMedia,
    summary: basics.summary || '',
    showSummary: true,
    education,
    showEducationDates: true,
    workExperience,
    skills: skills.length > 0 ? skills : [{ title: 'Skills', skills: [] }],
    languages,
    showLanguages: true,
    certifications,
  };
}

// Convert the JSON Resume data to internal format
const resumeData = convertFromJSONResume(jsonResumeData);

export default resumeData;
