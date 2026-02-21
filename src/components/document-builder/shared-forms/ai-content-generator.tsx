'use client'

import React, { useState, useContext } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import AIActionButton from '@/components/ui/ai-action-button'
import { toast } from 'sonner'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { ResumeContext } from '@/lib/contexts/document-context'
import { generateCoverLetterGraph, generateSummaryGraph, tailorExperienceToJDGraph } from '@/lib/ai/strands/agent'
import { AIAPIError, sanitizeAIError } from '@/lib/ai/api'
import { fetchAvailableModels } from '@/lib/ai/models'
import { analytics } from '@/lib/analytics'
import { AILoadingToast } from '@/components/ui/ai-loading-toast'
import { FormTextarea } from '@/components/ui/form-textarea'
import { FormVariant } from '@/lib/utils/form-variants'

interface AIContentGeneratorProps {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement> | string) => void
  onGenerated: (value: string) => void
  placeholder?: string
  name: string
  rows?: number
  minHeight?: string
  maxLength?: number
  showCharacterCount?: boolean
  className?: string
  mode: 'coverLetter' | 'summary' | 'workExperience'
  disabled?: boolean
  experienceData?: {
    organization: string
    position: string
    achievements: string[]
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
  const { settings, isConfigured } = useAISettings()
  const { resumeData } = useContext(ResumeContext)
  const [isGenerating, setIsGenerating] = useState(false)

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
  }

  const currentConfig = {
    ...config[mode],
    label: label || config[mode].label,
  }

  // Helper to update textarea value
  const updateValue = (newValue: string) => {
    if (onGenerated) {
      onGenerated(newValue)
    } else {
      onChange(newValue)
    }
  }

  /* istanbul ignore next */
  const handleGenerate = async () => {
    // ... exactly the same generate logic ...
    if (!isConfigured) {
      console.log(`[DEBUG] NOT CONFIGURED`)
      toast.error('AI not configured', {
        description: 'Please fill in the API settings and job description in the Generative AI Settings section above.',
      })
      return
    }

    setIsGenerating(true)
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
    }
  }

  return (
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
      isAIConfigured={isConfigured}
      aiButtonTitle="Generate by JD"
      aiShowLabel={false}
      aiVariant="amber"
    />
  )
}

export default AIContentGenerator
