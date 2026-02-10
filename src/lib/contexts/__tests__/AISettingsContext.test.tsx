import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  AISettingsProvider,
  useAISettings,
} from '@/lib/contexts/AISettingsContext'
import {
  loadCredentials,
  saveCredentials,
  testConnection,
} from '@/lib/ai/openai-client'

// Mock dependencies
jest.mock('@/lib/ai/openai-client')

const mockLoadCredentials = loadCredentials as jest.MockedFunction<
  typeof loadCredentials
>
const mockSaveCredentials = saveCredentials as jest.MockedFunction<
  typeof saveCredentials
>
const mockTestConnection = testConnection as jest.MockedFunction<
  typeof testConnection
>

describe('AISettingsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLoadCredentials.mockReturnValue(null)
    mockSaveCredentials.mockImplementation(() => {})
    mockTestConnection.mockResolvedValue(true)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AISettingsProvider>{children}</AISettingsProvider>
  )

  describe('Initialization', () => {
    it('provides default settings', () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      expect(result.current.settings).toEqual({
        apiUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-4o-mini',
        providerType: 'openai-compatible',
        rememberCredentials: true,
        skillsToHighlight: '',
        jobDescription: expect.any(String),
      })
    })

    it('loads saved credentials on mount', () => {
      mockLoadCredentials.mockReturnValue({
        apiUrl: 'https://openrouter.ai/api/v1',
        apiKey: 'saved-key',
        model: 'gpt-4o',
        rememberCredentials: true,
        lastJobDescription: 'Saved job description',
      })

      const { result } = renderHook(() => useAISettings(), { wrapper })

      expect(result.current.settings.apiUrl).toBe(
        'https://openrouter.ai/api/v1'
      )
      expect(result.current.settings.apiKey).toBe('saved-key')
      expect(result.current.settings.model).toBe('gpt-4o')
      expect(result.current.settings.jobDescription).toBe(
        'Saved job description'
      )
    })

    it('starts with idle status', () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      expect(result.current.connectionStatus).toBe('idle')
      expect(result.current.jobDescriptionStatus).toBe('idle')
      expect(result.current.isConfigured).toBe(false)
    })
  })

  describe('updateSettings', () => {
    it('updates settings partially', () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({ apiKey: 'new-key' })
      })

      expect(result.current.settings.apiKey).toBe('new-key')
      expect(result.current.settings.apiUrl).toBe('https://api.openai.com/v1')
    })

    it('updates multiple fields at once', () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://custom.api.com/v1',
          apiKey: 'custom-key',
          model: 'custom-model',
        })
      })

      expect(result.current.settings.apiUrl).toBe('https://custom.api.com/v1')
      expect(result.current.settings.apiKey).toBe('custom-key')
      expect(result.current.settings.model).toBe('custom-model')
    })

    it('saves credentials after update', async () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({ apiKey: 'test-key' })
      })

      await waitFor(() => {
        expect(mockSaveCredentials).toHaveBeenCalledWith(
          expect.objectContaining({
            apiKey: 'test-key',
          })
        )
      })
    })
  })

  describe('Connection Validation', () => {
    it('validates connection when credentials change', async () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'test-key',
          model: 'gpt-4o',
        })
      })

      await waitFor(() => {
        expect(mockTestConnection).toHaveBeenCalledWith({
          baseURL: 'https://api.openai.com/v1',
          apiKey: 'test-key',
          model: 'gpt-4o',
        })
      })
    })

    it('sets connectionStatus to testing during validation', async () => {
      mockTestConnection.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      )

      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'test-key',
        })
      })

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('testing')
      })
    })

    it('sets connectionStatus to valid on successful connection', async () => {
      mockTestConnection.mockResolvedValue(true)

      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'test-key',
        })
      })

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('valid')
      })
    })

    it('sets connectionStatus to invalid on failed connection', async () => {
      mockTestConnection.mockResolvedValue(false)

      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'bad-key',
        })
      })

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('invalid')
      })
    })

    it('sets connectionStatus to invalid when credentials are empty', async () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: '',
          apiKey: '',
        })
      })

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('invalid')
      })
    })
  })

  describe('Job Description Validation', () => {
    it('validates job description length', async () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          jobDescription: 'Short'.repeat(30), // < 100 chars
        })
      })

      await waitFor(() => {
        expect(result.current.jobDescriptionStatus).toBe('invalid')
      })
    })

    it.skip('marks long job descriptions as valid', async () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          jobDescription: 'A'.repeat(150), // > 100 chars
        })
      })

      await waitFor(
        () => {
          expect(result.current.jobDescriptionStatus).toBe('valid')
        },
        { timeout: 3000 }
      )
    })

    it.skip('skips re-validation for unchanged job description', async () => {
      const { result } = renderHook(() => useAISettings(), { wrapper })

      const jobDesc = 'A'.repeat(150)

      act(() => {
        result.current.updateSettings({ jobDescription: jobDesc })
      })

      await waitFor(
        () => {
          expect(result.current.jobDescriptionStatus).toBe('valid')
        },
        { timeout: 3000 }
      )

      const previousStatus = result.current.jobDescriptionStatus

      act(() => {
        result.current.updateSettings({ jobDescription: jobDesc })
      })

      expect(result.current.jobDescriptionStatus).toBe(previousStatus)
    })
  })

  describe('isConfigured', () => {
    it('is false when connection is invalid', async () => {
      mockTestConnection.mockResolvedValue(false)

      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'bad-key',
          jobDescription: 'A'.repeat(150),
        })
      })

      await waitFor(() => {
        expect(result.current.isConfigured).toBe(false)
      })
    })

    it('is false when job description is invalid', async () => {
      mockTestConnection.mockResolvedValue(true)

      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'test-key',
          jobDescription: 'Short',
        })
      })

      await waitFor(() => {
        expect(result.current.isConfigured).toBe(false)
      })
    })

    it.skip('is true when both connection and job description are valid', async () => {
      mockTestConnection.mockResolvedValue(true)

      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'test-key',
          jobDescription: 'A'.repeat(150),
        })
      })

      await waitFor(
        () => {
          expect(result.current.connectionStatus).toBe('valid')
          expect(result.current.jobDescriptionStatus).toBe('valid')
          expect(result.current.isConfigured).toBe(true)
        },
        { timeout: 3000 }
      )
    })
  })

  describe('validateAll', () => {
    it.skip('returns true when all validations pass', async () => {
      mockTestConnection.mockResolvedValue(true)

      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'test-key',
          jobDescription: 'A'.repeat(150),
        })
      })

      await waitFor(
        async () => {
          const isValid = await result.current.validateAll()
          expect(isValid).toBe(true)
        },
        { timeout: 3000 }
      )
    })

    it('returns false when connection fails', async () => {
      mockTestConnection.mockResolvedValue(false)

      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'bad-key',
          jobDescription: 'A'.repeat(150),
        })
      })

      await waitFor(async () => {
        const isValid = await result.current.validateAll()
        expect(isValid).toBe(false)
      })
    })

    it.skip('returns false when job description is invalid', async () => {
      mockTestConnection.mockResolvedValue(true)

      const { result } = renderHook(() => useAISettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'test-key',
          jobDescription: 'Short',
        })
      })

      await waitFor(async () => {
        const isValid = await result.current.validateAll()
        expect(isValid).toBe(false)
      })
    })
  })

  describe('Error Handling', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = jest.fn()

      expect(() => {
        renderHook(() => useAISettings())
      }).toThrow('useAISettings must be used within an AISettingsProvider')

      console.error = originalError
    })
  })
})
