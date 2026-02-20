import { encryptData, decryptData, generateVaultKey } from '@/lib/utils/encryption'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder

// Mock the Web Crypto API
const mockCrypto = {
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  },
  getRandomValues: jest.fn((arr) => arr.fill(1)),
}

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  configurable: true,
})
// Also define it on global.window for safety
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'crypto', {
    value: mockCrypto,
    configurable: true,
  })
}

describe('encryption utility', () => {
  const masterKey = 'test-password'
  const testData = 'Sensitive Resume Information'

  beforeEach(() => {
    jest.clearAllMocks()

    // Default implementation for key derivation
    mockCrypto.subtle.importKey.mockResolvedValue('base-key' as unknown as CryptoKey)
    mockCrypto.subtle.deriveKey.mockResolvedValue('derived-key' as unknown as CryptoKey)

    // Default mock implementation for encrypt/decrypt to return a buffer
    mockCrypto.subtle.encrypt.mockImplementation((algo, key, data) => Promise.resolve(data.buffer))
    mockCrypto.subtle.decrypt.mockImplementation((algo, key, data) => Promise.resolve(data.buffer))
  })

  describe('encryptData', () => {
    it('encrypts non-empty data correctly', async () => {
      const result = await encryptData(testData, masterKey)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled()
    })

    it('returns empty string for empty data', async () => {
      const result = await encryptData('', masterKey)
      expect(result).toBe('')
      expect(mockCrypto.subtle.encrypt).not.toHaveBeenCalled()
    })
  })

  describe('decryptData', () => {
    it('decrypts valid ciphertext', async () => {
      // Mock encrypt to get a result we can decrypt
      const encrypted = await encryptData(testData, masterKey)

      const decrypted = await decryptData(encrypted, masterKey)
      expect(decrypted).toBe(testData)
    })

    it('returns empty string for empty input', async () => {
      const result = await decryptData('', masterKey)
      expect(result).toBe('')
    })

    it('throws error on decryption failure', async () => {
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decrypt failed'))

      const encrypted = await encryptData(testData, masterKey)

      await expect(decryptData(encrypted, masterKey)).rejects.toThrow('Decryption failed')
    })

    it('handles corrupted base64', async () => {
      // btoa() might throw or atob() might throw
      await expect(decryptData('!!!invalid-base64!!!', masterKey)).rejects.toThrow()
    })
  })

  describe('generateVaultKey', () => {
    it('generates a 64-character hex string', () => {
      const key = generateVaultKey()
      expect(key).toHaveLength(64)
      expect(key).toMatch(/^[0-9a-f]+$/)
    })
  })
})
