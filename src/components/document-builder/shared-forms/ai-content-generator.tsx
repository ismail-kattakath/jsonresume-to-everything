'use client'

import React, { useState, useContext } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import AIActionButton from '@/components/ui/ai-action-button'
import { toast } from 'sonner'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { ResumeContext } from '@/lib/contexts/document-context'
import {
  generateCoverLetterGraph,
  generateSummaryGraph,
  tailorExperienceToJDGraph,
  analyzeJobDescriptionGraph,
  extractSkillsGraph,
} from '@/lib/ai/strands/agent'
import { AIAPIError, sanitizeAIError } from '@/lib/ai/api'
import { fetchAvailableModels } from '@/lib/ai/models'
import { analytics } from '@/lib/analytics'
import { AILoadingToast } from '@/components/ui/ai-loading-toast'
import { FormTextarea } from '@/components/ui/form-textarea'
import { FormVariant } from '@/lib/utils/form-variants'
import { OnDeviceGenerator } from '@/components/document-builder/shared-forms/on-device-generator'
import {
  buildOnDeviceCoverLetterPrompt,
  buildOnDeviceSummaryPrompt,
  buildOnDeviceWorkExperiencePrompt,
  buildOnDeviceRefineJDPrompt,
  buildOnDeviceExtractSkillsPrompt,
} from '@/lib/ai/on-device/prompts'

