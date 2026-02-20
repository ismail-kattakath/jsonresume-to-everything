import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PrintButton from '@/components/document-builder/ui/print-button'
import { toast } from 'sonner'
import { suppressConsoleError } from '@/lib/__tests__/test-utils'

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('PrintButton', () => {
  const mockResumeData = {
    name: 'John Doe',
    position: 'Developer',
    summary: 'Test summary',
    workExperience: [],
    education: [],
    skills: [],
    socialMedia: [],
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    })
    // Mock window.print
    window.print = jest.fn()
  })

  it('renders correctly', () => {
    render(<PrintButton name="John Doe" position="Developer" resumeData={mockResumeData} />)
    expect(screen.getByRole('button', { name: /Print to PDF/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Copy as Markdown/i })).toBeInTheDocument()
  })

  it('calls window.print when print button is clicked', () => {
    jest.useFakeTimers()
    render(<PrintButton name="John Doe" position="Developer" resumeData={mockResumeData} />)
    fireEvent.click(screen.getByRole('button', { name: /Print to PDF/i }))
    jest.runAllTimers()
    expect(window.print).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('copies text to clipboard when copy button is clicked', async () => {
    render(<PrintButton name="John Doe" position="Developer" resumeData={mockResumeData} />)
    fireEvent.click(screen.getByRole('button', { name: /Copy as Markdown/i }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Resume copied as Markdown!')
    })
  })

  it('handles clipboard failure gracefully', async () => {
    const error = new Error('Clipboard access denied')
    ;(navigator.clipboard.writeText as jest.Mock).mockRejectedValue(error)

    render(<PrintButton name="John Doe" position="Developer" resumeData={mockResumeData} />)

    await suppressConsoleError(/Failed to copy to clipboard:/i, async () => {
      fireEvent.click(screen.getByRole('button', { name: /Copy as Markdown/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
      })
    })
  })
})
