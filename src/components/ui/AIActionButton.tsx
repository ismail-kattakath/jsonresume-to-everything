'use client'

import React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { BaseButton } from './BaseButton'

interface AIActionButtonProps {
  /** Whether AI is currently configured and ready */
  isConfigured?: boolean
  /** Whether action is in progress */
  isLoading: boolean
  /** Whether button is explicitly disabled for another reason */
  isDisabled?: boolean
  /** Click handler to trigger action */
  onClick: () => void
  /** Optional tooltip text when disabled */
  disabledTooltip?: string
  /** Text label */
  label: string
  /** Whether to show the text label */
  showLabel?: boolean
  /** Optional custom class names */
  className?: string
  /** Whether the button should take full width */
  fullWidth?: boolean
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Visual variant */
  variant?: 'blue' | 'amber' | 'green'
}

/**
 * Reusable AI Button component - unified for all AI actions (Sort, Generate, Refine)
 * Shows sparkle icon when ready, loading spinner when processing
 * Consistent professional aesthetic with high visibility
 */
const AIActionButton: React.FC<AIActionButtonProps> = ({
  isConfigured = true,
  isLoading,
  isDisabled: explicitlyDisabled = false,
  onClick,
  disabledTooltip = 'Configure AI settings first',
  size = 'sm',
  label,
  showLabel = true,
  className: customClassName = '',
  fullWidth = false,
  variant = 'blue',
}) => {
  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size]

  const baseButtonVariant = {
    blue: 'gradient-blue',
    amber: 'gradient-amber',
    green: 'gradient-green',
  }[variant] as 'gradient-blue' | 'gradient-amber' | 'gradient-green'

  const isActuallyDisabled = !isConfigured || isLoading || explicitlyDisabled
  const showTooltip = !showLabel || (isActuallyDisabled && !isLoading)
  const tooltipText = explicitlyDisabled && !isLoading
    ? 'Disabled while optimization is running'
    : (!isConfigured && !isLoading ? disabledTooltip : label)

  const icon = isLoading ? (
    <Loader2 className={`${iconSize} animate-spin`} />
  ) : (
    <Sparkles className={`${iconSize} transition-transform group-hover:rotate-12`} />
  )

  return (
    <BaseButton
      type="button"
      onClick={() => {
        onClick()
      }}
      disabled={isActuallyDisabled}
      title={showTooltip ? tooltipText : undefined}
      data-tooltip-id={showTooltip ? 'app-tooltip' : undefined}
      data-tooltip-content={showTooltip ? tooltipText : undefined}
      variant={baseButtonVariant}
      size={size}
      fullWidth={fullWidth}
      icon={icon}
      aria-label={label}
      className={customClassName}
    >
      {showLabel && <span>{label}</span>}
    </BaseButton>
  )
}

export default AIActionButton
