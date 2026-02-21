'use client'

import React from 'react'

interface ConnectionStatusIndicatorProps {
  providerName: string
  model: string | undefined
  statusText: string
  statusColor: string
}

const ConnectionStatusIndicator = ({
  providerName,
  model,
  statusText,
  statusColor,
}: ConnectionStatusIndicatorProps) => {
  const isOnDevice = providerName === 'On-Device (Gemma 3)'

  if (isOnDevice) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="mb-2 text-xs font-semibold tracking-wider text-emerald-400/70 uppercase">
          On-Device AI — Private
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-white/40">Model:</span>
            <span className="text-white/80">Gemma 3 1B (int4)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40">Status:</span>
            <span className="text-emerald-400">🔒 Private · Runs in your browser</span>
          </div>
          <div className="mt-2 text-xs text-white/40">~555MB download on first use · cached locally after that</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-2 text-xs font-semibold tracking-wider text-white/40 uppercase">Connection Status</div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-white/40">Provider:</span>
          <span className="text-white/80">{providerName}</span>
        </div>
        {model && (
          <div className="flex items-center gap-2">
            <span className="text-white/40">Model:</span>
            <span className="text-white/60">{model}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-white/40">Status:</span>
          <span className={statusColor}>{statusText}</span>
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatusIndicator
