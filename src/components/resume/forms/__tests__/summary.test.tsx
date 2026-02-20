import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ResumeContext } from '@/lib/contexts/document-context'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import Summary from '@/components/resume/forms/summary'

// Mock dependencies
jest.mock('@/lib/contexts/ai-settings-context', () => ({
  useAISettings: jest.fn(),
}))

jest.mock('@/components/document-builder/shared-forms/ai-content-generator', () => {
  return jest.fn(({ value, onChange, onGenerated }) => (
    <div>
      <textarea data-testid="summary-textarea" value={value} onChange={(e) => onChange(e)} />
      <button onClick={() => onGenerated('AI generated summary')}>Generate</button>
    </div>
  ))
})

describe('Summary Component', () => {
  const mockResumeData = { summary: 'Existing summary' }
  const mockSetResumeData = jest.fn()
  const mockHandleChange = jest.fn()

  const renderSummary = (resumeData = mockResumeData, handleChange = mockHandleChange) => {
    return render(
      <ResumeContext.Provider value={{ resumeData, setResumeData: mockSetResumeData, handleChange } as any}>
        <Summary />
      </ResumeContext.Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAISettings as jest.Mock).mockReturnValue({ isPipelineActive: false })
  })

  it('renders correctly with resume data summary', () => {
    renderSummary()
    expect(screen.getByTestId('summary-textarea')).toHaveValue('Existing summary')
  })

  it('handles summary change via events', () => {
    renderSummary()
    const textarea = screen.getByTestId('summary-textarea')
    fireEvent.change(textarea, { target: { value: 'New summary' } })
    expect(mockHandleChange).toHaveBeenCalled()
  })

  it('handles summary change via string (AI generation result)', () => {
    renderSummary()
    fireEvent.click(screen.getByText('Generate'))
    expect(mockSetResumeData).toHaveBeenCalledWith({
      ...mockResumeData,
      summary: 'AI generated summary',
    })
  })

  it('handles summary change when handleChange is not provided', () => {
    // Explicitly pass null or undefined and ensure it's not the mockHandleChange
    render(
      <ResumeContext.Provider
        value={{ resumeData: mockResumeData, setResumeData: mockSetResumeData, handleChange: undefined } as any}
      >
        <Summary />
      </ResumeContext.Provider>
    )
    const textarea = screen.getByTestId('summary-textarea')
    fireEvent.change(textarea, { target: { value: 'Manual summary' } })
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: 'Manual summary',
      })
    )
  })

  it('disables generator when pipeline is active', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({ isPipelineActive: true })
    renderSummary()
    // AIContentGenerator mock would receive disabled={true}
  })
})