interface AIContentGeneratorProps {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement> | string) => void
  onGenerated: (value: string, achievements?: string[], techStack?: string[]) => void
  placeholder?: string
  name: string
  rows?: number
  minHeight?: string
  maxLength?: number
  showCharacterCount?: boolean
  className?: string
  mode: 'coverLetter' | 'summary' | 'workExperience' | 'jobDescription' | 'skillsToHighlight'
  disabled?: boolean
  experienceData?: {
    organization: string
    position: string
    achievements: string[]
    technologies?: string[]
  }
  variant?: FormVariant
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  label,
  value,
  onChange,
  onGenerated,
  placeholder,
  name,
  rows = 18,
  minHeight = '300px',
  maxLength,
  showCharacterCount = false,
  className = '',
  mode,
  disabled = false,
  experienceData,
  variant = 'amber',
}) => {
  const { settings, isConfigured, setIsAnyAIActionActive } = useAISettings()
  const { resumeData } = useContext(ResumeContext)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showOnDevicePanel, setShowOnDevicePanel] = useState(false)

  const isOnDevice = settings.providerType === 'on-device'

  const config = {
    summary: {
      label: 'Professional Summary',
      successMessage: 'Professional summary generated successfully!',
      successDescription: 'The AI has crafted your tailored professional summary.',
      errorMessage: 'Failed to generate professional summary',
    },
    coverLetter: {
      label: 'Cover Letter',
      successMessage: 'Cover letter generated successfully!',
      successDescription: 'The AI has crafted your personalized cover letter.',
      errorMessage: 'Failed to generate cover letter',
    },
    workExperience: {
      label: 'Description',
      successMessage: 'Experience description tailored successfully!',
      successDescription: 'The AI has optimized your experience for the job requirements.',
      errorMessage: 'Failed to tailor experience',
    },
    jobDescription: {
      label: 'Job Description',
      successMessage: 'Job description refined successfully!',
      successDescription: 'The AI has structured and polished the job description.',
      errorMessage: 'Failed to refine job description',
    },
    skillsToHighlight: {
      label: 'Skills to highlight',
      successMessage: 'Skills extracted successfully!',
      successDescription: 'The AI has identified the most relevant skills from the JD.',
      errorMessage: 'Failed to extract skills',
    },
  }

  const currentConfig = {
    ...config[mode],
    label: label || config[mode].label,
  }

  // Helper to update textarea value
  const updateValue = (newValue: string, achievements?: string[], techStack?: string[]) => {
    if (onGenerated) {
      onGenerated(newValue, achievements, techStack)
    } else {
      onChange(newValue)
    }
  }

  /* istanbul ignore next */
  const handleGenerate = async () => {
    // On-device path: show the on-device generator panel
    if (isOnDevice) {
      setShowOnDevicePanel(true)
      return
    }

    // ... exactly the same generate logic ...
    if (!isConfigured) {
      console.log(`[DEBUG] NOT CONFIGURED`)
      toast.error('AI not configured', {
        description: 'Please fill in the API settings and job description in the Generative AI Settings section above.',
      })
      return
    }

    setIsGenerating(true)
    setIsAnyAIActionActive(true)
    const streamedContent = ''
    const startTime = Date.now()
    let toastId: string | number | undefined

    try {
      // Use Strands Graph for Summary if mode is summary
      let content: string

      if (mode === 'summary') {
        content = await generateSummaryGraph(
          resumeData,
          settings.jobDescription,
          {
            apiUrl: settings.apiUrl,
            apiKey: settings.apiKey,
            model: settings.model,
            providerType: settings.providerType,
          },
          (chunk) => {
            if (chunk.content) {
              // Filter out internal critique messages from Reviewer agent
              const isCritique =
                chunk.content.includes('CRITIQUE:') ||
                chunk.content.includes('❌') ||
                chunk.content.startsWith('**CRITIQUE:**')

              if (!isCritique) {
                const cleanMessage = chunk.content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()
                if (!toastId) {
                  toastId = toast(<AILoadingToast message={cleanMessage} />, {
                    duration: Infinity,
                  })
                } else {
                  toast(<AILoadingToast message={cleanMessage} />, {
                    id: toastId,
                    duration: Infinity,
                  })
                }
              }
            }
          }
        )
        if (toastId) toast.dismiss(toastId)
      } else if (mode === 'workExperience') {
        const result = await tailorExperienceToJDGraph(
          value,
          experienceData?.achievements || [],
          experienceData?.position || '',
          experienceData?.organization || '',
          settings.jobDescription,
          experienceData?.technologies || [],
          {
            apiUrl: settings.apiUrl,
            apiKey: settings.apiKey,
            model: settings.model,
            providerType: settings.providerType,
          },
          (chunk) => {
            if (chunk.content) {
              const isCritique =
                chunk.content.includes('CRITIQUE:') ||
                chunk.content.includes('❌') ||
                chunk.content.startsWith('**CRITIQUE:**')

              if (!isCritique) {
                const cleanMessage = chunk.content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()
                if (!toastId) {
                  toastId = toast(<AILoadingToast message={cleanMessage} />, {
                    duration: Infinity,
                  })
                } else {
                  toast(<AILoadingToast message={cleanMessage} />, {
                    id: toastId,
                    duration: Infinity,
                  })
                }
              }
            }
          }
        )
        content = result.description
        const achievements = result.achievements
        const techStack = result.techStack
        if (toastId) toast.dismiss(toastId)

        // Special handling for workExperience to update achievements too
        const cleanContent = content
          .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold **text**
          .replace(/\*(.+?)\*/g, '$1') // Remove italic *text*
          .replace(/_(.+?)_/g, '$1') // Remove italic _text_
          .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough ~~text~~
          .replace(/`(.+?)`/g, '$1') // Remove inline code `text`
          .trim()

        updateValue(cleanContent, achievements, techStack)

        // Track generation success
        const responseTimeMs = Date.now() - startTime
        analytics.aiGenerationSuccess(settings.providerType, settings.model, responseTimeMs)

        toast.success(currentConfig.successMessage, {
          description: currentConfig.successDescription,
        })
        setIsGenerating(false)
        return
      } else if (mode === 'jobDescription') {
        content = await analyzeJobDescriptionGraph(
          settings.jobDescription,
          {
            apiUrl: settings.apiUrl,
            apiKey: settings.apiKey,
            model: settings.model || 'gpt-4o-mini',
            providerType: settings.providerType,
          },
          (chunk) => {
            if (chunk.content && !chunk.done) {
              if (!toastId) {
                toastId = toast(<AILoadingToast message={chunk.content} />, {
                  duration: Infinity,
                })
              } else {
                toast(<AILoadingToast message={chunk.content} />, {
                  id: toastId,
                  duration: Infinity,
                })
              }
            }
          }
        )
        if (toastId) toast.dismiss(toastId)
      } else if (mode === 'skillsToHighlight') {
        content = await extractSkillsGraph(
          settings.jobDescription,
          {
            apiUrl: settings.apiUrl,
            apiKey: settings.apiKey,
            model: settings.model,
            providerType: settings.providerType,
          },
          (chunk) => {
            if (chunk.content) {
              if (!toastId) {
                toastId = toast(<AILoadingToast message={chunk.content} />, {
                  duration: Infinity,
                })
              } else {
                toast(<AILoadingToast message={chunk.content} />, {
                  id: toastId,
                  duration: Infinity,
                })
              }
            }
          }
        )
        if (toastId) toast.dismiss(toastId)
      } else {
        content = await generateCoverLetterGraph(
          resumeData,
          settings.jobDescription,
          {
            apiUrl: settings.apiUrl,
            apiKey: settings.apiKey,
            model: settings.model,
            providerType: settings.providerType,
          },
          (chunk) => {
            if (chunk.content) {
              const cleanMessage = chunk.content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()
              if (!toastId) {
                toastId = toast(<AILoadingToast message={cleanMessage} />, {
                  duration: Infinity,
                })
              } else {
                toast(<AILoadingToast message={cleanMessage} />, {
                  id: toastId,
                  duration: Infinity,
                })
              }
            }
          }
        )
        if (toastId) toast.dismiss(toastId)
      }

      // Strip markdown formatting from the final content
      const cleanContent = content
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold **text**
        .replace(/\*(.+?)\*/g, '$1') // Remove italic *text*
        .replace(/_(.+?)_/g, '$1') // Remove italic _text_
        .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough ~~text~~
        .replace(/`(.+?)`/g, '$1') // Remove inline code `text`
        .trim()

      // Final update with complete content
      updateValue(cleanContent)

      // Track generation success
      const responseTimeMs = Date.now() - startTime
      analytics.aiGenerationSuccess(settings.providerType, settings.model, responseTimeMs)

      toast.success(currentConfig.successMessage, {
        description: currentConfig.successDescription,
      })
    } catch (err) {
      /* istanbul ignore next */
      console.error(`${currentConfig.label} generation error:`, err)

      /* istanbul ignore next */
      let errorMessage = currentConfig.errorMessage
      let errorType = 'unknown'

      /* istanbul ignore next */
      if (err instanceof AIAPIError) {
        errorMessage = err.message
        errorType = err.constructor.name
      } else if (err instanceof Error) {
        errorMessage = err.message
        errorType = err.name
      }

      /* istanbul ignore next */
      // Track generation error
      analytics.aiGenerationError(settings.providerType, errorType)

      /* istanbul ignore next */
      toast.error('Generation failed', {
        description: sanitizeAIError(err),
      })
    } finally {
      setIsGenerating(false)
      setIsAnyAIActionActive(false)
    }
  }

  // Build on-device prompt for the current mode
  const buildOnDevicePrompt = (): string => {
    if (mode === 'coverLetter') {
      return buildOnDeviceCoverLetterPrompt(resumeData, settings.jobDescription)
    } else if (mode === 'workExperience') {
      return buildOnDeviceWorkExperiencePrompt(
        value,
        experienceData?.position || '',
        experienceData?.organization || '',
        experienceData?.achievements || [],
        settings.jobDescription
      )
    } else if (mode === 'jobDescription') {
      return buildOnDeviceRefineJDPrompt(settings.jobDescription)
    } else if (mode === 'skillsToHighlight') {
      return buildOnDeviceExtractSkillsPrompt(settings.jobDescription)
    }
    return buildOnDeviceSummaryPrompt(resumeData, settings.jobDescription)
  }

  return (
    <div className="flex flex-col gap-2">
      <FormTextarea
        label={currentConfig.label}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e)} // onChange expects event
        maxLength={maxLength}
        showCounter={showCharacterCount}
        minHeight={minHeight}
        rows={rows}
        className={className}
        disabled={isGenerating || disabled}
        variant={variant}
        onAIAction={handleGenerate}
        isAILoading={isGenerating}
        isAIConfigured={isConfigured || isOnDevice}
        aiButtonTitle={isOnDevice && mode === 'summary' ? '🔒 On-Device AI' : 'Generate by JD'}
      />
      {showOnDevicePanel && isOnDevice && (
        <OnDeviceGenerator
          prompt={buildOnDevicePrompt()}
          onComplete={(text) => {
            updateValue(text)
            setShowOnDevicePanel(false)
          }}
          onDismiss={() => setShowOnDevicePanel(false)}
        />
      )}
    </div>
  )
}

export default AIContentGenerator
