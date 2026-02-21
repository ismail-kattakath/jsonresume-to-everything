'use client'

import React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { BaseButton } from './base-button'
import { useAISettings } from '@/lib/contexts/ai-settings-context'

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
  variant,
}) => {
  const { isAIWorking, settings } = useAISettings()
  const isOnDevice = settings.providerType === 'on-device'

  // Default variant based on provider type if not explicitly set
  // On-device AI always uses green variant for the "green box" feel
  const effectiveVariant = isOnDevice ? 'green' : variant || 'blue'

  const iconSize = (() => {
    switch (size) {
      case 'lg':
        return 'h-5 w-5'
      case 'md':
        return 'h-4 w-4'
      case 'sm':
      default:
        return 'h-3 w-3'
    }
  })()

  const baseButtonVariant = (() => {
    switch (effectiveVariant) {
      case 'amber':
        return 'gradient-amber'
      case 'green':
        return 'gradient-green'
      case 'blue':
      default:
        return 'gradient-blue'
    }
  })() as 'gradient-blue' | 'gradient-amber' | 'gradient-green'

  const isActuallyDisabled = (!isConfigured && !isOnDevice) || isLoading || explicitlyDisabled || isAIWorking
  const showLoadingState = isLoading || isAIWorking

  const showTooltip = !showLabel || (isActuallyDisabled && !showLoadingState)

  // Add lock icon or special prefix for on-device AI label if needed
  const displayLabel = isOnDevice && label === 'Generate by JD' ? '🔒 On-Device AI' : label

  const tooltipText =
    explicitlyDisabled && !showLoadingState
      ? 'Disabled while optimization is running'
      : !isConfigured && !isOnDevice && !showLoadingState
        ? disabledTooltip
        : displayLabel

  const icon = showLoadingState ? (
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
      aria-label={displayLabel}
      className={customClassName}
    >
      {showLabel && <span>{displayLabel}</span>}
    </BaseButton>
  )
}

export default AIActionButton
