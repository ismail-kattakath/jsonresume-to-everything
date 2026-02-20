import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import AIDocumentGeneratorModal from '@/components/document-builder/shared-forms/AIDocumentGeneratorModal'
import { generateCoverLetterGraph, generateSummaryGraph } from '@/lib/ai/strands/agent'
import { loadCredentials, saveCredentials } from '@/lib/ai/storage'
import { toast } from 'sonner'
import type { ResumeData } from '@/types'

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

// Mock Modal since it's likely a portal or has complex logic
jest.mock('@/components/ui/Modal', () => {
  const MockModal = ({ children, isOpen, title }: { children: React.ReactNode; isOpen: boolean; title: string }) =>
    isOpen ? (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
      </div>
    ) : null
  MockModal.displayName = 'Modal'
  return MockModal
})

// Mock AIActionButton
jest.mock('@/components/ui/AIActionButton', () => {
  const MockAIActionButton = ({
    label,
    onClick,
    isConfigured,
    isLoading,
  }: {
    label: string
    onClick: () => void
    isConfigured: boolean
    isLoading: boolean
  }) => (
    <button onClick={onClick} disabled={!isConfigured || isLoading}>
      {isLoading ? 'Generating...' : label}
    </button>
  )
  MockAIActionButton.displayName = 'AIActionButton'
  return MockAIActionButton
})

describe('AIDocumentGeneratorModal', () => {
  const mockOnClose = jest.fn()
  const mockOnGenerate = jest.fn()
  const mockResumeData = { name: 'Test User' } as unknown as ResumeData

  beforeEach(() => {
    jest.clearAllMocks()
    ;(loadCredentials as jest.Mock).mockResolvedValue({
      apiUrl: 'https://api.openai.com',
      apiKey: 'test-key',
      rememberCredentials: true,
      lastJobDescription: 'Test Job Description',
    })
  })

  it('renders correctly when open in coverLetter mode', async () => {
    render(
      <AIDocumentGeneratorModal
        isOpen={true}
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
        resumeData={mockResumeData}
        mode="coverLetter"
      />
    )

    expect(screen.getByText('🤖 AI Cover Letter Generator')).toBeInTheDocument()
    await waitFor(() => {
      // Use partial match and function for multiline placeholder
      const textarea = screen.getByPlaceholderText(/Paste the job posting here/i)
      expect(textarea).toHaveValue('Test Job Description')
    })
  })

  it('validates form fields', async () => {
    ;(loadCredentials as jest.Mock).mockResolvedValue(null)
    render(
      <AIDocumentGeneratorModal
        isOpen={true}
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
        resumeData={mockResumeData}
        mode="coverLetter"
      />
    )

    const generateButton = screen.getByRole('button', { name: /Generate Cover Letter/i })
    expect(generateButton).toBeDisabled()

    // Fill in fields
    fireEvent.change(screen.getByPlaceholderText('sk-proj-...'), { target: { value: 'test-key' } })
    fireEvent.change(screen.getByPlaceholderText(/Paste the job posting here/i), { target: { value: 'Test Job' } })

    expect(generateButton).not.toBeDisabled()
  })

  it('calls generateFunction and handles success', async () => {
    ;(generateCoverLetterGraph as jest.Mock).mockResolvedValue('Generated Content')
    render(
      <AIDocumentGeneratorModal
        isOpen={true}
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
        resumeData={mockResumeData}
        mode="coverLetter"
      />
    )

    // Wait for credentials to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-proj-...')).toHaveValue('test-key')
    })

    const generateButton = screen.getByRole('button', { name: /Generate Cover Letter/i })
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(generateCoverLetterGraph).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Cover letter generated successfully!', expect.anything())
      expect(mockOnGenerate).toHaveBeenCalledWith('Generated Content')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles generation error', async () => {
    ;(generateCoverLetterGraph as jest.Mock).mockRejectedValue(new Error('API Error'))
    render(
      <AIDocumentGeneratorModal
        isOpen={true}
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
        resumeData={mockResumeData}
        mode="coverLetter"
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-proj-...')).toHaveValue('test-key')
    })

    const generateButton = screen.getByRole('button', { name: /Generate Cover Letter/i })
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('API Error', { selector: 'p' })).toBeInTheDocument()
      expect(toast.error).toHaveBeenCalledWith('Generation failed', expect.anything())
    })
  })

  it('resets state when closing', async () => {
    const { rerender } = render(
      <AIDocumentGeneratorModal
        isOpen={true}
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
        resumeData={mockResumeData}
        mode="coverLetter"
      />
    )

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/Paste the job posting here/i), { target: { value: 'Temp Job' } })
    })

    rerender(
      <AIDocumentGeneratorModal
        isOpen={false}
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
        resumeData={mockResumeData}
        mode="coverLetter"
      />
    )

    rerender(
      <AIDocumentGeneratorModal
        isOpen={true}
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
        resumeData={mockResumeData}
        mode="coverLetter"
      />
    )

    await waitFor(() => {
      expect(loadCredentials).toHaveBeenCalled()
    })
  })
})
