'use client'

import React, { useState, useRef, useEffect, useContext } from 'react'
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
  const [streamedContent, setStreamedContent] = useState('')
  const streamContainerRef = useRef<HTMLDivElement>(null)

  const characterCount = value?.length || 0
  const maxLengthDisplay = maxLength ? `/${maxLength}` : ''

  // Auto-scroll streaming content
  useEffect(() => {
    if (streamContainerRef.current) {
      streamContainerRef.current.scrollTop =
        streamContainerRef.current.scrollHeight
    }
  }, [streamedContent])

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

  const handleGenerate = async () => {
    if (!isConfigured) {
      toast.error('AI not configured', {
        description:
          'Please fill in the API settings and job description in the Generative AI Settings section above.',
      })
      return
    }

    setIsGenerating(true)
    setStreamedContent('')

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
            setStreamedContent((prev) => prev + chunk.content)
          }
        }
      )

      toast.success(currentConfig.successMessage, {
        description: currentConfig.successDescription,
      })

      // Update the textarea value
      if (onGenerated) {
        onGenerated(content)
      } else {
        // Create a synthetic event to update via onChange
        const syntheticEvent = {
          target: { value: content, name },
        } as React.ChangeEvent<HTMLTextAreaElement>
        onChange(syntheticEvent)
      }
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
      setStreamedContent('')
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Streaming preview */}
      {isGenerating && streamedContent && (
        <div
          ref={streamContainerRef}
          className="mb-2 max-h-32 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-white/80">
            {streamedContent}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Generating...</span>
          </div>
        </div>
      )}

      <div className="relative">
        <textarea
          placeholder={placeholder}
          name={name}
          rows={rows}
          className={`block w-full resize-y rounded-t-lg rounded-b-none border border-b-0 border-white/20 bg-white/10 px-4 py-3 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20`}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          style={{ minHeight }}
          disabled={isGenerating}
        />
        {showCharacterCount && (
          <div className="pointer-events-none absolute top-3 right-3 rounded-lg bg-white/5 px-3 py-1 text-xs text-white/50">
            {characterCount}
            {maxLengthDisplay}
          </div>
        )}
      </div>

      {/* Generate with AI Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`group flex w-full cursor-pointer items-center justify-center gap-3 rounded-t-none rounded-b-lg border border-t-0 border-white/20 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 ${
          isGenerating
            ? 'cursor-not-allowed bg-gray-600 opacity-70'
            : isConfigured
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl'
              : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span>Generate with AI</span>
            {!isConfigured && (
              <span className="text-xs opacity-70">(Configure AI first)</span>
            )}
          </>
        )}
      </button>
    </div>
  )
}

export default AITextAreaWithButton
