'use client'

import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { BaseButton } from '@/components/ui/base-button'
import { useAISettings } from '@/lib/contexts/ai-settings-context'

interface AIPipelineButtonProps {
  onRun: () => void
  disabled: boolean
  isLoading: boolean
}

const AIPipelineButton = ({ onRun, disabled, isLoading }: AIPipelineButtonProps) => {
  const { isAIWorking, settings } = useAISettings()
  const isOnDevice = settings.providerType === 'on-device'

  const showLoading = isLoading || (isAIWorking && !isLoading) // Show loading if pipeline is running elsewhere
  const icon = showLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />

  const buttonLabel = showLoading ? (
    'Generating...'
  ) : (
    <>
      <span className="hidden lg:inline">
        {isOnDevice ? '🔒 Optimize Resume (On-Device)' : 'Optimize Resume by Job Description'}
      </span>
      <span className="lg:hidden">{isOnDevice ? '🔒 Optimize (Local)' : 'Optimize by JD'}</span>
    </>
  )

  return (
    <BaseButton
      onClick={onRun}
      disabled={disabled || isAIWorking}
      variant={isOnDevice ? 'gradient-green' : 'gradient-purple'}
      size="md"
      fullWidth
      icon={icon}
    >
      {buttonLabel}
    </BaseButton>
  )
}

export default AIPipelineButton
