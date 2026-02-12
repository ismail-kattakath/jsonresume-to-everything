import { AgentConfig } from './types'
import { analyzeJobDescription } from './jd-refinement'
import { generateSummaryGraph } from './summary-graph'
import { tailorExperienceToJD } from './experience-tailoring'
import type { ResumeData, WorkExperience, Achievement } from '@/types'

export interface PipelineProgress {
    currentStep: number
    totalSteps: number
    message: string
    done: boolean
}

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
    const workExperienceCount = workExperiences.length
    const totalSteps = 2 + workExperienceCount // JD + Summary + N experiences
    let currentStep = 0

    // Step 1: Refine Job Description
    currentStep++
    onProgress?.({
        currentStep,
        totalSteps,
        message: 'Refining job description...',
        done: false
    })

    const refinedJD = await analyzeJobDescription(
        jobDescription,
        config,
        () => {
            // Internal progress - don't update main progress
        }
    )

    // Step 2: Generate Summary
    currentStep++
    onProgress?.({
        currentStep,
        totalSteps,
        message: 'Generating professional summary...',
        done: false
    })

    // Create updated resume data with refined JD for summary generation
    const updatedResumeData: ResumeData = {
        ...resumeData,
    }

    const summary = await generateSummaryGraph(
        updatedResumeData,
        refinedJD, // Use refined JD
        config,
        () => {
            // Internal progress - don't update main progress
        }
    )

    // Steps 3+: Tailor Each Work Experience
    const tailoredExperiences: WorkExperience[] = []

    for (let i = 0; i < workExperienceCount; i++) {
        currentStep++
        const experience = workExperiences[i]

        if (!experience) continue

        onProgress?.({
            currentStep,
            totalSteps,
            message: `Tailoring experience ${i + 1} of ${workExperienceCount}: ${experience.position}...`,
            done: false
        })

        const achievements = (experience.keyAchievements || []).map((a: Achievement) => a.text)

        const result = await tailorExperienceToJD(
            experience.description || '',
            achievements,
            experience.position || '',
            experience.organization || '',
            refinedJD, // Use refined JD
            config,
            () => {
                // Internal progress - don't update main progress
            }
        )

        tailoredExperiences.push({
            ...experience,
            description: result.description,
            keyAchievements: result.achievements.map(text => ({ text }))
        })
    }

    onProgress?.({
        currentStep: totalSteps,
        totalSteps,
        message: 'AI optimization complete!',
        done: true
    })

    return {
        refinedJD,
        summary,
        workExperiences: tailoredExperiences
    }
}
