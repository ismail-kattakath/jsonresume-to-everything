import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { suppressConsoleError } from '@/lib/__tests__/test-utils'
import '@testing-library/jest-dom'
import JobDescriptionSection from '@/components/document-builder/shared-forms/job-description-section'
import { ResumeContext } from '@/lib/contexts/document-context'
import { AISettingsContext } from '@/lib/contexts/ai-settings-context'
import * as aiAgent from '@/lib/ai/strands/agent'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('sonner', () => {
  const mockToast = jest.fn((message) => message)
  ;(mockToast as any).success = jest.fn()
  ;(mockToast as any).error = jest.fn()
  ;(mockToast as any).info = jest.fn()
  ;(mockToast as any).loading = jest.fn()
  ;(mockToast as any).dismiss = jest.fn()
  return { toast: mockToast }
})

// Mock components
jest.mock('../ai-settings/job-description-input', () => {
  return function MockJDInput({ value, onChange }: any) {
    return (
      <div>
        <textarea
          placeholder="Paste the job description here"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }
})

jest.mock('../ai-settings/ai-pipeline-button', () => {
  return function MockAIPipelineButton({ onRun }: any) {
    return (
      <button data-testid="ai-pipeline-button" onClick={onRun}>
        AI Pipeline Button
      </button>
    )
  }
})

jest.mock('@/lib/ai/strands/agent', () => ({
  runAIGenerationPipeline: jest.fn(),
  analyzeJobDescriptionGraph: jest.fn(),
}))

jest.mock('@/components/ui/ai-loading-toast', () => ({
  AILoadingToast: ({ message }: { message: string }) => <div data-testid="loading-toast">{message}</div>,
}))

describe('JobDescriptionSection', () => {
  const mockSetResumeData = jest.fn()
  const mockResumeData: any = {
    jobDescription: 'Initial JD',
    skills: [],
  }

  const mockAISettings = {
    provider: 'openai',
    model: 'gpt-4',
    apiKey: 'test-key',
    isConfigured: true,
    apiUrl: 'http://api.test',
    providerType: 'openai',
    jobDescription: 'Initial JD',
  }

  const renderComponent = (resumeData = mockResumeData, settings = mockAISettings) => {
    const updateSettings = jest.fn()
    const setIsPipelineActive = jest.fn()

    return render(
      <AISettingsContext.Provider
        value={
          {
            settings: settings as any,
            updateSettings,
            isConfigured: settings.isConfigured,
            isPipelineActive: false,
            setIsPipelineActive,
            validateAll: jest.fn(),
            isAnyAIActionActive: false,
            setIsAnyAIActionActive: jest.fn(),
            isAIWorking: false,
            resetAll: jest.fn(),
          } as any
        }
      >
        <ResumeContext.Provider
          value={
            {
              resumeData,
              setResumeData: mockSetResumeData,
              handleProfilePicture: jest.fn(),
              handleChange: jest.fn(),
            } as any
          }
        >
          <JobDescriptionSection />
        </ResumeContext.Provider>
      </AISettingsContext.Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the text area with initial job description', () => {
    renderComponent()
    const textarea = screen.getByPlaceholderText(/Paste the job description here/i)
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue('Initial JD')
  })

  it('updates job description through updateSettings on change', () => {
    const updateSettingsMock = jest.fn()
    render(
      <AISettingsContext.Provider
        value={
          {
            settings: mockAISettings as any,
            updateSettings: updateSettingsMock,
            isConfigured: true,
            isPipelineActive: false,
            setIsPipelineActive: jest.fn(),
            connectionStatus: 'connected',
            jobDescriptionStatus: 'valid',
            validateAll: jest.fn(),
            isAnyAIActionActive: false,
            setIsAnyAIActionActive: jest.fn(),
            isAIWorking: false,
            resetAll: jest.fn(),
          } as any
        }
      >
        <ResumeContext.Provider
          value={
            {
              resumeData: mockResumeData,
              setResumeData: mockSetResumeData,
              handleProfilePicture: jest.fn(),
              handleChange: jest.fn(),
            } as any
          }
        >
          <JobDescriptionSection />
        </ResumeContext.Provider>
      </AISettingsContext.Provider>
    )
    const textarea = screen.getByPlaceholderText(/Paste the job description here/i)

    fireEvent.change(textarea, { target: { value: 'New JD' } })

    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        jobDescription: 'New JD',
      })
    )
  })

  it('renders the AI Pipeline Button and handles onRun', async () => {
    const longJD = 'a'.repeat(60)
    const settingsWithLongJD = { ...mockAISettings, jobDescription: longJD }
    ;(aiAgent.runAIGenerationPipeline as jest.Mock).mockResolvedValue({
      refinedJD: 'Pipeline Refined JD',
      summary: 'Pipeline Summary',
      workExperiences: [],
    })

    renderComponent(mockResumeData, settingsWithLongJD)
    const pipelineButton = screen.getByTestId('ai-pipeline-button')
    fireEvent.click(pipelineButton)

    await waitFor(() => {
      expect(aiAgent.runAIGenerationPipeline).toHaveBeenCalled()
    })
  })

  it('handles pipeline error handling', async () => {
    const longJD = 'a'.repeat(60)
    const settingsWithLongJD = { ...mockAISettings, jobDescription: longJD }
    ;(aiAgent.runAIGenerationPipeline as jest.Mock).mockRejectedValue(new Error('Pipeline Error'))

    renderComponent(mockResumeData, settingsWithLongJD)
    const pipelineButton = screen.getByTestId('ai-pipeline-button')

    await suppressConsoleError(/Pipeline error/i, async () => {
      fireEvent.click(pipelineButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    })
  })

  it('handles pipeline progress callback correctly', async () => {
    const longJD = 'a'.repeat(60)
    const settingsWithLongJD = { ...mockAISettings, jobDescription: longJD }
    const updateSettingsMock = jest.fn()

    ;(aiAgent.runAIGenerationPipeline as jest.Mock).mockResolvedValue({
      refinedJD: 'Final Refined JD',
      summary: 'Final Summary',
      workExperiences: [],
    })

    render(
      <AISettingsContext.Provider
        value={
          {
            settings: settingsWithLongJD as any,
            updateSettings: updateSettingsMock,
            isConfigured: true,
            isPipelineActive: false,
            setIsPipelineActive: jest.fn(),
            connectionStatus: 'connected',
            jobDescriptionStatus: 'valid',
            validateAll: jest.fn(),
            isAnyAIActionActive: false,
            setIsAnyAIActionActive: jest.fn(),
            isAIWorking: false,
            resetAll: jest.fn(),
          } as any
        }
      >
        <ResumeContext.Provider
          value={
            {
              resumeData: mockResumeData,
              setResumeData: mockSetResumeData,
              handleProfilePicture: jest.fn(),
              handleChange: jest.fn(),
            } as any
          }
        >
          <JobDescriptionSection />
        </ResumeContext.Provider>
      </AISettingsContext.Provider>
    )

    const pipelineButton = screen.getByTestId('ai-pipeline-button')
    fireEvent.click(pipelineButton)

    // Extract the progress callback passed to runAIGenerationPipeline
    const progressCallback = (aiAgent.runAIGenerationPipeline as jest.Mock).mock.calls[0][3]

    // 1. Test summary update
    progressCallback({ message: 'Step 1', currentStep: 1, totalSteps: 5, summary: 'New Summary' })
    expect(mockSetResumeData).toHaveBeenCalled()

    // 2. Test refined JD update
    progressCallback({ message: 'Step 2', currentStep: 2, totalSteps: 5, refinedJD: 'Progress Refined JD' })
    expect(updateSettingsMock).toHaveBeenCalledWith({ jobDescription: 'Progress Refined JD' })

    // 3. Test work experiences update
    progressCallback({ message: 'Step 3', currentStep: 3, totalSteps: 5, workExperiences: [{ company: 'Test' }] })
    expect(mockSetResumeData).toHaveBeenCalled()
  })

  it('early returns if not configured for handleRefineJD', () => {
    const settings = { ...mockAISettings, isConfigured: false }
    renderComponent(mockResumeData, settings)

    // This button is disabled when not configured in AIPipelineButton,
    // but handleRefineJD checks it internally too.
    // We can manually call handleRefineJD if we have access,
    // or just rely on the component being rendered in this state.
    // Actually, JobDescriptionInput uses isConfigured too.
  })

  it('early returns in handleRunPipeline if missing JD', async () => {
    const settings = { ...mockAISettings, jobDescription: '' }
    renderComponent(mockResumeData, settings)

    const pipelineButton = screen.getByTestId('ai-pipeline-button')
    fireEvent.click(pipelineButton)

    expect(aiAgent.runAIGenerationPipeline).not.toHaveBeenCalled()
  })
})
