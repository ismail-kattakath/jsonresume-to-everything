'use client'

import { useEffect, useState } from 'react'

export default function BackgroundImage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = '/images/background.jpg'

    img.onload = () => {
      setIsLoaded(true)
    }

    // Check if image is already cached
    if (img.complete) {
      setIsLoaded(true)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 -z-10 transition-opacity duration-1000 ease-in-out"
      style={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        opacity: isLoaded ? 1 : 0,
      }}
    />
  )
}
