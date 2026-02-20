/**
 * Service Worker Registration for PWA
 * Enables offline functionality and app installation
 */

/**
 * Registers the service worker for PWA functionality.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined') {
    return // Skip on server-side
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope)

          // Check for updates periodically
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New version available - reload to update')
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    })
  }
}

/**
 * Unregister service worker (for cleanup if needed)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    try {
      const registration = await navigator.serviceWorker.ready
      if (registration) {
        return registration.unregister()
      }
    } catch (error) {
      console.error('Error unregistering service worker:', error)
      return false
    }
  }

  return false
}
