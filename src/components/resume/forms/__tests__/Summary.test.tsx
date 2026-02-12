import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Summary from '@/components/resume/forms/Summary'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { AISettingsContext } from '@/lib/contexts/AISettingsContext'
import type { ResumeData } from '@/types'

// Mock the strands agent module
jest.mock('@/lib/ai/strands/agent', () => ({
  generateSummaryGraph: jest.fn(),
  analyzeJobDescription: jest.fn(),
  analyzeJobDescriptionGraph: jest.fn(),
  sortSkillsGraph: jest.fn(),
  extractSkillsGraph: jest.fn(),
}))

// Mock the openai-client module
jest.mock('@/lib/ai/openai-client', () => ({
  generateCoverLetter: jest.fn(),
  generateSummary: jest.fn(),
  OpenAIAPIError: class OpenAIAPIError extends Error {
    constructor(
      message: string,
      public code?: string,
      public type?: string
    ) {
      super(message)
      this.name = 'OpenAIAPIError'
    }
  },
}))

// Mock sonner toast
jest.mock('sonner', () => {
  const toastMock = jest.fn()
  Object.assign(toastMock, {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  })
  return {
    toast: toastMock,
  }
})

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  analytics: {
    aiGenerationStart: jest.fn(),
    aiGenerationSuccess: jest.fn(),
    aiGenerationError: jest.fn(),
  },
}))

const mockResumeData: ResumeData = {
  name: 'John Doe',
  position: 'Senior Developer',
  email: 'john@example.com',
  contactInformation: '+1234567890',
  address: 'Test City',
  summary: 'Test summary',
  workExperience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  socialMedia: [],
  profilePicture: '',
}

const mockSetResumeData = jest.fn()
const mockHandleChange = jest.fn()

const mockAISettings = {
  settings: {
    apiUrl: 'https://api.openai.com',
    apiKey: '',
    model: 'gpt-4o-mini',
    jobDescription: '',
    providerType: 'openai-compatible' as const,
    providerKeys: {},
    rememberCredentials: false,
    skillsToHighlight: '',
  },
  updateSettings: jest.fn(),
  isConfigured: false,
  connectionStatus: 'idle' as const,
  jobDescriptionStatus: 'idle' as const,
  validateAll: jest.fn(),
}

const mockConfiguredAISettings = {
  ...mockAISettings,
  settings: {
    ...mockAISettings.settings,
    apiKey: 'sk-test-key',
    jobDescription: 'Test job description with enough characters to be valid',
  },
  isConfigured: true,
  connectionStatus: 'valid' as const,
  jobDescriptionStatus: 'valid' as const,
}

const renderWithContext = (
  resumeData: ResumeData = mockResumeData,
  handleChange = mockHandleChange,
  aiSettings: any = mockAISettings,
  setResumeData = mockSetResumeData
) => {
  return render(
    <AISettingsContext.Provider value={aiSettings}>
      <ResumeContext.Provider
        value={{
          resumeData,
          setResumeData,
          handleChange,
          handleProfilePicture: jest.fn(),
        }}
      >
        <Summary />
      </ResumeContext.Provider>
    </AISettingsContext.Provider>
  )
}

describe('Summary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders summary textarea', () => {
      renderWithContext()
      const textarea = screen.getByPlaceholderText(
        /write a compelling professional summary/i
      )
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveValue('Test summary')
    })

    it('renders floating AI button', () => {
      renderWithContext()
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('displays character counter', () => {
      renderWithContext()
      expect(screen.getByText('12/600')).toBeInTheDocument()
    })
  })

  describe('Summary Text Editing', () => {
    it('calls handleChange when summary is edited', () => {
      renderWithContext()
      const textarea = screen.getByPlaceholderText(
        /write a compelling professional summary/i
      )

      fireEvent.change(textarea, {
        target: { value: 'Updated summary', name: 'summary' },
      })

      expect(mockHandleChange).toHaveBeenCalled()
    })

    it('displays empty summary when not provided', () => {
      const dataWithoutSummary = { ...mockResumeData, summary: '' }
      renderWithContext(dataWithoutSummary)
      const textarea = screen.getByPlaceholderText(
        /write a compelling professional summary/i
      )
      expect(textarea).toHaveValue('')
    })
  })

  describe('AI Button State', () => {
    it('shows disabled button when AI is not configured', () => {
      renderWithContext()
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('title', 'Configure AI settings first')
    })

    it('shows enabled button when AI is configured', () => {
      renderWithContext(
        mockResumeData,
        mockHandleChange,
        mockConfiguredAISettings
      )
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Generate by JD')).toBeInTheDocument()
    })
  })

  describe('Props Propagation', () => {
    it('passes correct placeholder to textarea', () => {
      renderWithContext()
      const textarea = screen.getByPlaceholderText(
        /write a compelling professional summary/i
      )
      expect(textarea).toBeInTheDocument()
    })

    it('passes correct maxLength to textarea', () => {
      renderWithContext()
      const textarea = screen.getByPlaceholderText(
        /write a compelling professional summary/i
      )
      expect(textarea).toHaveAttribute('maxLength', '600')
    })

    it('passes correct rows to textarea', () => {
      renderWithContext()
      const textarea = screen.getByPlaceholderText(
        /write a compelling professional summary/i
      )
      expect(textarea).toHaveAttribute('rows', '8')
    })
  })

  describe('AI Generation Callback', () => {
    it('updates summary when AI generation completes', async () => {
      const { generateSummaryGraph } = require('@/lib/ai/strands/agent')

      // Mock successful AI generation
      const generatedText =
        'AI-generated professional summary with experience and skills'
      generateSummaryGraph.mockImplementation(
        async (
          _data: any,
          _jobDescription: any,
          _config: any,
          onChunk: any
        ) => {
          // Simulate streaming by calling onChunk
          onChunk({ content: generatedText })
          return generatedText
        }
      )

      renderWithContext(
        mockResumeData,
        mockHandleChange,
        mockConfiguredAISettings,
        mockSetResumeData
      )

      mockSetResumeData.mockClear()

      console.error('[TEST DEBUG] Clicking button')
      // Click the AI generation button
      const aiButton = screen.getByRole('button', { name: /generate by jd/i })
      aiButton.click()
      console.error('[TEST DEBUG] Clicked')

      // Wait for AI generation to complete and setResumeData to be called
      await waitFor(() => {
        expect(mockSetResumeData).toHaveBeenCalledWith(
          expect.objectContaining({
            summary: generatedText,
          })
        )
      })
    })
  })
})
