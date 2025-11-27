'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { useAISettings } from '@/lib/contexts/AISettingsContext'

const AISettings: React.FC = () => {
  const { settings, updateSettings, isConfigured } = useAISettings()
  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <div className="space-y-5">
      {/* Status indicator */}
      <div
        className={`flex items-center gap-2 rounded-lg border p-3 ${
          isConfigured
            ? 'border-green-500/20 bg-green-500/10'
            : 'border-amber-500/20 bg-amber-500/10'
        }`}
      >
        {isConfigured ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-300">
              Ready to generate AI content
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-amber-300">
              Configure settings below to enable AI generation
            </span>
          </>
        )}
      </div>

      {/* API URL */}
      <div className="space-y-2">
        <label
          htmlFor="ai-api-url"
          className="flex items-center gap-2 text-sm font-medium text-white"
        >
          API URL
          <span className="text-xs font-normal text-white/50">
            (OpenAI or compatible)
          </span>
        </label>
        <input
          id="ai-api-url"
          type="text"
          value={settings.apiUrl}
          onChange={(e) => updateSettings({ apiUrl: e.target.value })}
          placeholder="https://api.openai.com"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white transition-all outline-none placeholder:text-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <label
          htmlFor="ai-api-key"
          className="flex items-center gap-2 text-sm font-medium text-white"
        >
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
            id="ai-api-key"
            type={showApiKey ? 'text' : 'password'}
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
            placeholder="sk-proj-..."
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 pr-12 text-sm text-white transition-all outline-none placeholder:text-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
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

      {/* Job Description */}
      <div className="space-y-2">
        <label
          htmlFor="ai-job-description"
          className="flex items-center gap-2 text-sm font-medium text-white"
        >
          Job Description
          {settings.jobDescription && (
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
              {settings.jobDescription.length} characters
            </span>
          )}
        </label>
        <textarea
          id="ai-job-description"
          value={settings.jobDescription}
          onChange={(e) => updateSettings({ jobDescription: e.target.value })}
          placeholder="Paste the job posting here...

Include:
- Job title and requirements
- Responsibilities and qualifications
- Company info and benefits
- Any specific skills needed"
          rows={8}
          className="min-h-[160px] w-full resize-y rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
      </div>
    </div>
  )
}

export default AISettings
