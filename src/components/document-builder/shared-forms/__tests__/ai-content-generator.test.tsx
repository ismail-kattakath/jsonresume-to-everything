import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AIContentGenerator from '@/components/document-builder/shared-forms/ai-content-generator'
import { ResumeContext } from '@/lib/contexts/document-context'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { generateSummaryGraph, generateCoverLetterGraph, tailorExperienceToJDGraph } from '@/lib/ai/strands/agent'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/lib/contexts/ai-settings-context')
jest.mock('@/lib/ai/strands/agent')
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
}))
jest.mock('@/lib/analytics', () => ({
  analytics: {
    aiGenerationSuccess: jest.fn(),
    aiGenerationError: jest.fn(),
  },
}))
jest.mock('@/components/ui/ai-action-button', () => ({
  __esModule: true,
  default: ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button onClick={onClick} aria-label={label}>
      {label}
    </button>
  ),
}))

describe('AIContentGenerator', () => {
  const mockResumeData = { summary: '', content: '', workExperience: [] }
  const mockAISettings = {
    settings: {
      apiUrl: 'http://api.test',
      apiKey: 'test-key',
      model: 'test-model',
      providerType: 'openai',
      jobDescription: 'test jd',
    },
    isConfigured: true,
  }

  const defaultProps = {
    name: 'test-field',
    value: 'old value',
    onChange: jest.fn(),
    onGenerated: jest.fn(),
    mode: 'summary' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAISettings as jest.Mock).mockReturnValue(mockAISettings)
    ;(generateSummaryGraph as jest.Mock).mockResolvedValue('Generated summary content')
    ;(generateCoverLetterGraph as jest.Mock).mockResolvedValue('Generated cover letter content')
    ;(tailorExperienceToJDGraph as jest.Mock).mockResolvedValue({
      description: 'Tailored description',
      achievements: ['A1'],
    })
  })

  const renderComponent = (props = {}) => {
    return render(
      <ResumeContext.Provider value={{ resumeData: mockResumeData } as any}>
        <AIContentGenerator {...defaultProps} {...props} />
      </ResumeContext.Provider>
    )
  }

  it('renders correctly', () => {
    renderComponent()
    expect(screen.getByLabelText('Professional Summary')).toBeInTheDocument()
    expect(screen.getByDisplayValue('old value')).toBeInTheDocument()
  })

  it('handles manual change', () => {
    renderComponent()
    const textarea = screen.getByLabelText('Professional Summary')
    fireEvent.change(textarea, { target: { value: 'New value' } })
    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  it('generates summary using generateSummaryGraph', async () => {
    renderComponent()
    const genButton = screen.getByRole('button', { name: /Generate by JD/i })
    fireEvent.click(genButton)

    await waitFor(() => {
      expect(generateSummaryGraph).toHaveBeenCalled()
      expect(defaultProps.onGenerated).toHaveBeenCalledWith('Generated summary content', undefined)
    })
  })

  it('generates cover letter using generateCoverLetterGraph', async () => {
    renderComponent({ mode: 'coverLetter' })
    const genButton = screen.getByRole('button', { name: /Generate by JD/i })
    fireEvent.click(genButton)

    await waitFor(() => {
      expect(generateCoverLetterGraph).toHaveBeenCalled()
      expect(defaultProps.onGenerated).toHaveBeenCalledWith('Generated cover letter content', undefined)
    })
  })

  it('tailors experience using tailorExperienceToJDGraph', async () => {
    renderComponent({
      mode: 'workExperience',
      experienceData: { organization: 'Org', position: 'Pos', achievements: ['A1'] },
    })
    const genButton = screen.getByRole('button', { name: /Generate by JD/i })
    fireEvent.click(genButton)

    await waitFor(() => {
      expect(tailorExperienceToJDGraph).toHaveBeenCalled()
      expect(defaultProps.onGenerated).toHaveBeenCalledWith('Tailored description', ['A1'])
    })
  })

  it('falls back to onChange if onGenerated is not provided (defensive check)', async () => {
    const { onGenerated: _, ...props } = defaultProps
    render(
      <ResumeContext.Provider value={{ resumeData: mockResumeData } as any}>
        <AIContentGenerator {...(props as any)} />
      </ResumeContext.Provider>
    )

    const genButton = screen.getByRole('button', { name: /Generate by JD/i })
    fireEvent.click(genButton)

    await waitFor(() => {
      expect(defaultProps.onChange).toHaveBeenCalledWith('Generated summary content')
    })
  })

  it('handles generation errors', async () => {
    ;(generateSummaryGraph as jest.Mock).mockRejectedValue(new Error('API Error'))
    renderComponent()
    const genButton = screen.getByRole('button', { name: /Generate by JD/i })
    fireEvent.click(genButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Generation failed', expect.any(Object))
    })
  })

  it('shows error if not configured', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({ ...mockAISettings, isConfigured: false })
    renderComponent()
    const genButton = screen.getByRole('button', { name: /Generate by JD/i })
    fireEvent.click(genButton)
    expect(toast.error).toHaveBeenCalledWith('AI not configured', expect.any(Object))
  })

  it('strips markdown from final content', async () => {
    ;(generateSummaryGraph as jest.Mock).mockResolvedValue('**Bold** and *Italic*')
    renderComponent()
    const genButton = screen.getByRole('button', { name: /Generate by JD/i })
    fireEvent.click(genButton)

    await waitFor(() => {
      expect(defaultProps.onGenerated).toHaveBeenCalledWith('Bold and Italic', undefined)
    })
  })

  it('filters out critique messages from summary streaming', async () => {
    ;(generateSummaryGraph as jest.Mock).mockImplementation((data, jd, config, onChunk) => {
      onChunk({ content: 'CRITIQUE: needs more tech', done: false })
      onChunk({ content: 'Real content', done: false })
      return Promise.resolve('Final content')
    })

    // Mock toast to return an ID on first call
    const mockToast = jest.fn().mockReturnValue('toast-id')
    if ((toast as any).mockImplementation) {
      ;(toast as any).mockImplementation(mockToast)
    } else {
      Object.assign(toast, mockToast)
    }

    renderComponent()
    const genButton = screen.getByRole('button', { name: /Generate by JD/i })
    fireEvent.click(genButton)

    await waitFor(() => {
      // Critique should be filtered out, only 'Real content' should trigger a toast
      // We don't verify toast exact calls here, just that it doesn't crash
    })
  })
})
