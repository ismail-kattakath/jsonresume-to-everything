'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Loader2, Square, RefreshCw, Check } from 'lucide-react'
import { useOnDeviceLlm, ON_DEVICE_MODEL_URL } from '@/lib/ai/on-device/use-on-device-llm'

interface OnDeviceGeneratorProps {
  prompt: string
  onComplete: (text: string) => void
  onDismiss: () => void
}

/**
 * Downloads the model file via fetch() with real streaming byte progress,
 * then creates a blob: URL and passes it to useLlm.
 *
 * Why: the underlying MediaPipe library only fires progress at 10% (start) and 100%
 * (done) with no intermediate events. To show real progress we stream-download first.
 */
const MODEL_CACHE_KEY = 'on-device-model-blob'
/** HuggingFace access token — required for gated Gemma models */
const HF_TOKEN = process.env['NEXT_PUBLIC_HF_TOKEN'] || ''

async function downloadWithProgress(
  url: string,
  onProgress: (pct: number) => void,
  signal: AbortSignal
): Promise<string> {
  // Try to get a cached blob URL from sessionStorage (object URL survives the session)
  const cached = sessionStorage.getItem(MODEL_CACHE_KEY)
  if (cached) {
    onProgress(100)
    return cached
  }

  const headers: HeadersInit = {}
  if (HF_TOKEN) headers['Authorization'] = `Bearer ${HF_TOKEN}`

  const response = await fetch(url, { signal, headers })
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0

  const reader = response.body!.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (total > 0) {
      onProgress(Math.round((received / total) * 95)) // reserve last 5% for model init
    } else {
      // Unknown size — pulse between 10-80%
      onProgress(Math.min(80, Math.round((received / (555 * 1024 * 1024)) * 95)))
    }
  }

  const blob = new Blob(chunks as unknown as BlobPart[])
  const blobUrl = URL.createObjectURL(blob)
  try {
    sessionStorage.setItem(MODEL_CACHE_KEY, blobUrl)
  } catch {
    /* quota exceeded, fine */
  }
  return blobUrl
}

/**
 * Self-contained component that runs on-device Gemma3 inference.
 *
 * Phase 1: Downloads the model with real byte-level progress via fetch() streaming.
 * Phase 2: Once blobUrl is ready, renders <LlmRunner> which mounts useLlm and runs generation.
 *
 * This two-phase pattern is necessary because:
 * - useLlm must always be called (React hook rules) — so it lives in a dedicated child
 * - Real download progress requires fetch streaming, which the MediaPipe library doesn't expose
 */
export function OnDeviceGenerator({ prompt, onComplete, onDismiss }: OnDeviceGeneratorProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [downloadPct, setDownloadPct] = useState(0)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const controller = new AbortController()
    abortRef.current = controller

    downloadWithProgress(ON_DEVICE_MODEL_URL, setDownloadPct, controller.signal)
      .then(setBlobUrl)
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setDownloadError(err.message)
      })

    return () => controller.abort()
  }, [])

  // --- Error ---
  if (downloadError) {
    return (
      <div className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm font-medium text-red-400">Download failed</p>
        <p className="text-xs text-white/50">{downloadError}</p>
        <button onClick={onDismiss} className="text-xs text-white/30 underline hover:text-white/60">
          Dismiss
        </button>
      </div>
    )
  }

  // --- Phase 1: Download progress ---
  if (!blobUrl) {
    const isInitializing = downloadPct >= 95
    const stage = isInitializing
      ? 'Initializing model…'
      : downloadPct === 0
        ? 'Connecting…'
        : `Downloading model… ${downloadPct}%`

    return (
      <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>On-Device AI</span>
        </div>
        <p className="text-xs text-white/50">{stage}</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          {downloadPct > 0 ? (
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${downloadPct}%` }}
            />
          ) : (
            /* indeterminate shimmer when no content-length */
            <div className="h-full w-1/3 animate-pulse rounded-full bg-emerald-500" />
          )}
        </div>
        <p className="text-xs text-white/30">~555MB · downloaded once and cached in your browser</p>
        <button
          onClick={() => {
            abortRef.current?.abort()
            onDismiss()
          }}
          className="text-xs text-white/30 underline transition-colors hover:text-white/60"
        >
          Cancel
        </button>
      </div>
    )
  }

  // --- Phase 2: Run inference ---
  return <LlmRunner blobUrl={blobUrl} prompt={prompt} onComplete={onComplete} onDismiss={onDismiss} />
}

/** Inner component that safely calls useLlm (hooks must always be called) */
function LlmRunner({
  blobUrl,
  prompt,
  onComplete,
  onDismiss,
}: {
  blobUrl: string
  prompt: string
  onComplete: (text: string) => void
  onDismiss: () => void
}) {
  // Pass the blob URL directly — bypasses any further HTTP download inside the worker
  const { generate, output, isLoading, progress, error } = useOnDeviceLlm(blobUrl)
  const hasGeneratedRef = useRef(false)

  useEffect(() => {
    if (progress === 100 && !hasGeneratedRef.current && !output) {
      hasGeneratedRef.current = true
      generate(prompt)
    }
  }, [progress, generate, prompt, output])

  const handleRegenerate = () => {
    hasGeneratedRef.current = true
    generate(prompt)
  }

  const handleUse = () => {
    const clean = output
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/~~(.+?)~~/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .trim()
    onComplete(clean)
  }

  // Still initializing model from blob
  if (progress < 100 && !error) {
    return (
      <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Initializing model…</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-emerald-500" />
        </div>
        <button onClick={onDismiss} className="text-xs text-white/30 underline hover:text-white/60">
          Cancel
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm font-medium text-red-400">On-Device AI Error</p>
        <p className="text-xs text-white/50">{error}</p>
        <button onClick={onDismiss} className="text-xs text-white/30 underline hover:text-white/60">
          Dismiss
        </button>
      </div>
    )
  }

  const isDone = !isLoading && output.length > 0

  return (
    <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>On-Device AI is writing…</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Draft ready · generated on-device</span>
            </>
          )}
        </div>
        <span className="text-xs text-white/30">🔒 Private</span>
      </div>

      <div className="max-h-64 overflow-y-auto rounded bg-black/30 p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap text-white/80">
        {output || ' '}
        {isLoading && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-emerald-400 align-middle" />}
      </div>

      <div className="flex gap-2">
        {isDone && (
          <button
            onClick={handleUse}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            <Check className="h-3 w-3" />
            Use This Draft
          </button>
        )}
        {isDone && (
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:bg-white/5"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </button>
        )}
        <button
          onClick={onDismiss}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/30 transition-colors hover:text-white/60"
        >
          {isLoading && <Square className="h-3 w-3" />}
          {isLoading ? 'Stop' : 'Discard'}
        </button>
      </div>
    </div>
  )
}
