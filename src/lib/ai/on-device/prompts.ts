import type { ResumeData, WorkExperience } from '@/types'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/cover-letter/prompts'

/**
 * Builds a single-string prompt for the on-device Gemma3 model.
 * Gemma3 expects a combined system + user prompt rather than a chat messages array.
 */

function formatWorkExperience(resumeData: ResumeData): string {
  if (!resumeData.workExperience?.length) return 'No work experience provided.'
  return resumeData.workExperience
    .map(
      (job: WorkExperience) =>
        `${job.position} at ${job.organization}\n${
          Array.isArray(job.keyAchievements)
            ? job.keyAchievements.map((a) => (typeof a === 'string' ? a : a.text)).join('; ')
            : ''
        }`
    )
    .join('\n\n')
}

function formatSkills(resumeData: ResumeData): string {
  if (!resumeData.skills?.length) return 'No skills provided.'
  return resumeData.skills
    .map((group) => `${group.title}: ${group.skills?.map((s) => s.text).join(', ') || ''}`)
    .join('\n')
}

/**
 * Builds a prompt for on-device cover letter generation.
 * Combines the existing WRITER system prompt with candidate data and JD.
 */
export function buildOnDeviceCoverLetterPrompt(resumeData: ResumeData, jobDescription: string): string {
  return `<system>
${SYSTEM_PROMPTS.WRITER}
</system>

<user>
CANDIDATE INFORMATION:
Name: ${resumeData.name || 'Not provided'}
Position: ${resumeData.position || 'Not provided'}

WORK EXPERIENCE:
${formatWorkExperience(resumeData)}

SKILLS:
${formatSkills(resumeData)}

JOB DESCRIPTION:
${jobDescription}

Write the cover letter now.
</user>

<assistant>`
}

/**
 * Builds a prompt for on-device professional summary generation.
 */
export function buildOnDeviceSummaryPrompt(resumeData: ResumeData, jobDescription: string): string {
  return `<system>
You are a senior technical recruiter writing a compelling professional summary for a resume.
Write a 2-3 sentence professional summary in third-person (no "I", "my", "me").
Be specific, use industry keywords from the job description, and highlight measurable impact.
Keep it under 80 words. Do NOT use clichés like "results-driven" or "passionate".
</system>

<user>
CANDIDATE: ${resumeData.name || 'Candidate'}, ${resumeData.position || 'Professional'}
SKILLS: ${formatSkills(resumeData)}
WORK HISTORY: ${formatWorkExperience(resumeData)}
TARGET JOB: ${jobDescription.slice(0, 500)}

Write the professional summary now (2-3 sentences, third-person, under 80 words):
</user>

<assistant>`
}

/**
 * Builds a prompt for on-device work experience bullet-point suggestion.
 */
export function buildOnDeviceWorkExperiencePrompt(
  existingDescription: string,
  position: string,
  organization: string,
  achievements: Array<{ text: string } | string>,
  jobDescription: string
): string {
  const achievementStr = achievements.map((a) => (typeof a === 'string' ? a : a.text)).join('; ')

  return `<system>
You are a resume writer. Rewrite the work experience description using strong action verbs and quantified results.
Align the bullets to the job description keywords. Keep each bullet under 20 words. Return 3-5 bullet points starting with "-".
</system>

<user>
ROLE: ${position} at ${organization}
EXISTING DESCRIPTION: ${existingDescription || 'None'}
KEY ACHIEVEMENTS: ${achievementStr || 'None'}
TARGET JOB: ${jobDescription.slice(0, 300)}

Write the bullet points now:
</user>

<assistant>`
}
/**
 * Builds a prompt for on-device job description refinement.
 */
export function buildOnDeviceRefineJDPrompt(jobDescription: string): string {
  return `<system>
You are a job search expert. Refine the provided job description to be clearer, more structured, and highlight the most important requirements.
Use bullet points for requirements. Keep the original meaning but make it professional and scannable.
</system>

<user>
ORIGINAL JOB DESCRIPTION:
${jobDescription}

Refine this job description now:
</user>

<assistant>`
}

/**
 * Builds a prompt for on-device skill extraction from a job description.
 */
export function buildOnDeviceExtractSkillsPrompt(jobDescription: string): string {
  return `<system>
You are a technical recruiter. Extract the top 10 relevant hard skills, technologies, and certifications from the job description.
Return them as a simple comma-separated list. Do not include introductory text.
</system>

<user>
JOB DESCRIPTION:
${jobDescription}

Extract the skills now (comma-separated list):
</user>

<assistant>`
}
