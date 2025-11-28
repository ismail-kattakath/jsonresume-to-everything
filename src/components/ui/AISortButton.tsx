'use client'

import React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

interface AISortButtonProps {
  /** Whether AI is currently configured and ready */
  isConfigured: boolean
  /** Whether sorting is in progress */
  isLoading: boolean
  /** Click handler to trigger sorting */
  onClick: () => void
  /** Optional tooltip text when disabled */
  disabledTooltip?: string
  /** Button size variant */
  size?: 'sm' | 'md'
  /** Optional custom label */
  label?: string
}

/**
 * Reusable AI Button component - unified for Sort and Generate actions
 * Shows sparkle icon when ready, loading spinner when processing
 * Disabled state when AI is not configured
 *
 * Supports two visual modes:
 * - default: Purple/blue gradient (for Sort by JD)
 * - generate: Amber/orange gradient (for Generate by JD)
 */
export default function AISortButton({
  isConfigured,
  isLoading,
  onClick,
  disabledTooltip = 'Configure AI settings first',
  size = 'sm',
  label = 'Sort by JD',
}: AISortButtonProps) {
  const sizeClasses =
    size === 'sm' ? 'px-2 py-1 text-xs gap-1' : 'px-3 py-1.5 text-sm gap-1.5'

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  const isDisabled = !isConfigured || isLoading

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      title={isDisabled && !isLoading ? disabledTooltip : `AI ${label}`}
      className={`inline-flex cursor-pointer items-center rounded transition-all ${sizeClasses} ${
        isDisabled
          ? 'cursor-not-allowed bg-white/5 text-white/30'
          : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 hover:from-purple-500/30 hover:to-blue-500/30 hover:text-purple-200'
      }`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : (
        <Sparkles className={iconSize} />
      )}
      <span>{label}</span>
    </button>
  )
}
