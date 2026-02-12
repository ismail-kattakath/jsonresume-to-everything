'use client'

import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface AILoadingToastProps {
    message: string
}

/**
 * Custom loading toast content with dotlottie spinner
 * Used for AI generation progress messages
 */
export function AILoadingToast({ message }: AILoadingToastProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0">
                <DotLottieReact
                    src="/animations/spinner.lottie"
                    loop
                    autoplay
                />
            </div>
            <span className="text-sm font-semibold">{message}</span>
        </div>
    )
}
