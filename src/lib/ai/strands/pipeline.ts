import { AgentConfig } from './types'
import { analyzeJobDescriptionGraph } from './jd-refinement-graph'
import { generateSummaryGraph } from './summary-graph'
// import { tailorExperienceToJDGraph } from './experience-tailoring-graph'
import type { ResumeData, WorkExperience } from '@/types'

/**
 * Represents the current progress of the AI generation pipeline.
 */
export interface PipelineProgress {
  currentStep: number
  totalSteps: number
  message: string
  done: boolean
  // Partial results available as each step completes
  refinedJD?: string
  summary?: string
  workExperiences?: WorkExperience[]
}

/**
 * The final results gathered from a completed AI generation pipeline run.
 */
export interface PipelineResult {
  refinedJD: string
  summary: string
  workExperiences: WorkExperience[]
}

/**
 * Orchestrates all AI generation jobs sequentially:
 * 1. Refine Job Description
 * 2. Generate Summary (using refined JD)
 * 3. Tailor each Work Experience (using refined JD)
 *
 * Sequential execution reduces load on AI model and prevents rate limiting.
 */
export async function runAIGenerationPipeline(
  resumeData: ResumeData,
  jobDescription: string,
  config: AgentConfig,
  onProgress?: (progress: PipelineProgress) => void
): Promise<PipelineResult> {
  const workExperiences = resumeData.workExperience || []
  const totalSteps = 2 // JD + Summary (Experience tailoring disabled for now)
  let currentStep = 0

  // Step 1: Refine Job Description
  currentStep++
  onProgress?.({
    currentStep,
    totalSteps,
    message: 'Refining job description...',
    done: false,
  })

  const refinedJD = await analyzeJobDescriptionGraph(jobDescription, config, (progress) => {
    // Forward the graph progress to the main pipeline progress if needed
    // but for now we just want the incremental JD after it completes
    if (progress.content && !progress.done) {
      onProgress?.({
        currentStep: 1,
        totalSteps,
        message: progress.content,
        done: false,
      })
    }
  })
  onProgress?.({
    currentStep: 1,
    totalSteps,
    message: 'JD refinement complete',
    done: false,
    refinedJD,
  })

  // Step 2: Generate Summary
  currentStep++
  onProgress?.({
    currentStep,
    totalSteps,
    message: 'Generating professional summary...',
    done: false,
    refinedJD,
  })

  const updatedResumeData: ResumeData = {
    ...resumeData,
  }

  const summary = await generateSummaryGraph(
    updatedResumeData,
    refinedJD, // Use refined JD
    config,
    (p) => {
      if (p.content && !p.done) {
        onProgress?.({
          currentStep: 2,
          totalSteps,
          message: p.content,
          done: false,
          refinedJD,
        })
      }
    }
  )
  onProgress?.({
    currentStep,
    totalSteps,
    message: 'Summary generation complete',
    done: false,
    refinedJD,
    summary,
  })

  // Steps 3+: Tailor Each Work Experience (DISABLED)
  /*
    const tailoredExperiences: WorkExperience[] = []

    for (let i = 0; i < workExperienceCount; i++) {
        ...
    }
    */
  const tailoredExperiences = [...workExperiences]
  onProgress?.({
    currentStep: totalSteps,
    totalSteps,
    message: 'AI optimization complete!',
    done: true,
  })

  return {
    refinedJD,
    summary,
    workExperiences: tailoredExperiences,
  }
}
