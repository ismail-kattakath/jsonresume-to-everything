'use client'

import React, { useState, useEffect, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { generateCoverLetterGraph, generateSummaryGraph } from '@/lib/ai/strands/agent'
import { saveCredentials, loadCredentials } from '@/lib/ai/storage'
import { AIAPIError, sanitizeAIError } from '@/lib/ai/api'
import { getProviderByURL } from '@/lib/ai/providers'
import AIActionButton from '@/components/ui/AIActionButton'
import type { ResumeData } from '@/types'

interface AIGenerateModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (content: string) => void
  resumeData: ResumeData
  mode: 'coverLetter' | 'summary'
}

const DEFAULT_API_URL = 'https://api.openai.com'
const DEFAULT_MODEL = 'gpt-4o-mini'

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({ isOpen, onClose, onGenerate, resumeData, mode }) => {
  // Form state
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [apiKey, setApiKey] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [rememberCredentials, setRememberCredentials] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamedContent, setStreamedContent] = useState('')
  const streamContainerRef = useRef<HTMLDivElement>(null)

  // Mode-specific configuration
  const config = {
    coverLetter: {
      title: '🤖 AI Cover Letter Generator',
      label: 'Cover Letter',
      successMessage: 'Cover letter generated successfully!',
      successDescription: 'The AI has crafted your personalized cover letter.',
      errorMessage: 'Failed to generate cover letter',
      streamingMessage: 'AI is crafting your cover letter...',
      generateFunction: generateCoverLetterGraph,
    },
    summary: {
      title: '🤖 AI Professional Summary Generator',
      label: 'Professional Summary',
      successMessage: 'Professional summary generated successfully!',
      successDescription: 'The AI has crafted your tailored professional summary.',
      errorMessage: 'Failed to generate professional summary',
      streamingMessage: 'AI is crafting your professional summary...',
      generateFunction: generateSummaryGraph,
    },
  }

  const currentConfig = config[mode]

  // Load saved credentials and job description on mount
  useEffect(() => {
    const loadSavedData = async () => {
      if (isOpen) {
        const saved = await loadCredentials()
        if (saved) {
          if (saved.rememberCredentials) {
            setApiUrl(saved.apiUrl)
            setApiKey(saved.apiKey)
            setRememberCredentials(true)
          }
          // Always load last job description if available
          if (saved.lastJobDescription) {
            setJobDescription(saved.lastJobDescription)
          }
        }
      }
    }

    loadSavedData()
  }, [isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setJobDescription('')
      setError(null)
      setIsGenerating(false)
      setStreamedContent('')
    }
  }, [isOpen])

  // Auto-scroll to bottom when streaming content updates
  useEffect(() => {
    if (streamContainerRef.current) {
      streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight
    }
  }, [streamedContent])

  // Validate form
  const isFormValid = apiUrl.trim() !== '' && apiKey.trim() !== '' && jobDescription.trim() !== ''

  // Handle form submission
  const handleGenerate = async () => {
    if (!isFormValid) {
      setError('Please fill in all fields')
      return
    }

    setIsGenerating(true)
    setError(null)
    setStreamedContent('')

    try {
      // Save credentials and job description
      saveCredentials({
        apiUrl,
        apiKey,
        rememberCredentials,
        lastJobDescription: jobDescription,
      })

      // Generate content with streaming
      const provider = getProviderByURL(apiUrl)
      const providerType = provider?.providerType || 'openai-compatible'

      const content = await currentConfig.generateFunction(
        resumeData,
        jobDescription,
        {
          apiUrl,
          apiKey,
          model: DEFAULT_MODEL,
          providerType,
        },
        (chunk) => {
          // Update streamed content in real-time
          if (chunk.content) {
            setStreamedContent((prev) => prev + chunk.content)
          }
        }
      )

      // Success!
      toast.success(currentConfig.successMessage, {
        description: currentConfig.successDescription,
      })

      onGenerate(content)
      onClose()
    } catch (err) {
      console.error(`${currentConfig.label} generation error:`, err)

      let errorMessage = currentConfig.errorMessage

      if (err instanceof AIAPIError) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(sanitizeAIError(err))
      toast.error('Generation failed', {
        description: sanitizeAIError(err),
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle Enter key in textarea (Ctrl/Cmd+Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && isFormValid) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={currentConfig.title} maxWidth="lg">
      <div className="space-y-5">
        {/* Collapsible API Settings */}
        <details className="group" open={!apiKey}>
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-white/80">🔑 API Configuration</div>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">Required</span>
                {apiKey && rememberCredentials && (
                  <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">Saved</span>
                )}
              </div>
              <svg
                className="h-5 w-5 text-white/60 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>

          <div className="mt-4 space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
            {/* API URL */}
            <div className="space-y-2">
              <label htmlFor="api-url" className="flex items-center gap-2 text-sm font-medium text-white">
                API URL
                <span className="text-xs font-normal text-white/50">(OpenAI or compatible)</span>
              </label>
              <input
                id="api-url"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.openai.com"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white transition-all outline-none placeholder:text-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                disabled={isGenerating}
              />
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label htmlFor="api-key" className="flex items-center gap-2 text-sm font-medium text-white">
                API Key
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 underline hover:text-blue-300"
                >
                  Get key
                </a>
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 pr-12 text-sm text-white transition-all outline-none placeholder:text-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  disabled={isGenerating}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-white/60 transition-colors hover:text-white"
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember credentials checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <input
                id="remember-credentials"
                type="checkbox"
                checked={rememberCredentials}
                onChange={(e) => setRememberCredentials(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400/20"
                disabled={isGenerating}
              />
              <label htmlFor="remember-credentials" className="cursor-pointer text-sm leading-snug text-white/80">
                Remember my API credentials
                <span className="mt-0.5 block text-xs text-white/50">
                  Stored securely in your browser. Job description always saved separately.
                </span>
              </label>
            </div>
          </div>
        </details>

        {/* Collapsible Job Description */}
        <details className="group" open={!jobDescription}>
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-white/80">📄 Job Description</div>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">Required</span>
                {jobDescription && (
                  <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
                    {jobDescription.length} characters
                  </span>
                )}
              </div>
              <svg
                className="h-5 w-5 text-white/60 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>

          <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
            <label htmlFor="job-description" className="block text-sm font-medium text-white">
              Job Description
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste the job posting here...

✓ Job title and requirements
✓ Responsibilities and qualifications
✓ Company info and benefits
✓ Any specific skills or experience needed"
              rows={12}
              className="min-h-[240px] w-full resize-y rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              disabled={isGenerating}
            />
          </div>
        </details>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Error</p>
              <p className="mt-1 text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Streaming content display - Fixed height above button */}
        {isGenerating && (
          <div>
            <div
              ref={streamContainerRef}
              className="h-32 overflow-y-auto scroll-smooth rounded-lg border border-white/10 bg-white/5 p-3"
            >
              {streamedContent ? (
                <>
                  <p className="text-[10px] leading-relaxed whitespace-pre-wrap text-white/80">{streamedContent}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-400">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    <span>Generating...</span>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Waiting for response...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate button */}
        <div className="space-y-3 pt-2">
          <AIActionButton
            isConfigured={isFormValid}
            isLoading={isGenerating}
            onClick={handleGenerate}
            label={`Generate ${currentConfig.label}`}
            size="lg"
            fullWidth
            variant="amber"
          />

          {/* Helper text */}
          {!isGenerating && !isFormValid && (
            <p className="text-center text-xs text-white/50">
              {!apiKey
                ? '⚠️ API key required'
                : !jobDescription
                  ? '⚠️ Job description required'
                  : 'Fill all fields to continue'}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AIGenerateModal
