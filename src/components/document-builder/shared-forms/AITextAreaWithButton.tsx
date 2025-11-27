'use client'

import React, { useState, useContext } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  generateCoverLetter,
  generateSummary,
  OpenAIAPIError,
} from '@/lib/ai/openai-client'

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
      generateFunction: generateSummary,
    },
    coverLetter: {
      label: 'Cover Letter',
      successMessage: 'Cover letter generated successfully!',
      successDescription: 'The AI has crafted your personalized cover letter.',
      errorMessage: 'Failed to generate cover letter',
      generateFunction: generateCoverLetter,
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

  const handleGenerate = async () => {
    if (!isConfigured) {
      toast.error('AI not configured', {
        description:
          'Please fill in the API settings and job description in the Generative AI Settings section above.',
      })
      return
    }

    setIsGenerating(true)
    let streamedContent = ''

    try {
      const content = await currentConfig.generateFunction(
        {
          baseURL: settings.apiUrl,
          apiKey: settings.apiKey,
          model: settings.model,
        },
        resumeData,
        settings.jobDescription,
        (chunk) => {
          if (chunk.content) {
            streamedContent += chunk.content
            updateValue(streamedContent)
          }
        }
      )

      // Final update with complete content
      updateValue(content)

      toast.success(currentConfig.successMessage, {
        description: currentConfig.successDescription,
      })
    } catch (err) {
      console.error(`${currentConfig.label} generation error:`, err)

      let errorMessage = currentConfig.errorMessage

      if (err instanceof OpenAIAPIError) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      toast.error('Generation failed', {
        description: errorMessage,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <textarea
        placeholder={placeholder}
        name={name}
        rows={rows}
        className="block w-full resize-y rounded-lg border border-white/20 bg-white/10 px-4 py-3 pr-12 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
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

      {/* Floating AI button - bottom right */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || !isConfigured}
        title={
          isConfigured ? 'Generate with AI' : 'Configure AI settings first'
        }
        className={`absolute right-6 bottom-3 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
          isGenerating
            ? 'cursor-not-allowed bg-amber-500/80'
            : isConfigured
              ? 'cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-110 hover:shadow-xl'
              : 'cursor-not-allowed bg-gray-500/50'
        }`}
      >
        {isGenerating ? (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        ) : (
          <Sparkles
            className={`h-5 w-5 ${isConfigured ? 'text-white' : 'text-white/50'}`}
          />
        )}
      </button>
    </div>
  )
}

export default AITextAreaWithButton
