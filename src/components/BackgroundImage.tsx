'use client'

import { useEffect, useState } from 'react'
import { BACKGROUND_IMAGE_PATH } from '@/config/background'

interface BackgroundImageProps {
  withBlur?: boolean
  withOverlay?: boolean
}

/**
 * Renders a full-screen background image with optional blur and dark overlay effects.
 */
export default function BackgroundImage({ withBlur = false, withOverlay = false }: BackgroundImageProps = {}) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = BACKGROUND_IMAGE_PATH

    img.onload = () => {
      setIsLoaded(true)
    }

    // Check if image is already cached
    if (img.complete) {
      setIsLoaded(true)
    }
  }, [])

  return (
    <>
      {/* Background Image */}
      <div
        className={`fixed inset-0 transition-opacity duration-1000 ease-in-out print:hidden ${
          withBlur ? 'blur-sm' : ''
        }`}
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGE_PATH})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: isLoaded ? 1 : 0,
          zIndex: withOverlay ? -2 : -1,
        }}
      />

      {/* Optional Dark Overlay */}
      {withOverlay && <div className="fixed inset-0 bg-black/50 print:hidden" style={{ zIndex: -1 }} />}
    </>
  )
}
