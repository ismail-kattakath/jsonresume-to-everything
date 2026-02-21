import { StreamCallback } from '@/types/openai'
import { ResumeData } from '@/types'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createSummaryAgents } from '@/lib/ai/strands/summary/agents'

export * from '@/lib/ai/strands/summary/types'

/**
 * Multi-agent graph flow for generating a high-quality professional summary.
 * Uses a "Semantic Pillar" strategy based on a high-quality benchmark example.
 */
export async function generateSummaryGraph(
  resumeData: ResumeData,
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  // 1. DYNAMIC YEARS OF EXPERIENCE CALCULATION
  const workExp = resumeData.workExperience || []
  const lastJob = workExp[workExp.length - 1]
  const firstJobYear = lastJob?.startYear ? new Date(lastJob.startYear).getFullYear() : null
  const yearsExperience = firstJobYear ? new Date().getFullYear() - firstJobYear : null
  const experienceString = yearsExperience ? `${yearsExperience}+ years` : 'extensive experience'

  // Extract all skills from resume for validation tool and context
  const allowedSkills = resumeData.skills?.flatMap((group) => group.skills.map((s) => s.text)) || []

  const agents = createSummaryAgents(config, allowedSkills)

  if (onProgress)
    onProgress({
      content: 'Identifying job-relevant metrics and skills...\n',
      done: false,
    })

  const analystPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\nCANDIDATE WORK HISTORY:\n${JSON.stringify(workExp)}\n\nALLOWED SKILLS:\n${allowedSkills.join(', ')}`
  const analysisResult = await agents.analyst.invoke(analystPrompt)
  const analysisBrief = analysisResult.toString().trim()

  if (onProgress)
    onProgress({
      content: 'Drafting your professional summary...\n',
      done: false,
    })

  let iteration = 0
  const maxIterations = 2
  let currentSummary = ''
  let lastCritique = ''

  while (iteration <= maxIterations) {
    iteration++

    const writerPrompt =
      iteration === 1
        ? `Analysis Brief:\n${analysisBrief}\n\nAllowed Skills:\n${allowedSkills.join(', ')}\n\nCandidate Experience: ${experienceString}`
        : `The summary failed audit. Fix it based on this critique:\n${lastCritique}\n\nSummary Attempt:\n${currentSummary}\n\nAllowed Skills:\n${allowedSkills.join(', ')}\n\nCandidate Experience: ${experienceString}`

    const writerResult = await agents.writer.invoke(writerPrompt)
    currentSummary = writerResult
      .toString()
      .replace(/^["']|["']$/g, '')
      .trim()

    if (onProgress)
      onProgress({
        content: 'Auditing summary for structure and alignment...',
        done: false,
      })

    const reviewPrompt = `Summary to review:\n${currentSummary}\n\nVerify against the 4-sentence structure using the validate_skills tool.`
    const reviewResult = await agents.reviewer.invoke(reviewPrompt)
    const reviewText = reviewResult.toString().trim()

    if (reviewText.startsWith('APPROVED')) {
      if (onProgress)
        onProgress({
          content: 'Expert summary generated and verified.',
          done: true,
        })
      return currentSummary
    } else {
      lastCritique = reviewText
      if (onProgress)
        onProgress({
          content: `Audit failed: ${reviewText.slice(0, 50)}...`,
          done: false,
        })
    }
  }

  if (onProgress)
    onProgress({
      content: 'Generated with minor validation warnings.',
      done: true,
    })
  return currentSummary
}
