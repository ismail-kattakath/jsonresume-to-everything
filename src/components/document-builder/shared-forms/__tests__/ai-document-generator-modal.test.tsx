import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { suppressConsoleError } from '@/lib/__tests__/test-utils'
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

jest.mock('@/components/ui/ai-action-button', () => ({
  __esModule: true,
  default: ({ onClick, label }: any) => (
    <button onClick={onClick} aria-label={label}>
      {label}
    </button>
  ),
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

  it('handles generation failure', async () => {
    ;(generateCoverLetterGraph as jest.Mock).mockRejectedValue(new Error('Generation failed'))

    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)

    // Setup form
    fireEvent.change(getApiKeyInput(container), { target: { value: 'test-key' } })
    fireEvent.change(getJobDescriptionTextarea(container), { target: { value: 'test-jd' } })

    const generateButton = screen.getByRole('button', { name: /Generate Cover Letter/i })

    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/Generation failed/i)).toBeInTheDocument()
      expect(toast.error).toHaveBeenCalledWith('Generation failed', expect.any(Object))
    })
  })

  it('handles Ctrl+Enter to submit', async () => {
    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)
    fireEvent.change(getApiKeyInput(container), { target: { value: 'test-key' } })
    fireEvent.change(getJobDescriptionTextarea(container), { target: { value: 'test-jd' } })

    const textarea = getJobDescriptionTextarea(container)
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    expect(generateCoverLetterGraph).toHaveBeenCalled()
  })

  it('handles Meta+Enter to submit', async () => {
    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)
    fireEvent.change(getApiKeyInput(container), { target: { value: 'test-key' } })
    fireEvent.change(getJobDescriptionTextarea(container), { target: { value: 'test-jd' } })

    const textarea = getJobDescriptionTextarea(container)
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })

    expect(generateCoverLetterGraph).toHaveBeenCalled()
  })

  it('updates rememberCredentials state', () => {
    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)
    const checkbox = container.querySelector('#remember-credentials') as HTMLInputElement
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('resets form when modal is closed', async () => {
    const { rerender, container } = render(<AIDocumentGeneratorModal {...mockProps} />)
    fireEvent.change(getJobDescriptionTextarea(container), { target: { value: 'some jd' } })

    rerender(<AIDocumentGeneratorModal {...mockProps} isOpen={false} />)

    // Rerender as open again to check if it's reset
    rerender(<AIDocumentGeneratorModal {...mockProps} isOpen={true} />)
    expect(getJobDescriptionTextarea(container)).toHaveValue('')
  })

  it('updates API URL when changed', () => {
    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)
    const urlInput = getApiUrlInput(container)
    fireEvent.change(urlInput, { target: { value: 'https://new-api.com' } })
    expect(urlInput).toHaveValue('https://new-api.com')
  })

  it('shows validation helper text if form is incomplete', async () => {
    // In current implementation, button is disabled based on isFormValid
    // and helper text is shown instead of setting an error state on click
    render(<AIDocumentGeneratorModal {...mockProps} />)

    // Initially API key and JD are empty, helper text should reflect this
    expect(screen.getByText(/API key required/i)).toBeInTheDocument()

    // Fill API key but not JD
    const { container } = render(<AIDocumentGeneratorModal {...mockProps} />)
    fireEvent.change(getApiKeyInput(container), { target: { value: 'test-key' } })
    expect(screen.getByText(/Job description required/i)).toBeInTheDocument()
  })
})
