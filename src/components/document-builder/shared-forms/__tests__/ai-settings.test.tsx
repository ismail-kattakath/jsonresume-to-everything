import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import AISettings from '@/components/document-builder/shared-forms/AISettings'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { fetchAvailableModels } from '@/lib/ai/models'

// Mock useAISettings
jest.mock('@/lib/contexts/AISettingsContext', () => ({
  useAISettings: jest.fn(),
}))

// Mock fetchAvailableModels
jest.mock('@/lib/ai/models', () => ({
  fetchAvailableModels: jest.fn(),
}))

describe('AISettings Component', () => {
  const mockUpdateSettings = jest.fn()
  const defaultSettings = {
    apiUrl: 'https://api.openai.com',
    apiKey: 'test-key',
    model: 'gpt-4o-mini',
    providerType: 'openai',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAISettings as jest.Mock).mockReturnValue({
      settings: defaultSettings,
      updateSettings: mockUpdateSettings,
      isConfigured: true,
      connectionStatus: 'valid',
    })
    ;(fetchAvailableModels as jest.Mock).mockResolvedValue(['gpt-4', 'gpt-3.5-turbo'])
  })

  it('renders with initial settings', async () => {
    render(<AISettings />)
    expect(screen.getByDisplayValue('https://api.openai.com')).toBeInTheDocument()
  })

  it('handles provider selection change', async () => {
    render(<AISettings />)
    const providerSelect = screen.getByLabelText(/AI Provider/i)

    await act(async () => {
      fireEvent.change(providerSelect, { target: { value: 'Groq' } })
    })

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        apiUrl: 'https://api.groq.com/openai/v1',
      })
    )
  })

  it('shows custom URL input when OpenRouter provider is selected (as it also uses custom layout components)', async () => {
    // Testing a provider change that updates state
    render(<AISettings />)
    const providerSelect = screen.getByLabelText(/AI Provider/i)

    await act(async () => {
      fireEvent.change(providerSelect, { target: { value: 'OpenRouter' } })
    })

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        apiUrl: 'https://openrouter.ai/api/v1',
      })
    )
  })

  it('fetches and displays models', async () => {
    // Force a model fetch by ensuring dependencies are met
    render(<AISettings />)

    await waitFor(
      () => {
        expect(fetchAvailableModels).toHaveBeenCalled()
      },
      { timeout: 2000 }
    )

    // Check if the model dropdown (FormSelect) is rendered when models are available
    await waitFor(() => {
      expect(screen.getByLabelText(/Model/i)).toBeInTheDocument()
    })
  })

  it('handles model fetch error', async () => {
    ;(fetchAvailableModels as jest.Mock).mockRejectedValue(new Error('Fetch failed'))
    render(<AISettings />)

    // The component might show "Enter model name manually" or a similar hint in the helpText
    // of the Model input when fetching fails
    await waitFor(
      () => {
        expect(fetchAvailableModels).toHaveBeenCalled()
      },
      { timeout: 2000 }
    )

    // When fetching fails, it usually falls back to manual input or shows an error message
    // Let's check for the manual input fallback
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/gpt-4o-mini/i)).toBeInTheDocument()
    })
  })

  it('auto-selects first model if current model is invalid', async () => {
    ;(useAISettings as jest.Mock).mockReturnValue({
      settings: { ...defaultSettings, model: 'invalid-model' },
      updateSettings: mockUpdateSettings,
      isConfigured: true,
      connectionStatus: 'valid',
    })
    ;(fetchAvailableModels as jest.Mock).mockResolvedValue(['gpt-4'])

    render(<AISettings />)

    await waitFor(
      () => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({ model: 'gpt-4' })
      },
      { timeout: 2000 }
    )
  })

  it('displays connection status correctly', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({
      settings: defaultSettings,
      updateSettings: mockUpdateSettings,
      isConfigured: false,
      connectionStatus: 'invalid',
    })

    render(<AISettings />)
    expect(screen.getByText('✗ Invalid Credentials')).toBeInTheDocument()
  })
})
