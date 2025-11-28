import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AISettings from '../AISettings'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { fetchAvailableModels } from '@/lib/ai/openai-client'
import { PROVIDER_PRESETS } from '@/lib/ai/providers'

// Mock dependencies
jest.mock('@/lib/contexts/AISettingsContext')
jest.mock('@/lib/ai/openai-client')

const mockUseAISettings = useAISettings as jest.MockedFunction<
  typeof useAISettings
>
const mockFetchAvailableModels = fetchAvailableModels as jest.MockedFunction<
  typeof fetchAvailableModels
>

describe('AISettings Component', () => {
  const mockUpdateSettings = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAISettings.mockReturnValue({
      settings: {
        apiUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-4o-mini',
        jobDescription: '',
        rememberCredentials: true,
      },
      updateSettings: mockUpdateSettings,
      isConfigured: false,
      connectionStatus: 'idle',
      jobDescriptionStatus: 'idle',
      validateAll: jest.fn(),
    })
    mockFetchAvailableModels.mockResolvedValue([])
  })

  describe('Provider Selection', () => {
    it('renders provider dropdown', () => {
      render(<AISettings />)
      expect(screen.getByLabelText('AI Provider')).toBeInTheDocument()
    })

    it('shows all available providers', () => {
      render(<AISettings />)
      const select = screen.getByLabelText('AI Provider') as HTMLSelectElement

      PROVIDER_PRESETS.forEach((provider) => {
        expect(
          Array.from(select.options).some((opt) => opt.value === provider.name)
        ).toBe(true)
      })

      // Custom option
      expect(
        Array.from(select.options).some((opt) => opt.value === 'Custom')
      ).toBe(true)
    })

    it('auto-detects provider from URL', () => {
      mockUseAISettings.mockReturnValue({
        settings: {
          apiUrl: 'https://openrouter.ai/api/v1',
          apiKey: '',
          model: '',
          jobDescription: '',
          rememberCredentials: true,
        },
        updateSettings: mockUpdateSettings,
        isConfigured: false,
        connectionStatus: 'idle',
        jobDescriptionStatus: 'idle',
        validateAll: jest.fn(),
      })

      render(<AISettings />)
      const select = screen.getByLabelText('AI Provider') as HTMLSelectElement
      expect(select.value).toBe('OpenRouter')
    })

    it('updates URL when provider is changed', () => {
      render(<AISettings />)
      const select = screen.getByLabelText('AI Provider')

      fireEvent.change(select, { target: { value: 'OpenRouter' } })

      expect(mockUpdateSettings).toHaveBeenCalledWith({
        apiUrl: 'https://openrouter.ai/api/v1',
      })
    })

    it('auto-selects first common model when provider changes', () => {
      render(<AISettings />)
      const select = screen.getByLabelText('AI Provider')

      fireEvent.change(select, { target: { value: 'OpenRouter' } })

      expect(mockUpdateSettings).toHaveBeenCalledWith({
        model: 'google/gemini-2.0-flash-exp',
      })
    })

    it('shows custom URL input when Custom is selected', async () => {
      mockUseAISettings.mockReturnValue({
        settings: {
          apiUrl: 'https://custom.api.com/v1',
          apiKey: '',
          model: '',
          jobDescription: '',
          rememberCredentials: true,
        },
        updateSettings: mockUpdateSettings,
        isConfigured: false,
        connectionStatus: 'idle',
        jobDescriptionStatus: 'idle',
        validateAll: jest.fn(),
      })

      render(<AISettings />)
      await waitFor(() => {
        expect(screen.getByLabelText('Custom API URL')).toBeInTheDocument()
      })
    })

    it('hides custom URL input for preset providers', () => {
      render(<AISettings />)
      expect(screen.queryByLabelText('Custom API URL')).not.toBeInTheDocument()
    })
  })

  describe('API Key Input', () => {
    it('renders API key input', () => {
      render(<AISettings />)
      expect(screen.getByLabelText('API Key')).toBeInTheDocument()
    })

    it('is a password input', () => {
      render(<AISettings />)
      const input = screen.getByLabelText('API Key') as HTMLInputElement
      expect(input.type).toBe('password')
    })

    it('updates settings when API key changes', () => {
      render(<AISettings />)
      const input = screen.getByLabelText('API Key')

      fireEvent.change(input, { target: { value: 'sk-test-key' } })

      expect(mockUpdateSettings).toHaveBeenCalledWith({
        apiKey: 'sk-test-key',
      })
    })
  })

  describe('Model Selection', () => {
    it('shows model dropdown when models are available', async () => {
      mockFetchAvailableModels.mockResolvedValue(['gpt-4o', 'gpt-4o-mini'])
      mockUseAISettings.mockReturnValue({
        settings: {
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'sk-test-key',
          model: 'gpt-4o-mini',
          jobDescription: '',
          rememberCredentials: true,
        },
        updateSettings: mockUpdateSettings,
        isConfigured: false,
        connectionStatus: 'idle',
        jobDescriptionStatus: 'idle',
        validateAll: jest.fn(),
      })

      render(<AISettings />)

      await waitFor(() => {
        const select = screen.getByLabelText('Model')
        expect(select.tagName).toBe('SELECT')
      })
    })

    it('shows model dropdown with common models for preset providers', () => {
      // Default provider is OpenAI with common models
      render(<AISettings />)
      const select = screen.getByLabelText('Model')
      expect(select.tagName).toBe('SELECT')

      // Should show common OpenAI models
      const options = Array.from((select as HTMLSelectElement).options)
      expect(options.some((opt) => opt.value === 'gpt-4o-mini')).toBe(true)
    })

    it('fetches models when API key is provided', async () => {
      mockUseAISettings.mockReturnValue({
        settings: {
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'sk-test-key',
          model: '',
          jobDescription: '',
          rememberCredentials: true,
        },
        updateSettings: mockUpdateSettings,
        isConfigured: false,
        connectionStatus: 'idle',
        jobDescriptionStatus: 'idle',
        validateAll: jest.fn(),
      })

      render(<AISettings />)

      await waitFor(
        () => {
          expect(mockFetchAvailableModels).toHaveBeenCalledWith({
            baseURL: 'https://api.openai.com/v1',
            apiKey: 'sk-test-key',
          })
        },
        { timeout: 1000 }
      )
    })

    it('shows common models when API fetch fails', async () => {
      mockFetchAvailableModels.mockResolvedValue([])

      render(<AISettings />)

      await waitFor(() => {
        const select = screen.queryByLabelText('Model')
        if (select?.tagName === 'SELECT') {
          const options = Array.from((select as HTMLSelectElement).options)
          expect(options.some((opt) => opt.value === 'gpt-4o-mini')).toBe(true)
        }
      })
    })

    it('updates model when selection changes', async () => {
      mockFetchAvailableModels.mockResolvedValue(['gpt-4o', 'gpt-4o-mini'])
      mockUseAISettings.mockReturnValue({
        settings: {
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'sk-test-key',
          model: 'gpt-4o-mini',
          jobDescription: '',
          rememberCredentials: true,
        },
        updateSettings: mockUpdateSettings,
        isConfigured: false,
        connectionStatus: 'idle',
        jobDescriptionStatus: 'idle',
        validateAll: jest.fn(),
      })

      render(<AISettings />)

      await waitFor(() => {
        const select = screen.getByLabelText('Model')
        fireEvent.change(select, { target: { value: 'gpt-4o' } })
      })

      expect(mockUpdateSettings).toHaveBeenCalledWith({ model: 'gpt-4o' })
    })
  })

  describe('Job Description', () => {
    it('renders job description textarea', () => {
      render(<AISettings />)
      expect(screen.getByLabelText('Job Description')).toBeInTheDocument()
    })

    it('updates settings when job description changes', () => {
      render(<AISettings />)
      const textarea = screen.getByLabelText('Job Description')

      fireEvent.change(textarea, {
        target: { value: 'Looking for a React developer' },
      })

      expect(mockUpdateSettings).toHaveBeenCalledWith({
        jobDescription: 'Looking for a React developer',
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading indicator when fetching models', async () => {
      mockFetchAvailableModels.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      )
      mockUseAISettings.mockReturnValue({
        settings: {
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'sk-test-key',
          model: '',
          jobDescription: '',
          rememberCredentials: true,
        },
        updateSettings: mockUpdateSettings,
        isConfigured: false,
        connectionStatus: 'idle',
        jobDescriptionStatus: 'idle',
        validateAll: jest.fn(),
      })

      render(<AISettings />)

      await waitFor(() => {
        expect(
          screen.getByText(/Fetching available models/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Help Text', () => {
    it('shows appropriate help text for model dropdown with common models', () => {
      render(<AISettings />)
      // Default provider (OpenAI) shows common models without API key
      expect(
        screen.getByText(/Showing common OpenAI models/i)
      ).toBeInTheDocument()
    })

    it('shows model count when models are fetched', async () => {
      mockFetchAvailableModels.mockResolvedValue(['model1', 'model2', 'model3'])
      mockUseAISettings.mockReturnValue({
        settings: {
          apiUrl: 'https://api.openai.com/v1',
          apiKey: 'sk-test-key',
          model: 'model1',
          jobDescription: '',
          rememberCredentials: true,
        },
        updateSettings: mockUpdateSettings,
        isConfigured: false,
        connectionStatus: 'idle',
        jobDescriptionStatus: 'idle',
        validateAll: jest.fn(),
      })

      render(<AISettings />)

      await waitFor(() => {
        expect(
          screen.getByText(/3 models available from API/i)
        ).toBeInTheDocument()
      })
    })
  })
})
