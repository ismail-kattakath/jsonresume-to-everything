import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import AIDocumentGeneratorModal from '@/components/document-builder/shared-forms/ai-document-generator-modal'
import { generateCoverLetterGraph } from '@/lib/ai/strands/agent'
import { loadCredentials } from '@/lib/ai/storage'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/lib/ai/strands/agent', () => ({
  generateCoverLetterGraph: jest.fn(),
  generateSummaryGraph: jest.fn(),
}))

jest.mock('@/lib/ai/storage', () => ({
  loadCredentials: jest.fn(),
  saveCredentials: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('AIDocumentGeneratorModal', () => {
  const mockResumeData: any = { name: 'John Doe' }
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onGenerate: jest.fn(),
    resumeData: mockResumeData,
    mode: 'coverLetter' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(loadCredentials as jest.Mock).mockResolvedValue(null)
  })

  // Helper to get the API Key input specifically
  const getApiKeyInput = (container: HTMLElement) => container.querySelector('#api-key') as HTMLInputElement
  const getJobDescriptionTextarea = (container: HTMLElement) =>
    container.querySelector('#job-description') as HTMLTextAreaElement
  const getApiUrlInput = (container: HTMLElement) => container.querySelector('#api-url') as HTMLInputElement

  it('renders correctly when open', async () => {
    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)
    expect(screen.getByText(/AI Cover Letter Generator/i)).toBeInTheDocument()
    expect(getApiUrlInput(container)).toHaveValue('https://api.openai.com')
  })

  it('loads saved credentials on mount', async () => {
    ;(loadCredentials as jest.Mock).mockResolvedValue({
      apiUrl: 'https://saved-api.com',
      apiKey: 'saved-key',
      rememberCredentials: true,
      lastJobDescription: 'Saved JD',
    })

    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)

    await waitFor(() => {
      expect(getApiUrlInput(container)).toHaveValue('https://saved-api.com')
      expect(getApiKeyInput(container)).toHaveValue('saved-key')
      expect(getJobDescriptionTextarea(container)).toHaveValue('Saved JD')
    })
  })

  it('validates form before generation', async () => {
    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)

    // Check if button is effectively disabled or if helper text shows up
    const generateButton = screen.getByRole('button', { name: /Generate Cover Letter/i })

    // Initial state: Invalid
    fireEvent.click(generateButton)
    expect(generateCoverLetterGraph).not.toHaveBeenCalled()

    // Fill in fields
    fireEvent.change(getApiKeyInput(container), { target: { value: 'test-key' } })
    fireEvent.change(getJobDescriptionTextarea(container), { target: { value: 'test-jd' } })

    // Now should be valid
    fireEvent.click(generateButton)
    expect(generateCoverLetterGraph).toHaveBeenCalled()
  })

  it('handles generation success with streaming', async () => {
    ;(generateCoverLetterGraph as jest.Mock).mockImplementation((data, jd, config, onChunk) => {
      onChunk({ content: 'Hello ' })
      onChunk({ content: 'World' })
      return Promise.resolve('Hello World')
    })

    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)

    // Setup form
    fireEvent.change(getApiKeyInput(container), { target: { value: 'test-key' } })
    fireEvent.change(getJobDescriptionTextarea(container), { target: { value: 'test-jd' } })

    const generateButton = screen.getByRole('button', { name: /Generate Cover Letter/i })
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(generateCoverLetterGraph).toHaveBeenCalled()
      expect(mockProps.onGenerate).toHaveBeenCalledWith('Hello World')
      expect(toast.success).toHaveBeenCalledWith(expect.any(String), expect.any(Object))
    })
  })

  it('toggles API key visibility', () => {
    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)
    const apiKeyInput = getApiKeyInput(container)
    const toggleButton = screen.getByLabelText(/Show API key/i)

    expect(apiKeyInput).toHaveAttribute('type', 'password')
    fireEvent.click(toggleButton)
    expect(apiKeyInput).toHaveAttribute('type', 'text')
  })
})
