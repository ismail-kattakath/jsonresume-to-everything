'use client'

import React from 'react'

interface ConnectionStatusIndicatorProps {
    providerName: string
    model: string | undefined
    statusText: string
    statusColor: string
}

const ConnectionStatusIndicator = ({
    providerName,
    model,
    statusText,
    statusColor,
}: ConnectionStatusIndicatorProps) => {
    return (
        <div className="rounded-lg bg-white/5 p-4 border border-white/10">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                Connection Status
            </div>
            <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-white/40">Provider:</span>
                    <span className="text-white/80">{providerName}</span>
                </div>
                {model && (
                    <div className="flex items-center gap-2">
                        <span className="text-white/40">Model:</span>
                        <span className="text-white/60">{model}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-white/40">Status:</span>
                    <span className={statusColor}>
                        {statusText}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ConnectionStatusIndicator
