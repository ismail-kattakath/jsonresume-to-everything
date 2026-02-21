import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import JobDescriptionSection from '@/components/document-builder/shared-forms/job-description-section'
import { ResumeContext } from '@/lib/contexts/document-context'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import * as aiAgent from '@/lib/ai/strands/agent'

jest.mock('@/lib/contexts/ai-settings-context')
jest.mock('@/lib/ai/strands/agent')
jest.mock('sonner', () => ({
  toast: Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn(), loading: jest.fn(), dismiss: jest.fn() }),
}))

jest.mock('../ai-settings/job-description-input', () => {
  const MockInput = ({ value, onChange }: any) => (
    <input data-testid="jd-in" value={value} onChange={(e) => onChange(e.target.value)} />
  )
  MockInput.displayName = 'MockJobDescriptionInput'
  return MockInput
})
jest.mock('../ai-settings/ai-pipeline-button', () => {
  const MockButton = ({ onRun }: any) => (
    <button data-testid="run" onClick={onRun}>
      Run
    </button>
  )
  MockButton.displayName = 'MockAIPipelineButton'
  return MockButton
})
jest.mock('@/components/ui/ai-loading-toast', () => ({ AILoadingToast: () => null }))

describe('JobDescriptionSection', () => {
  const mockSetResumeData = jest.fn()
  const mockUpdateSettings = jest.fn()
  const mockResumeData = { skills: [] }
  const mockAISettings = {
    settings: { providerType: 'openai', jobDescription: 'a'.repeat(60) },
    updateSettings: mockUpdateSettings,
    isConfigured: true,
    isPipelineActive: false,
    setIsPipelineActive: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAISettings as jest.Mock).mockReturnValue(mockAISettings)
  })

  it('handles pipeline branches robustly', async () => {
    ;(aiAgent.runAIGenerationPipeline as jest.Mock).mockImplementation((_1, _2, _3, cb) => {
      cb({
        message: 'M',
        summary: 'S',
        jobTitle: 'T',
        workExperiences: [],
        skills: [],
        extractedSkills: 'E',
        refinedJD: 'R',
        currentStep: 1,
        totalSteps: 5,
      })
      cb({ message: 'Next', currentStep: 2, totalSteps: 5 })
      return Promise.resolve({ refinedJD: 'Final', extractedSkills: 'Final' })
    })

    render(
      <ResumeContext.Provider value={{ resumeData: mockResumeData, setResumeData: mockSetResumeData } as any}>
        <JobDescriptionSection />
      </ResumeContext.Provider>
    )

    fireEvent.click(screen.getByTestId('run'))

    await waitFor(() => expect(mockSetResumeData).toHaveBeenCalled())
    expect(mockUpdateSettings).toHaveBeenCalledWith({ skillsToHighlight: 'E' })
    expect(mockUpdateSettings).toHaveBeenCalledWith({ jobDescription: 'R' })
  })
})
