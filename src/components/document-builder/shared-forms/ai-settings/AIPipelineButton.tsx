'use client'

import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'

interface AIPipelineButtonProps {
    onRun: () => void
    disabled: boolean
    isLoading: boolean
}

const AIPipelineButton = ({
    onRun,
    disabled,
    isLoading,
}: AIPipelineButtonProps) => {
    return (
        <button
            onClick={onRun}
            disabled={disabled}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed cursor-pointer text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <Sparkles className="w-5 h-5" />
                    <span>AI-Powered Resume Optimization</span>
                </>
            )}
        </button>
    )
}

export default AIPipelineButton
