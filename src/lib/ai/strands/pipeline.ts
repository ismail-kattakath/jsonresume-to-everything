import { AgentConfig } from '@/lib/ai/strands/types'
import { analyzeJobDescriptionGraph } from '@/lib/ai/strands/jd-refinement-graph'
import { generateJobTitleGraph } from '@/lib/ai/strands/job-title-graph'
import { generateSummaryGraph } from '@/lib/ai/strands/summary-graph'
import { tailorExperienceToJDGraph } from '@/lib/ai/strands/experience-tailoring-graph'
import { sortSkillsGraph } from '@/lib/ai/strands/skills-sorting-graph'
import { extractSkillsGraph } from '@/lib/ai/strands/skills-extraction-graph'
import { generateCoverLetterGraph } from '@/lib/ai/strands/cover-letter-graph'
import type { ResumeData, WorkExperience, SkillGroup } from '@/types'

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
  jobTitle?: string
  summary?: string
  workExperiences?: WorkExperience[]
  skills?: SkillGroup[]
  coverLetter?: string
}

/**
 * The final results gathered from a completed AI generation pipeline run.
 */
export interface PipelineResult {
  refinedJD: string
  jobTitle: string
  summary: string
  workExperiences: WorkExperience[]
  skills: SkillGroup[]
  coverLetter: string
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
  const totalSteps = 6 + workExperiences.length
  let currentStep = 0

  // 1. JD Refinement
  currentStep++
  onProgress?.({
    currentStep,
    totalSteps,
    message: 'Refining job description...',
    done: false,
  })

  const refinedJD = await analyzeJobDescriptionGraph(jobDescription, config, (progress) => {
    if (progress.content && !progress.done) {
      onProgress?.({
        currentStep,
        totalSteps,
        message: progress.content,
        done: false,
      })
    }
  })

  // 2. Job Title
  currentStep++
  onProgress?.({
    currentStep,
    totalSteps,
    message: 'Generating job title...',
    done: false,
    refinedJD,
  })

  const jobTitle = await generateJobTitleGraph(resumeData, refinedJD, config, (progress) => {
    if (progress.content && !progress.done) {
      onProgress?.({
        currentStep,
        totalSteps,
        message: progress.content,
        done: false,
        refinedJD,
      })
    }
  })

  // 3. Summary
  currentStep++
  onProgress?.({
    currentStep,
    totalSteps,
    message: 'Generating summary...',
    done: false,
    refinedJD,
    jobTitle,
  })

  const summary = await generateSummaryGraph(resumeData, refinedJD, config, (progress) => {
    if (progress.content && !progress.done) {
      onProgress?.({
        currentStep,
        totalSteps,
        message: progress.content,
        done: false,
        refinedJD,
        jobTitle,
      })
    }
  })

  // 4. Experience Tailoring (Serial)
  const tailoredExperiences: WorkExperience[] = []
  for (let i = 0; i < workExperiences.length; i++) {
    currentStep++
    const exp = workExperiences[i]!
    onProgress?.({
      currentStep,
      totalSteps,
      message: `Tailoring ${exp.organization} experience (${i + 1}/${workExperiences.length})...`,
      done: false,
      refinedJD,
      jobTitle,
      summary,
      workExperiences: [...tailoredExperiences, ...workExperiences.slice(i)],
    })

    const tailored = await tailorExperienceToJDGraph(
      exp.description,
      (exp.keyAchievements || []).map((a) => a.text),
      jobTitle, // Use generated job title as position context
      exp.organization,
      refinedJD,
      exp.technologies,
      config,
      (progress) => {
        if (progress.content && !progress.done) {
          onProgress?.({
            currentStep,
            totalSteps,
            message: progress.content,
            done: false,
            refinedJD,
            jobTitle,
            summary,
            workExperiences: [...tailoredExperiences, ...workExperiences.slice(i)],
          })
        }
      }
    )

    tailoredExperiences.push({
      ...exp,
      description: tailored.description,
      keyAchievements: tailored.achievements.map((text) => ({ text })),
      technologies: tailored.techStack,
    })
  }

  // 5. Skills Sorting
  currentStep++
  onProgress?.({
    currentStep,
    totalSteps,
    message: 'Sorting skills...',
    done: false,
    refinedJD,
    jobTitle,
    summary,
    workExperiences: tailoredExperiences,
  })

  const skillsResult = await sortSkillsGraph(resumeData.skills || [], refinedJD, config, (progress) => {
    if (progress.content && !progress.done) {
      onProgress?.({
        currentStep,
        totalSteps,
        message: progress.content,
        done: false,
        refinedJD,
        jobTitle,
        summary,
        workExperiences: tailoredExperiences,
      })
    }
  })

  // Transform SkillsSortResult back to SkillGroup[]
  const sortedSkills: SkillGroup[] = skillsResult.groupOrder.map((groupTitle) => {
    const originalGroup = resumeData.skills?.find((g) => g.title === groupTitle)
    const skillsInGroup = skillsResult.skillOrder[groupTitle] || []
    return {
      title: groupTitle,
      skills: skillsInGroup.map((skillText) => ({
        text: skillText,
        highlight: originalGroup?.skills.find((s) => s.text === skillText)?.highlight,
      })),
    }
  })

  // 6. Skills Extraction
  currentStep++
  onProgress?.({
    currentStep,
    totalSteps,
    message: 'Extracting keywords...',
    done: false,
    refinedJD,
    jobTitle,
    summary,
    workExperiences: tailoredExperiences,
    skills: sortedSkills,
  })

  const _extractedKeywords = await extractSkillsGraph(refinedJD, config, (progress) => {
    if (progress.content && !progress.done) {
      onProgress?.({
        currentStep,
        totalSteps,
        message: progress.content,
        done: false,
        refinedJD,
        jobTitle,
        summary,
        workExperiences: tailoredExperiences,
        skills: sortedSkills,
      })
    }
  })

  // 7. Cover Letter (User listed as #8)
  currentStep++
  onProgress?.({
    currentStep,
    totalSteps,
    message: 'Generating cover letter...',
    done: false,
    refinedJD,
    jobTitle,
    summary,
    workExperiences: tailoredExperiences,
    skills: sortedSkills,
  })

  const coverLetter = await generateCoverLetterGraph(
    { ...resumeData, summary, workExperience: tailoredExperiences, skills: sortedSkills, position: jobTitle },
    refinedJD,
    config,
    (progress) => {
      if (progress.content && !progress.done) {
        onProgress?.({
          currentStep,
          totalSteps,
          message: progress.content,
          done: false,
          refinedJD,
          jobTitle,
          summary,
          workExperiences: tailoredExperiences,
          skills: sortedSkills,
        })
      }
    }
  )

  onProgress?.({
    currentStep: totalSteps,
    totalSteps,
    message: 'AI optimization complete!',
    done: true,
    refinedJD,
    jobTitle,
    summary,
    workExperiences: tailoredExperiences,
    skills: sortedSkills,
    coverLetter,
  })

  return {
    refinedJD,
    jobTitle,
    summary,
    workExperiences: tailoredExperiences,
    skills: sortedSkills,
    coverLetter,
  }
}
