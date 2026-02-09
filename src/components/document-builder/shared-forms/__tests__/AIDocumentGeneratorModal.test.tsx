import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AIDocumentGeneratorModal from '../AIDocumentGeneratorModal'
import {
  generateCoverLetter,
  generateSummary,
  loadCredentials,
  saveCredentials,
} from '@/lib/ai/openai-client'
import { toast } from 'sonner'
import '@testing-library/jest-dom'

// Mock icons to avoid rendering complexities
jest.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="sparkles" />,
  Eye: () => <div data-testid="eye" />,
  EyeOff: () => <div data-testid="eye-off" />,
  Loader2: () => <div data-testid="loader" />,
  AlertCircle: () => <div data-testid="alert-circle" />,
}))

// Mock the dependencies
jest.mock('@/lib/ai/openai-client', () => ({
  generateCoverLetter: jest.fn(),
  generateSummary: jest.fn(),
  loadCredentials: jest.fn(),
  saveCredentials: jest.fn(),
  OpenAIAPIError: class extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'OpenAIAPIError'
    }
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock Modal component
jest.mock('@/components/ui/Modal', () => {
  return ({ children, isOpen, title, onClose }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h1>{title}</h1>
        <button onClick={onClose} aria-label="Close modal">
          X
        </button>
        {children}
      </div>
    ) : null
})

const mockResumeData = {
  name: 'John Doe',
  position: 'Software Engineer',
  contactInformation: '+1234567890',
  email: 'john@example.com',
  address: '123 Main St',
  profilePicture: '',
  calendarLink: '',
  socialMedia: [],
  summary: 'Experienced software engineer',
  education: [],
  workExperience: [],
  skills: [],
  languages: [],
  certifications: [],
}

describe('AIDocumentGeneratorModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onGenerate: jest.fn(),
    resumeData: mockResumeData as any,
    mode: 'coverLetter' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(loadCredentials as jest.Mock).mockReturnValue(null)
  })

  it('renders correctly in coverLetter mode', () => {
    render(<AIDocumentGeneratorModal {...defaultProps} />)
    expect(screen.getByText(/AI Cover Letter Generator/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/API URL/i)).toBeInTheDocument()
  })

  it('renders correctly in summary mode', () => {
    render(<AIDocumentGeneratorModal {...defaultProps} mode="summary" />)
    expect(
      screen.getByText(/AI Professional Summary Generator/i)
    ).toBeInTheDocument()
  })

  it('loads saved credentials on mount', () => {
    ;(loadCredentials as jest.Mock).mockReturnValue({
      apiUrl: 'https://custom-api.com',
      apiKey: 'saved-key',
      rememberCredentials: true,
      lastJobDescription: 'Saved job description',
    })

    render(<AIDocumentGeneratorModal {...defaultProps} />)

    expect(screen.getByLabelText(/API URL/i)).toHaveValue(
      'https://custom-api.com'
    )
    expect(screen.getByLabelText(/^API Key/i)).toHaveValue('saved-key')
    expect(screen.getByLabelText(/^Job Description$/)).toHaveValue(
      'Saved job description'
    )
  })

  it('validates form fields correctly', () => {
    render(<AIDocumentGeneratorModal {...defaultProps} />)

    const generateButton = screen.getByRole('button', {
      name: /Generate Cover Letter/i,
    })
    expect(generateButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/^API Key/i), {
      target: { value: 'test-key' },
    })
    fireEvent.change(screen.getByLabelText(/^Job Description$/), {
      target: { value: 'Test job description' },
    })

    expect(generateButton).not.toBeDisabled()
  })

  it('toggles API key visibility', () => {
    render(<AIDocumentGeneratorModal {...defaultProps} />)

    const apiKeyInput = screen.getByLabelText(/^API Key/i)
    expect(apiKeyInput).toHaveAttribute('type', 'password')

    // Find the toggle button using testid or aria-label
    const toggleButton = screen.getByLabelText(/Show API key/i)
    fireEvent.click(toggleButton)

    expect(apiKeyInput).toHaveAttribute('type', 'text')

    const hideButton = screen.getByLabelText(/Hide API key/i)
    fireEvent.click(hideButton)
    expect(apiKeyInput).toHaveAttribute('type', 'password')
  })

  it('handles generation successfully', async () => {
    ;(generateCoverLetter as jest.Mock).mockResolvedValue('Generated content')

    render(<AIDocumentGeneratorModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/^API Key/i), {
      target: { value: 'test-key' },
    })
    fireEvent.change(screen.getByLabelText(/^Job Description$/), {
      target: { value: 'Test job description' },
    })

    const generateButton = screen.getByRole('button', {
      name: /Generate Cover Letter/i,
    })
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(generateCoverLetter).toHaveBeenCalled()
    })

    expect(toast.success).toHaveBeenCalled()
    expect(defaultProps.onGenerate).toHaveBeenCalledWith('Generated content')
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('handles generation error correctly', async () => {
    ;(generateCoverLetter as jest.Mock).mockRejectedValue(
      new Error('API Failure')
    )

    render(<AIDocumentGeneratorModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/^API Key/i), {
      target: { value: 'test-key' },
    })
    fireEvent.change(screen.getByLabelText(/^Job Description$/), {
      target: { value: 'Test job description' },
    })

    const generateButton = screen.getByRole('button', {
      name: /Generate Cover Letter/i,
    })
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/API Failure/i)).toBeInTheDocument()
    })
    expect(toast.error).toHaveBeenCalled()
  })

  it('resets form when modal closes', () => {
    const { rerender } = render(
      <AIDocumentGeneratorModal {...defaultProps} isOpen={true} />
    )

    const jobDescInput = screen.getByLabelText(/^Job Description$/)
    fireEvent.change(jobDescInput, { target: { value: 'Temporary text' } })
    expect(jobDescInput).toHaveValue('Temporary text')

    // Close modal
    rerender(<AIDocumentGeneratorModal {...defaultProps} isOpen={false} />)

    // Reopen modal
    rerender(<AIDocumentGeneratorModal {...defaultProps} isOpen={true} />)
    expect(screen.getByLabelText(/^Job Description$/)).toHaveValue('')
  })
})
