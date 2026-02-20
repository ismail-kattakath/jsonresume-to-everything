import { loadCredentials, saveCredentials, clearCredentials } from '@/lib/ai/storage'
import { decryptData } from '@/lib/utils/encryption'
import { StoredCredentials } from '@/types/openai'

// Mock encryption with very simple implementation
jest.mock('@/lib/utils/encryption', () => ({
  encryptData: jest.fn().mockImplementation((data) => Promise.resolve(`enc-${data}`)),
  decryptData: jest.fn().mockImplementation((data) => {
    if (typeof data !== 'string') return Promise.reject(new Error('Invalid data'))
    return Promise.resolve(data.replace('enc-', ''))
  }),
  generateVaultKey: jest.fn().mockReturnValue('vault-key'),
}))

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should save and get AI credentials', async () => {
    const creds: StoredCredentials = {
      apiUrl: '',
      apiKey: 'test-key',
      providerKeys: {},
      rememberCredentials: true,
    }
    await saveCredentials(creds)
    const loaded = await loadCredentials()
    expect(loaded).toBeDefined()
    expect(loaded?.apiKey).toBe('test-key')
  })

  it('should return null if none saved', async () => {
    const loaded = await loadCredentials()
    expect(loaded).toBeNull()
  })

  it('should handle decryption errors for apiKey gracefully', async () => {
    ;(decryptData as jest.Mock).mockRejectedValueOnce(new Error('Decryption failed'))

    const creds: StoredCredentials = {
      apiUrl: '',
      apiKey: 'test-key',
      providerKeys: {},
      rememberCredentials: true,
    }
    await saveCredentials(creds)
    const loaded = await loadCredentials()
    expect(loaded?.apiKey).toBe('') // Reset to empty on failure
  })

  it('should save and decrypt providerKeys', async () => {
    const creds: StoredCredentials = {
      apiUrl: '',
      apiKey: 'test-key',
      providerKeys: { 'https://api.openai.com': 'provider-key-1' },
      rememberCredentials: true,
    }
    await saveCredentials(creds)
    const loaded = await loadCredentials()
    expect(loaded?.providerKeys?.['https://api.openai.com']).toBe('provider-key-1')
  })

  it('should handle decryptData failure for individual providerKeys entry', async () => {
    // First call: decrypt apiKey succeeds; second call: decrypt providerKey fails
    ;(decryptData as jest.Mock)
      .mockResolvedValueOnce('decrypted-api-key')
      .mockRejectedValueOnce(new Error('Provider key decryption failed'))

    const creds: StoredCredentials = {
      apiUrl: '',
      apiKey: 'key',
      providerKeys: { 'https://api.example.com': 'enc-secret' },
      rememberCredentials: true,
    }
    await saveCredentials(creds)
    const loaded = await loadCredentials()
    // providerKey should be reset to empty string on decryption failure
    expect(loaded?.providerKeys?.['https://api.example.com']).toBe('')
  })

  it('should return null when localStorage contains invalid JSON', async () => {
    // Bypass saveCredentials and write bad JSON directly
    localStorage.setItem('jsonresume_ai_credentials', 'NOT_VALID_JSON')
    const loaded = await loadCredentials()
    expect(loaded).toBeNull()
  })

  it('should not encrypt credentials when rememberCredentials is false', async () => {
    const creds: StoredCredentials = {
      apiUrl: '',
      apiKey: 'sensitive-key',
      providerKeys: {},
      model: 'gpt-4o',
      providerType: 'openai-compatible',
      rememberCredentials: false,
      lastJobDescription: 'Some JD',
      skillsToHighlight: 'React',
    }
    await saveCredentials(creds)
    const raw = JSON.parse(localStorage.getItem('jsonresume_ai_credentials') || '{}')
    // When rememberCredentials is false, apiKey and apiUrl should be cleared
    expect(raw.apiKey).toBe('')
    expect(raw.apiUrl).toBe('')
    // Model and providerType are preserved
    expect(raw.model).toBe('gpt-4o')
  })

  it('clearCredentials should remove stored data', async () => {
    const creds: StoredCredentials = { apiUrl: '', apiKey: 'key', providerKeys: {}, rememberCredentials: true }
    await saveCredentials(creds)
    expect(localStorage.getItem('jsonresume_ai_credentials')).not.toBeNull()
    clearCredentials()
    expect(localStorage.getItem('jsonresume_ai_credentials')).toBeNull()
  })
})
