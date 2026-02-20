'use client'

import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { tooltips } from '@/config/tooltips'

/**
 * AI Settings Status Indicator
 * Shows valid/invalid status in the section header
 */
export function AISettingsStatusIndicator() {
  const { isConfigured } = useAISettings()

  return isConfigured ? (
    <CheckCircle
      className="mr-1 h-4 w-4 text-green-400"
      data-tooltip-id="app-tooltip"
      data-tooltip-content={tooltips.aiSettings.validStatus}
    />
  ) : (
    <XCircle
      className="mr-1 h-4 w-4 text-red-400"
      data-tooltip-id="app-tooltip"
      data-tooltip-content={tooltips.aiSettings.invalidStatus}
    />
  )
}
