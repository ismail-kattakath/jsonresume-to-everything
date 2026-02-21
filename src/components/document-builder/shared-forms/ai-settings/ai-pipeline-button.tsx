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
  const { isAIWorking } = useAISettings()
  const showLoading = isLoading || (isAIWorking && !isLoading) // Show loading if pipeline is running elsewhere
  const icon = showLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />

  return (
    <BaseButton
      onClick={onRun}
      disabled={disabled || isAIWorking}
      variant="gradient-purple"
      size="md"
      fullWidth
      icon={icon}
    >
      {showLoading ? (
        'Generating...'
      ) : (
        <>
          <span className="hidden lg:inline">Optimize Resume by Job Description</span>
          <span className="lg:hidden">Optimize by JD</span>
        </>
      )}
    </BaseButton>
  )
}

export default AIPipelineButton
