'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { useAISettings } from '@/lib/contexts/AISettingsContext'

const AISettings: React.FC = () => {
  const { settings, updateSettings, isConfigured } = useAISettings()
  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <div className="flex flex-col gap-4">
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

      {/* API URL and Key - Same line */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="floating-label-group">
          <input
            id="ai-api-url"
            type="text"
            placeholder="https://api.openai.com"
            value={settings.apiUrl}
            onChange={(e) => updateSettings({ apiUrl: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          />
          <label className="floating-label">API URL</label>
        </div>
        <div className="floating-label-group relative">
          <input
            id="ai-api-key"
            type={showApiKey ? 'text' : 'password'}
            placeholder="sk-proj-..."
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 pr-12 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          />
          <label className="floating-label">API Key</label>
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
      <div className="floating-label-group">
        <textarea
          id="ai-job-description"
          placeholder="Paste the job posting here..."
          value={settings.jobDescription}
          onChange={(e) => updateSettings({ jobDescription: e.target.value })}
          rows={8}
          className="min-h-[160px] w-full resize-y rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
        <label className="floating-label">
          Job Description
          {settings.jobDescription && (
            <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
              {settings.jobDescription.length} chars
            </span>
          )}
        </label>
      </div>
    </div>
  )
}

export default AISettings
