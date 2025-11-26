import { renderHook } from '@testing-library/react'
import useKeyboardShortcut from '@/hooks/useKeyboardShortcut'

describe('useKeyboardShortcut', () => {
  let mockCallback: jest.Mock

  beforeEach(() => {
    mockCallback = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should call callback when matching key and ctrlKey are pressed', () => {
      renderHook(() => useKeyboardShortcut('s', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should not call callback when key matches but ctrlKey does not', () => {
      renderHook(() => useKeyboardShortcut('s', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: false,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should not call callback when ctrlKey matches but key does not', () => {
      renderHook(() => useKeyboardShortcut('s', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should not call callback when neither key nor ctrlKey match', () => {
      renderHook(() => useKeyboardShortcut('s', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: false,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('Case Insensitivity', () => {
    it('should handle lowercase key matching uppercase input', () => {
      renderHook(() => useKeyboardShortcut('s', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'S',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should handle uppercase key matching lowercase input', () => {
      renderHook(() => useKeyboardShortcut('S', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('Without Ctrl Key', () => {
    it('should call callback for key-only shortcut (ctrlKey=false)', () => {
      renderHook(() => useKeyboardShortcut('Enter', false, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: false,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should not call callback for key-only shortcut when ctrlKey is pressed', () => {
      renderHook(() => useKeyboardShortcut('Enter', false, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('Event Listener Management', () => {
    it('should add event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')

      renderHook(() => useKeyboardShortcut('s', true, mockCallback))

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      addEventListenerSpy.mockRestore()
    })

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      const { unmount } = renderHook(() =>
        useKeyboardShortcut('s', true, mockCallback)
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })

    it('should update event listener when dependencies change', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      const { rerender } = renderHook(
        ({ key, ctrlKey, callback }) =>
          useKeyboardShortcut(key, ctrlKey, callback),
        {
          initialProps: {
            key: 's',
            ctrlKey: true,
            callback: mockCallback,
          },
        }
      )

      // Change key
      rerender({
        key: 'p',
        ctrlKey: true,
        callback: mockCallback,
      })

      // Should remove old listener and add new one
      expect(removeEventListenerSpy).toHaveBeenCalled()
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2)

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Event Prevention', () => {
    it('should call preventDefault when shortcut matches', () => {
      renderHook(() => useKeyboardShortcut('s', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

      document.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockCallback).toHaveBeenCalled()
    })

    it('should not call preventDefault when shortcut does not match', () => {
      renderHook(() => useKeyboardShortcut('s', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true,
        bubbles: true,
      })
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

      document.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('Special Keys', () => {
    it('should handle special keys like Escape', () => {
      renderHook(() => useKeyboardShortcut('Escape', false, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        ctrlKey: false,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should handle special keys with Ctrl', () => {
      renderHook(() => useKeyboardShortcut('Delete', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'Delete',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should handle function keys', () => {
      renderHook(() => useKeyboardShortcut('F1', false, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'F1',
        ctrlKey: false,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('Multiple Shortcuts', () => {
    it('should handle multiple hooks with different shortcuts', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()

      renderHook(() => useKeyboardShortcut('s', true, callback1))
      renderHook(() => useKeyboardShortcut('p', true, callback2))

      // Trigger first shortcut
      const event1 = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event1)

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).not.toHaveBeenCalled()

      // Trigger second shortcut
      const event2 = new KeyboardEvent('keydown', {
        key: 'p',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event2)

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid consecutive key presses', () => {
      renderHook(() => useKeyboardShortcut('s', true, mockCallback))

      // Simulate rapid key presses
      for (let i = 0; i < 5; i++) {
        const event = new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true,
          bubbles: true,
        })
        document.dispatchEvent(event)
      }

      expect(mockCallback).toHaveBeenCalledTimes(5)
    })

    it('should handle numeric keys', () => {
      renderHook(() => useKeyboardShortcut('1', true, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: '1',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should handle arrow keys', () => {
      renderHook(() => useKeyboardShortcut('ArrowDown', false, mockCallback))

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        ctrlKey: false,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })
})
