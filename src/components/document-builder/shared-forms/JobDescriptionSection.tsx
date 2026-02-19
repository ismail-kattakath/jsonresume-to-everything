'use client'

import React, { useState, useContext } from 'react'
import { toast } from 'sonner'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { runAIGenerationPipeline, analyzeJobDescriptionGraph } from '@/lib/ai/strands/agent'
import { AILoadingToast } from '@/components/ui/AILoadingToast'
import { sanitizeAIError } from '@/lib/ai/api'
import type { ResumeData } from '@/types'

// Sub-components
import JobDescriptionInput from './ai-settings/JobDescriptionInput'
import AIPipelineButton from './ai-settings/AIPipelineButton'

const JobDescriptionSection = () => {
    const { resumeData, setResumeData } = useContext(ResumeContext)
    const {
        settings,
        updateSettings,
        isConfigured,
        isPipelineActive,
        setIsPipelineActive,
    } = useAISettings()

    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handleRefineJD = async () => {
        if (!isConfigured || !settings.jobDescription || settings.jobDescription.length < 50) {
            toast.error('Add more detail to your job description first (min 50 chars)')
            return
        }

        setIsAnalyzing(true)
        let toastId: string | number | undefined = toast(<AILoadingToast message="Refining job description..." />, { duration: Infinity })

        try {
            const refinedJD = await analyzeJobDescriptionGraph(
                settings.jobDescription,
                {
                    apiUrl: settings.apiUrl,
                    apiKey: settings.apiKey,
                    model: settings.model || 'gpt-4o-mini',
                    providerType: settings.providerType,
                },
                (chunk) => {
                    // Update toast with progress messages
                    if (chunk.content && !chunk.done) {
                        toast(<AILoadingToast message={chunk.content} />, { id: toastId, duration: Infinity })
                    }
                }
            )

            updateSettings({ jobDescription: refinedJD })
            toast.success('Job description refined successfully!', { id: toastId })
        } catch (error) {
            console.error('[JobDescriptionSection] Refinement error:', error)
            toast.error(`Refinement failed: ${sanitizeAIError(error)}`, { id: toastId })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleRunPipeline = async () => {
        if (!isConfigured || !settings.jobDescription) return

        console.log('[Pipeline] Starting pipeline...')
        setIsPipelineActive(true)
        let toastId: string | number | undefined = toast(<AILoadingToast message="Running AI optimization pipeline..." />, { duration: Infinity })

        try {
            console.log('[Pipeline] Calling runAIGenerationPipeline...')
            const result = await runAIGenerationPipeline(
                resumeData,
                settings.jobDescription,
                {
                    apiUrl: settings.apiUrl,
                    apiKey: settings.apiKey,
                    model: settings.model || 'gpt-4o-mini',
                    providerType: settings.providerType,
                },
                (progress) => {
                    // Update toast with current step
                    const message = `${progress.message} (${progress.currentStep}/${progress.totalSteps})`
                    toast(<AILoadingToast message={message} />, { id: toastId, duration: Infinity })

                    // Incremental updates for all results
                    const incrementalUpdate: Partial<ResumeData> = {}
                    let hasResumeUpdate = false

                    if (progress.summary) {
                        incrementalUpdate.summary = progress.summary
                        hasResumeUpdate = true
                    }
                    if (progress.workExperiences) {
                        incrementalUpdate.workExperience = progress.workExperiences
                        hasResumeUpdate = true
                    }

                    if (hasResumeUpdate) {
                        console.log('[Pipeline] Incremental update for resume data:', incrementalUpdate)
                        setResumeData(prev => ({ ...prev, ...incrementalUpdate }))
                    }

                    if (progress.refinedJD) {
                        console.log('[Pipeline] Refined JD available in progress! Updating immediately...')
                        updateSettings({ jobDescription: progress.refinedJD })
                    }
                }
            )

            console.log('[Pipeline] Pipeline completed. Result:', result)
            console.log('[Pipeline] Refined JD length:', result.refinedJD?.length)
            console.log('[Pipeline] Summary length:', result.summary?.length)
            console.log('[Pipeline] Work experiences count:', result.workExperiences?.length)

            // Update AI settings with refined JD
            if (result.refinedJD) {
                console.log('[Pipeline] Updating job description in settings...')
                console.log('[Pipeline] Refined JD preview:', result.refinedJD.substring(0, 100))
                updateSettings({ jobDescription: result.refinedJD })
                console.log('[Pipeline] updateSettings called. New settings.jobDescription length:', result.refinedJD.length)
            }

            // Update resume with results
            const updatedData = {
                ...resumeData,
                summary: result.summary,
                workExperience: result.workExperiences,
            }
            console.log('[Pipeline] Updating resume data...', updatedData)
            setResumeData(updatedData)
            console.log('[Pipeline] Resume data updated successfully')

            toast.success('Resume optimized successfully!', { id: toastId })
        } catch (error) {
            console.error('[JobDescriptionSection] Pipeline error:', error)
            toast.error(`Optimization failed: ${sanitizeAIError(error)}`, { id: toastId })
        } finally {
            setIsPipelineActive(false)
        }
    }

    return (
        <div className="space-y-4">
            <JobDescriptionInput
                value={settings.jobDescription}
                onChange={(val) => updateSettings({ jobDescription: val })}
                onRefine={handleRefineJD}
                isAnalyzing={isAnalyzing}
                isConfigured={isConfigured}
                disabled={isAnalyzing || isPipelineActive}
            />

            <AIPipelineButton
                onRun={handleRunPipeline}
                disabled={!isConfigured || !settings.jobDescription || isPipelineActive || isAnalyzing}
                isLoading={isPipelineActive}
            />
        </div>
    )
}

export default JobDescriptionSection
