import { StreamCallback } from '@/types/openai'
import { ResumeData } from '@/types'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createJobTitleAgents } from '@/lib/ai/strands/job-title/agents'

export * from '@/lib/ai/strands/job-title/types'

const MAX_ITERATIONS = 3

/**
 * Generates a clean, professional job title based on resume data and job description.
 */
export async function generateJobTitleGraph(
  resumeData: ResumeData,
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  const agents = createJobTitleAgents(config)

  const analystInput = `Job Description:
${jobDescription}

Resume Summary:
${resumeData.summary || 'Not provided'}

Recent Experience:
${
  resumeData.workExperience
    ?.slice(0, 2)
    .map((exp) => `${exp.position} at ${exp.organization}`)
    .join('\n') || 'Not provided'
}`

  onProgress?.({ content: 'Analyzing job requirements...', done: false })
  const analysisResult = await agents.analyst.invoke(analystInput)
  const analysis = analysisResult.toString()

  onProgress?.({ content: 'Crafting job title...', done: false })
  const writerResult = await agents.writer.invoke(`Analysis:\n${analysis}\n\nGenerate the job title now:`)
  let jobTitle = writerResult.toString().trim()

  let iteration = 0
  while (iteration < MAX_ITERATIONS) {
    onProgress?.({ content: 'Validating job title...', done: false })
    const reviewResult = await agents.reviewer.invoke(`Generated Job Title:\n"${jobTitle}"`)
    const review = reviewResult.toString().trim()

    if (review.startsWith('APPROVED')) {
      break
    }

    if (review.includes('CRITIQUE:')) {
      // Extract corrected title (should be on the line after CRITIQUE)
      const lines = review.split('\n')
      const correctedTitle = lines.slice(1).join('\n').trim()

      if (correctedTitle && correctedTitle !== jobTitle) {
        jobTitle = correctedTitle
        iteration++
      } else {
        // If no correction provided, break to avoid infinite loop
        break
      }
    } else {
      break
    }
  }

  // Final cleanup: strip any remaining markdown
  const cleanTitle = jobTitle
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .trim()

  onProgress?.({ content: 'Job title generated!', done: true })
  return cleanTitle
}
