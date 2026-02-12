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
  size?: 'sm' | 'md' | 'lg'
  /** Optional custom label */
  label?: string
  /** Whether to show the text label */
  showLabel?: boolean
  /** Optional custom class names */
  className?: string
  /** Whether the button should take full width */
  fullWidth?: boolean
  /** Visual variant */
  variant?: 'primary' | 'amber' | 'ghost'
}

/**
 * Reusable AI Button component - unified for all AI actions (Sort, Generate, Refine)
 * Shows sparkle icon when ready, loading spinner when processing
 * Consistent professional aesthetic with high visibility
 */
export default function AISortButton({
  isConfigured,
  isLoading,
  onClick,
  disabledTooltip = 'Configure AI settings first',
  size = 'sm',
  label = 'Sort by JD',
  showLabel = true,
  className: customClassName = '',
  fullWidth = false,
  variant = 'primary',
}: AISortButtonProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-6 py-3.5 text-base gap-3 rounded-xl font-semibold',
  }[size]

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size]

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg',
    amber:
      'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg',
    ghost:
      'bg-white/10 text-white hover:bg-white/20 border border-white/20',
  }[variant]

  const isDisabled = !isConfigured || isLoading
  const showTooltip = !showLabel || (isDisabled && !isLoading)
  const tooltipText = isDisabled && !isLoading ? disabledTooltip : label

  return (
    <button
      type="button"
      onClick={() => {
        console.error('[DEBUG] AISortButton CLICKED')
        onClick()
      }}
      disabled={isDisabled}
      title={showTooltip ? tooltipText : undefined}
      data-tooltip-id={showTooltip ? 'app-tooltip' : undefined}
      data-tooltip-content={showTooltip ? tooltipText : undefined}
      className={`inline-flex cursor-pointer items-center justify-center rounded transition-all duration-200 ${sizeClasses} ${isDisabled
        ? 'cursor-not-allowed bg-white/5 text-white/30 border border-white/10'
        : variantClasses
        } ${fullWidth ? 'w-full' : ''} ${customClassName}`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : (
        <Sparkles className={`${iconSize} transition-transform group-hover:rotate-12`} />
      )}
      {showLabel && <span>{label}</span>}
    </button>
  )
}
