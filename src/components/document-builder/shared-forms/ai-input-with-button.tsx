'use client'

import React, { useState, useContext } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import AIActionButton from '@/components/ui/ai-action-button'
import { toast } from 'sonner'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { ResumeContext } from '@/lib/contexts/document-context'
import { generateJobTitleGraph } from '@/lib/ai/strands/agent'
import { analytics } from '@/lib/analytics'
import { FormInput } from '@/components/ui/form-input'
import { AILoadingToast } from '@/components/ui/ai-loading-toast'
import { sanitizeAIError } from '@/lib/ai/api'

interface AIInputWithButtonProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onGenerated?: (content: string) => void
  placeholder: string
  name: string
  className?: string
  label?: string
}

const AIInputWithButton: React.FC<AIInputWithButtonProps> = ({
  value,
  onChange,
  onGenerated,
  placeholder,
  name,
  className = '',
  label = 'Job Title',
}) => {
  const { settings, isConfigured } = useAISettings()
  const { resumeData } = useContext(ResumeContext)
  const [isGenerating, setIsGenerating] = useState(false)

  // Helper to update input value
  const updateValue = (newValue: string) => {
    if (onGenerated) {
      onGenerated(newValue)
    } else {
      const syntheticEvent = {
        target: { value: newValue, name },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
  }

  /* istanbul ignore next */
  const handleGenerate = async () => {
    if (!isConfigured) {
      toast.error('AI not configured', {
        description: 'Please fill in the API settings and job description in the Generative AI Settings section above.',
      })
      return
    }

    setIsGenerating(true)
    const startTime = Date.now()
    let toastId: string | number | undefined

    // Track generation start
    analytics.aiGenerationStart(settings.providerType, settings.model)

    try {
      const content = await generateJobTitleGraph(
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
            // Filter out internal critique messages
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

      // Final update with complete content (already cleaned by graph)
      updateValue(content)

      // Track generation success
      const responseTimeMs = Date.now() - startTime
      analytics.aiGenerationSuccess(settings.providerType, settings.model, responseTimeMs)

      toast.success('Job title generated successfully!', {
        description: 'The AI has crafted your tailored job title.',
      })
    } catch (err) {
      /* istanbul ignore next */
      console.error('Job title generation error:', err)

      /* istanbul ignore next */
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate job title'
      const errorType = err instanceof Error ? err.name : 'unknown'

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
    <div className={`relative ${className}`}>
      <FormInput
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={isGenerating}
        variant="amber"
      />
      <div className="absolute top-1/2 right-2 -translate-y-1/2">
        <AIActionButton
          isLoading={isGenerating}
          onClick={handleGenerate}
          label={isGenerating ? 'Generating...' : 'Generate by JD'}
          showLabel={false}
          isConfigured={isConfigured}
          variant="amber"
          size="sm"
        />
      </div>
    </div>
  )
}

export default AIInputWithButton
