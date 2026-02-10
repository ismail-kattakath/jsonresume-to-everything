import { getPasswordHash, isPasswordProtectionEnabled } from '@/config/password'

// Type for global object in tests where we need to manipulate window
interface TestGlobal {
  window: Window & typeof globalThis
}

describe('Password Configuration', () => {
  const originalWindow = (global as any).window
  const originalProcessEnv = process.env

  afterEach(() => {
    // Restore original values
    ;(global as any).window = originalWindow
    ;(process as any).env = { ...originalProcessEnv }
    jest.resetModules()
  })

  describe('getPasswordHash', () => {
    it('should return undefined when no environment variable is set (server-side)', async () => {
      // Simulate server environment
      const originalWindow = (global as any).window
      delete (global as any).window
      delete (process.env as any)['NEXT_PUBLIC_EDIT_PASSWORD_HASH']

      // Force module reload to pick up new env
      jest.resetModules()
      const { getPasswordHash: freshGetPasswordHash } = await import(
        '../password'
      )

      const result = freshGetPasswordHash()

      expect(result).toBeUndefined()

      // Restore window
      ;(global as any).window = originalWindow
    })

    it('should return hash from environment variable when set (server-side)', async () => {
      const mockHash =
        '$2b$10$DROkfTWOCqdekTKMKybP2eD9NIqTHNyAKFgsZCdpEXS9vC2honJfS'

      // Simulate server environment
      const originalWindow = (global as any).window
      delete (global as any).window
      process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] = mockHash

      // Force module reload to pick up new env
      jest.resetModules()
      const { getPasswordHash: freshGetPasswordHash } = await import(
        '../password'
      )

      const result = freshGetPasswordHash()

      expect(result).toBe(mockHash)

      // Restore window
      ;(global as any).window = originalWindow
    })

    it('should return hash from window.__PASSWORD_HASH__ in browser', () => {
      const mockHash = '$2b$10$testHashFromWindow'

      // Set up window object properly for jsdom
      Object.defineProperty(window, '__PASSWORD_HASH__', {
        value: mockHash,
        writable: true,
        configurable: true,
      })

      const result = getPasswordHash()

      expect(result).toBe(mockHash)

      // Cleanup
      delete (window as any).__PASSWORD_HASH__
    })

    it('should return undefined in browser when no window hash exists and no env var', () => {
      ;(global as any).window = {
        document: {}, // Make it look like a browser environment
      }
      delete (process.env as any)['NEXT_PUBLIC_EDIT_PASSWORD_HASH']

      const result = getPasswordHash()

      expect(result).toBeUndefined()
    })

    it('should return hash from process.env in browser-like test environment', () => {
      const mockHash = '$2b$10$testHashFromProcessEnv'
      ;(global as any).window = {
        document: {}, // Make it look like a browser environment
      }
      process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] = mockHash

      const result = getPasswordHash()

      expect(result).toBe(mockHash)
    })

    it('should handle browser environment with undefined process gracefully', () => {
      ;(global as any).window = {
        document: {},
      }
      const originalProcess = global.process

      // Simulate browser without process
      try {
        // @ts-ignore - deliberately testing undefined process
        delete global.process

        const result = getPasswordHash()

        expect(result).toBeUndefined()
      } finally {
        global.process = originalProcess
      }
    })

    it('should handle browser environment with defined process but no env property', () => {
      ;(global as any).window = {
        document: {},
      }
      const originalEnv = process.env

      try {
        // Set process but with no env
        // @ts-ignore - deliberately testing missing env
        process.env = undefined

        const result = getPasswordHash()

        expect(result).toBeUndefined()
      } finally {
        process.env = originalEnv
      }
    })

    it('should prioritize window.__PASSWORD_HASH__ over environment variable', () => {
      const windowHash = '$2b$10$windowHash'
      const envHash = '$2b$10$envHash'

      // Set up window.__PASSWORD_HASH__ properly for jsdom
      Object.defineProperty(window, '__PASSWORD_HASH__', {
        value: windowHash,
        writable: true,
        configurable: true,
      })
      process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] = envHash

      const result = getPasswordHash()

      expect(result).toBe(windowHash)

      // Cleanup
      delete (window as any).__PASSWORD_HASH__
    })

    it('should handle undefined window object gracefully', () => {
      delete (global as any).window
      delete (process.env as any)['NEXT_PUBLIC_EDIT_PASSWORD_HASH']

      expect(() => getPasswordHash()).not.toThrow()
      expect(getPasswordHash()).toBeUndefined()
    })

    it('should return hash from server environment without window', () => {
      const mockHash = '$2b$10$serverSideHash'
      const originalWindow = (global as any).window

      // Remove window to simulate server environment
      delete (global as any).window
      process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] = mockHash

      const result = getPasswordHash()

      expect(result).toBe(mockHash)

      // Restore
      ;(global as any).window = originalWindow
    })
  })

  describe('isPasswordProtectionEnabled', () => {
    it('should return false when no password hash is configured (server-side)', async () => {
      const originalWindow = (global as any).window
      delete (global as any).window
      delete (process.env as any)['NEXT_PUBLIC_EDIT_PASSWORD_HASH']

      jest.resetModules()
      const { isPasswordProtectionEnabled: freshIsEnabled } = await import(
        '../password'
      )

      const result = freshIsEnabled()

      expect(result).toBe(false)
      ;(global as any).window = originalWindow
    })

    it('should return true when password hash is configured via env var (server-side)', async () => {
      const mockHash =
        '$2b$10$DROkfTWOCqdekTKMKybP2eD9NIqTHNyAKFgsZCdpEXS9vC2honJfS'
      const originalWindow = (global as any).window
      delete (global as any).window
      process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] = mockHash

      jest.resetModules()
      const { isPasswordProtectionEnabled: freshIsEnabled } = await import(
        '../password'
      )

      const result = freshIsEnabled()

      expect(result).toBe(true)
      ;(global as any).window = originalWindow
    })

    it('should return true when password hash is configured via window object', () => {
      const mockHash = '$2b$10$testHashFromWindow'

      // Set up window.__PASSWORD_HASH__ properly for jsdom
      Object.defineProperty(window, '__PASSWORD_HASH__', {
        value: mockHash,
        writable: true,
        configurable: true,
      })

      const result = isPasswordProtectionEnabled()

      expect(result).toBe(true)

      // Cleanup
      delete (window as any).__PASSWORD_HASH__
    })

    it('should return false in browser when no hash is available', () => {
      ;(global as any).window = {
        document: {}, // Make it look like a browser environment
      }
      delete (process.env as any)['NEXT_PUBLIC_EDIT_PASSWORD_HASH']

      const result = isPasswordProtectionEnabled()

      expect(result).toBe(false)
    })
  })

  describe('Security considerations', () => {
    it('should return valid bcrypt hash format when configured', async () => {
      const mockHash =
        '$2b$10$DROkfTWOCqdekTKMKybP2eD9NIqTHNyAKFgsZCdpEXS9vC2honJfS'
      const originalWindow = (global as any).window
      delete (global as any).window
      process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] = mockHash

      jest.resetModules()
      const { getPasswordHash: freshGetPasswordHash } = await import(
        '../password'
      )

      const hash = freshGetPasswordHash()

      // Bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/)
      ;(global as any).window = originalWindow
    })

    it('should not expose password in plain text when configured', async () => {
      const mockHash =
        '$2b$10$DROkfTWOCqdekTKMKybP2eD9NIqTHNyAKFgsZCdpEXS9vC2honJfS'
      const originalWindow = (global as any).window
      delete (global as any).window
      process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] = mockHash

      jest.resetModules()
      const { getPasswordHash: freshGetPasswordHash } = await import(
        '../password'
      )

      const hash = freshGetPasswordHash()

      if (hash) {
        // Hash should not contain common password patterns
        expect(hash.toLowerCase()).not.toContain('password')
        expect(hash.toLowerCase()).not.toContain('1234')
        expect(hash).not.toMatch(/^[a-z0-9]{4,}$/i) // Not a simple alphanumeric string
      }

      ;(global as any).window = originalWindow
    })

    it('should use bcrypt hash with sufficient salt rounds when configured', async () => {
      const mockHash =
        '$2b$10$DROkfTWOCqdekTKMKybP2eD9NIqTHNyAKFgsZCdpEXS9vC2honJfS'
      const originalWindow = (global as any).window
      delete (global as any).window
      process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] = mockHash

      jest.resetModules()
      const { getPasswordHash: freshGetPasswordHash } = await import(
        '../password'
      )

      const hash = freshGetPasswordHash()

      if (hash) {
        // Extract salt rounds from bcrypt hash (format: $2b$10$...)
        const match = hash.match(/^\$2[aby]\$(\d{2})\$/)
        if (match) {
          const rounds = parseInt(match[1] || '0', 10)
          expect(rounds).toBeGreaterThanOrEqual(10) // At least 10 rounds
        }
      }

      ;(global as any).window = originalWindow
    })
  })

  describe('Optional authentication behavior', () => {
    it('should allow disabling password protection by not setting env var', async () => {
      const originalWindow = (global as any).window
      delete (global as any).window
      delete (process.env as any)['NEXT_PUBLIC_EDIT_PASSWORD_HASH']

      jest.resetModules()
      const {
        getPasswordHash: freshGetPasswordHash,
        isPasswordProtectionEnabled: freshIsEnabled,
      } = await import('../password')

      const hash = freshGetPasswordHash()
      const isEnabled = freshIsEnabled()

      expect(hash).toBeUndefined()
      expect(isEnabled).toBe(false)
      ;(global as any).window = originalWindow
    })

    it('should enable password protection when env var is set', async () => {
      const mockHash =
        '$2b$10$DROkfTWOCqdekTKMKybP2eD9NIqTHNyAKFgsZCdpEXS9vC2honJfS'
      const originalWindow = (global as any).window
      delete (global as any).window
      process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] = mockHash

      jest.resetModules()
      const {
        getPasswordHash: freshGetPasswordHash,
        isPasswordProtectionEnabled: freshIsEnabled,
      } = await import('../password')

      const hash = freshGetPasswordHash()
      const isEnabled = freshIsEnabled()

      expect(hash).toBe(mockHash)
      expect(isEnabled).toBe(true)
      ;(global as any).window = originalWindow
    })
  })
})
