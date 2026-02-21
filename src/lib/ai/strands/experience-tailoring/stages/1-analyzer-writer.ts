import { StreamCallback } from '@/types/openai'
import { TailoringAgents } from '@/lib/ai/strands/experience-tailoring/agents'

/**
 *
 */
export interface AnalyzerWriterInput {
  jobDescription: string
  position: string
  organization: string
  description: string
  achievements: string[]
}

/**
 *
 */
export interface AnalyzerWriterResult {
  rewrittenDescription: string
  analysis: string
}

/**
 * Stage 1: Analyze alignment potential and rewrite the description.
 */
export async function runAnalyzerAndWriterStage(
  agents: TailoringAgents,
  input: AnalyzerWriterInput,
  onProgress?: StreamCallback
): Promise<AnalyzerWriterResult> {
  const { jobDescription, position, organization, description, achievements } = input

  onProgress?.({
    content: 'Analyzing job requirements and experience fit...',
    done: false,
  })

  // Stage 1a: Analyze alignment potential
  const analysisPrompt = `Job Description:\n${jobDescription}\n\nPosition: ${position}\nOrganization: ${organization}\nDescription: ${description}\nAchievements:\n${achievements.join('\n')}`
  const analysisResult = await agents.analyzer.invoke(analysisPrompt)
  const analysis = analysisResult.toString().trim()

  onProgress?.({
    content: 'Tailoring description to job requirements...',
    done: false,
  })

  // Stage 1b: Rewrite description
  const descriptionPrompt = `Analysis:\n${analysis}\n\nOriginal Description:\n${description}\n\nJob Description:\n${jobDescription}`
  const descriptionResult = await agents.descriptionWriter.invoke(descriptionPrompt)

  return {
    rewrittenDescription: descriptionResult.toString().trim(),
    analysis,
  }
}
