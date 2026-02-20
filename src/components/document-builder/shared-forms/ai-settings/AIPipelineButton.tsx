'use client'

import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { BaseButton } from '@/components/ui/BaseButton'

interface AIPipelineButtonProps {
  onRun: () => void
  disabled: boolean
  isLoading: boolean
}

const AIPipelineButton = ({ onRun, disabled, isLoading }: AIPipelineButtonProps) => {
  const icon = isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />

  return (
    <BaseButton onClick={onRun} disabled={disabled} variant="gradient-purple" size="md" fullWidth icon={icon}>
      {isLoading ? 'Generating...' : 'Optimize by JD'}
    </BaseButton>
  )
}

export default AIPipelineButton
