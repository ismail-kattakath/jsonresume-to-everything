import { useEffect } from 'react'

const useKeyboardShortcut = (
  key: string,
  ctrlKey: boolean,
  callback: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey
      ) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [key, ctrlKey, callback])
}

export default useKeyboardShortcut
