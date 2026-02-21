'use client'

import { useLlm } from '@ismail-kattakath/mediapipe-react/genai'

/**
 * Gemma 3 1B IT (int4 quantized) model for on-device inference.
 *
 * URL is read from NEXT_PUBLIC_ON_DEVICE_MODEL_URL env var.
 * - Use /resolve/ endpoint (not /blob/ or /raw/) — resolves HuggingFace LFS to actual binary
 * - ?download=true bypasses the HTML interstitial page
 *
 * Falls back to the hardcoded HuggingFace URL if the env var is not set.
 */
export const ON_DEVICE_MODEL_URL =
  process.env['NEXT_PUBLIC_ON_DEVICE_MODEL_URL'] ||
  'https://huggingface.co/litert-community/Gemma3-1B-IT/resolve/main/gemma3-1b-it-int4.task?download=true'

export interface OnDeviceLlmState {
  /** Start generating. Note: generate() from the underlying useLlm hook returns void. */
  generate: (prompt: string) => void
  /** Streaming output — new tokens are appended in real time */
  output: string
  /** True while the model is actively generating tokens */
  isLoading: boolean
  /**
   * Model init progress (0 or 100 only — the library doesn't emit intermediate values).
   * Real download progress is tracked separately by OnDeviceGenerator via fetch().
   */
  progress: number
  /** Error message if model load or inference failed */
  error: string | null
  /** True once model is initialized (progress === 100 and not loading) */
  isReady: boolean
}

/**
 * Hook that wraps the MediaPipe `useLlm` hook.
 *
 * @param modelUrl - A blob: URL from OnDeviceGenerator (real bytes pre-fetched with progress).
 *                   Falls back to ON_DEVICE_MODEL_URL if not provided.
 *
 * Must be used inside a `<MediaPipeProvider>` tree.
 */
export function useOnDeviceLlm(modelUrl?: string): OnDeviceLlmState {
  const { generate, output, isLoading, progress, error } = useLlm({
    modelPath: modelUrl ?? ON_DEVICE_MODEL_URL,
  })

  const isReady = progress === 100 && !isLoading

  return {
    generate,
    output,
    isLoading,
    progress,
    error,
    isReady,
  }
}
