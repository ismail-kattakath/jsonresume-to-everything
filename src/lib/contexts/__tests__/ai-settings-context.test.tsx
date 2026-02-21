import { renderHook, act } from '@testing-library/react'
import { AISettingsProvider, useAISettings } from '@/lib/contexts/ai-settings-context'
import * as api from '@/lib/ai/api'
import React from 'react'

jest.mock('@/lib/ai/api')
jest.mock('@/lib/ai/storage', () => ({
  loadCredentials: jest.fn(() => Promise.resolve(null)),
  saveCredentials: jest.fn(() => Promise.resolve()),
}))

describe('AISettingsContext', () => {
  it('handles validateAll with invalid connection for a cloud provider', async () => {
    ;(api.testConnection as jest.Mock).mockResolvedValue({ success: false })

    const wrapper = ({ children }: { children: React.ReactNode }) => <AISettingsProvider>{children}</AISettingsProvider>

    const { result } = renderHook(() => useAISettings(), { wrapper })

    // Switch to a cloud provider first (default is on-device which always validates)
    await act(async () => {
      result.current.updateSettings({
        apiUrl: 'https://api.openai.com/v1',
        providerType: 'openai-compatible',
        apiKey: '',
      })
    })

    // Wait for initial validation
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600))
    })

    let valid: boolean = false
    await act(async () => {
      valid = await result.current.validateAll()
    })

    expect(valid).toBe(false)
    expect(result.current.connectionStatus).toBe('invalid')
  })

  it('updates settings and triggers model sync for local providers', async () => {
    ;(api.testConnection as jest.Mock).mockResolvedValue({
      success: true,
      modelId: 'forced-model',
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => <AISettingsProvider>{children}</AISettingsProvider>

    const { result } = renderHook(() => useAISettings(), { wrapper })

    await act(async () => {
      result.current.updateSettings({
        apiUrl: 'http://localhost:1234/v1', // LM Studio URL pattern
        providerType: 'openai-compatible',
      })
    })

    // Wait for debounce
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600))
    })

    expect(result.current.settings.model).toBe('forced-model')
  })
})
