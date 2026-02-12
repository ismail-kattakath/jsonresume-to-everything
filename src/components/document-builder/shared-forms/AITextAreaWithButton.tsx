'use client'

import React, { useState, useContext } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import AISortButton from '@/components/ui/AISortButton'
import { toast } from 'sonner'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  generateCoverLetterGraph,
  generateSummaryGraph,
} from '@/lib/ai/strands/agent'
import { OpenAIAPIError } from '@/lib/ai/openai-client'
import { analytics } from '@/lib/analytics'
import { AILoadingToast } from '@/components/ui/AILoadingToast'

interface AITextAreaWithButtonProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onGenerated?: (content: string) => void
  placeholder: string
  name: string
  rows?: number
  minHeight?: string
  maxLength?: number
  showCharacterCount?: boolean
  className?: string
  mode: 'summary' | 'coverLetter'
}

const AITextAreaWithButton: React.FC<AITextAreaWithButtonProps> = ({
  value,
  onChange,
  onGenerated,
  placeholder,
  name,
  rows = 18,
  minHeight = '300px',
  maxLength,
  showCharacterCount = true,
  className = '',
  mode,
}) => {
  const { settings, isConfigured } = useAISettings()
  const { resumeData } = useContext(ResumeContext)
  const [isGenerating, setIsGenerating] = useState(false)

  const characterCount = value?.length || 0
  const maxLengthDisplay = maxLength ? `/${maxLength}` : ''

  const config = {
    summary: {
      label: 'Professional Summary',
      successMessage: 'Professional summary generated successfully!',
      successDescription:
        'The AI has crafted your tailored professional summary.',
      errorMessage: 'Failed to generate professional summary',
    },
    coverLetter: {
      label: 'Cover Letter',
      successMessage: 'Cover letter generated successfully!',
      successDescription: 'The AI has crafted your personalized cover letter.',
      errorMessage: 'Failed to generate cover letter',
    },
  }

  const currentConfig = config[mode]

  // Helper to update textarea value
  const updateValue = (newValue: string) => {
    if (onGenerated) {
      onGenerated(newValue)
    } else {
      const syntheticEvent = {
        target: { value: newValue, name },
      } as React.ChangeEvent<HTMLTextAreaElement>
      onChange(syntheticEvent)
    }
  }

  /* istanbul ignore next */
  const handleGenerate = async () => {
    process.stderr.write(`[DEBUG] handleGenerate ENTERED - isConfigured: ${isConfigured}, mode: ${mode}\n`)
    if (!isConfigured) {
      process.stderr.write(`[DEBUG] NOT CONFIGURED\n`)
      toast.error('AI not configured', {
        description:
          'Please fill in the API settings and job description in the Generative AI Settings section above.',
      })
      return
    }

    setIsGenerating(true)
    let streamedContent = ''
    const startTime = Date.now()
    let toastId: string | number | undefined

    // Track generation start
    // analytics.aiGenerationStart(settings.providerType, settings.model)

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
              const isCritique = chunk.content.includes('CRITIQUE:') ||
                chunk.content.includes('❌') ||
                chunk.content.startsWith('**CRITIQUE:**')

              if (!isCritique) {
                if (!toastId) {
                  toastId = toast(<AILoadingToast message={chunk.content} />, { duration: Infinity })
                } else {
                  toast(<AILoadingToast message={chunk.content} />, { id: toastId, duration: Infinity })
                }
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
              if (!toastId) {
                toastId = toast(<AILoadingToast message={chunk.content} />, { duration: Infinity })
              } else {
                toast(<AILoadingToast message={chunk.content} />, { id: toastId, duration: Infinity })
              }
            }
          }
        )
        if (toastId) toast.dismiss(toastId)
      }

      // Strip markdown formatting from the final content
      const cleanContent = content
        .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold **text**
        .replace(/\*(.+?)\*/g, '$1')      // Remove italic *text*
        .replace(/_(.+?)_/g, '$1')        // Remove italic _text_
        .replace(/~~(.+?)~~/g, '$1')      // Remove strikethrough ~~text~~
        .replace(/`(.+?)`/g, '$1')        // Remove inline code `text`
        .trim()

      // Final update with complete content
      updateValue(cleanContent)

      // Track generation success
      const responseTimeMs = Date.now() - startTime
      analytics.aiGenerationSuccess(
        settings.providerType,
        settings.model,
        responseTimeMs
      )

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
      if (err instanceof OpenAIAPIError) {
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
        description: errorMessage,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Textarea with character count and AI button */}
      <div className="relative">
        <textarea
          placeholder={placeholder}
          name={name}
          rows={rows}
          className="block w-full resize-y rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          style={{ minHeight }}
          disabled={isGenerating}
        />

        {/* Character count - top right */}
        {showCharacterCount && (
          <div className="pointer-events-none absolute top-3 right-3 rounded-lg bg-white/5 px-3 py-1 text-xs text-white/50">
            {characterCount}
            {maxLengthDisplay}
          </div>
        )}

        {/* Generate by JD button - absolute bottom right */}
        <div className="absolute right-3 bottom-3">
          <AISortButton
            isConfigured={isConfigured}
            isLoading={isGenerating}
            onClick={handleGenerate}
            label="Generate by JD"
            disabledTooltip="Configure AI settings first"
            size="sm"
            variant="primary"
          />
        </div>
      </div>
    </div>
  )
}

export default AITextAreaWithButton
