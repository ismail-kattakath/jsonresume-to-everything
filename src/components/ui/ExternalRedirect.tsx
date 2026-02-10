'use client'

import { useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface ExternalRedirectProps {
    url: string | undefined
    label: string
}

export default function ExternalRedirect({ url, label }: ExternalRedirectProps) {
    useEffect(() => {
        if (url) {
            window.location.replace(url)
        }
    }, [url])

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="max-w-md text-center">
                {url ? (
                    <div className="mx-auto h-96 w-96">
                        <DotLottieReact
                            src="/animations/spinner.lottie"
                            loop
                            autoplay
                        />
                    </div>
                ) : (
                    <>
                        <div className="mb-6 text-5xl">⚠️</div>
                        <h1 className="md3-display-small mb-4 text-[var(--md-sys-color-error)]">
                            {label.charAt(0).toUpperCase() + label.slice(1)} not available
                        </h1>
                        <p className="md3-body-large mb-10 text-[var(--md-sys-color-on-surface-variant)]">
                            Sorry, the {label} could not be found.
                        </p>
                        <a
                            href="/"
                            className="md3-btn-filled inline-flex items-center transition-transform hover:scale-105 active:scale-95"
                        >
                            Return Home
                        </a>
                    </>
                )}
            </div>
        </div>
    )
}
