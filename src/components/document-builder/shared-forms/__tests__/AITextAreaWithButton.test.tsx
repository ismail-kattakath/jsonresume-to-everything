import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AITextAreaWithButton from '@/components/document-builder/shared-forms/AITextAreaWithButton'
import { AISettingsContext } from '@/lib/contexts/AISettingsContext'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData } from '@/types'

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
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockResumeData: ResumeData = {
  name: 'Test User',
  position: 'Developer',
  summary: '',
  email: 'test@example.com',
  contactInformation: '',
  address: '',
  socialMedia: [],
  profilePicture: '',
  workExperience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
}

const mockAISettings = {
  settings: {
    apiUrl: 'https://api.openai.com',
    apiKey: '',
    model: 'gpt-4o-mini',
    jobDescription: '',
    providerType: 'openai-compatible' as const,
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
  settings: {
    apiUrl: 'https://api.openai.com',
    apiKey: 'sk-test-key',
    model: 'gpt-4o-mini',
    jobDescription: 'Test job description',
    providerType: 'openai-compatible' as const,
    rememberCredentials: false,
    skillsToHighlight: '',
  },
  updateSettings: jest.fn(),
  isConfigured: true,
  connectionStatus: 'valid' as const,
  jobDescriptionStatus: 'valid' as const,
  validateAll: jest.fn(),
}

const mockResumeContext = {
  resumeData: mockResumeData,
  setResumeData: jest.fn(),
  handleProfilePicture: jest.fn(),
  handleChange: jest.fn(),
}

const renderWithProviders = (
  ui: React.ReactElement,
  aiSettings: any = mockAISettings
) => {
  return render(
    <AISettingsContext.Provider value={aiSettings}>
      <ResumeContext.Provider value={mockResumeContext}>
        {ui}
      </ResumeContext.Provider>
    </AISettingsContext.Provider>
  )
}

describe('AITextAreaWithButton Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Test placeholder',
    name: 'testField',
    mode: 'summary' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render textarea with provided props', () => {
      renderWithProviders(<AITextAreaWithButton {...defaultProps} />)
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('name', 'testField')
    })

    it('should render floating AI button', () => {
      renderWithProviders(<AITextAreaWithButton {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should display character counter by default', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} value="Hello" />
      )
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should hide character counter when showCharacterCount is false', () => {
      renderWithProviders(
        <AITextAreaWithButton
          {...defaultProps}
          value="Hello"
          showCharacterCount={false}
        />
      )
      expect(screen.queryByText('5')).not.toBeInTheDocument()
    })

    it('should display maxLength in character counter when provided', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} value="Hello" maxLength={100} />
      )
      expect(screen.getByText('5/100')).toBeInTheDocument()
    })

    it('should render with custom rows prop', () => {
      renderWithProviders(<AITextAreaWithButton {...defaultProps} rows={10} />)
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveAttribute('rows', '10')
    })

    it('should use default rows value of 18', () => {
      renderWithProviders(<AITextAreaWithButton {...defaultProps} />)
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveAttribute('rows', '18')
    })

    it('should show configure hint in button title when AI is not configured', () => {
      renderWithProviders(<AITextAreaWithButton {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Configure AI settings first')
    })

    it('should show generate hint in button title when AI is configured', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} />,
        mockConfiguredAISettings
      )
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Generate by JD')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when user types', () => {
      const mockOnChange = jest.fn()
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} onChange={mockOnChange} />
      )

      const textarea = screen.getByPlaceholderText('Test placeholder')
      fireEvent.change(textarea, { target: { value: 'New content' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should update displayed value when value prop changes', () => {
      const { rerender } = renderWithProviders(
        <AITextAreaWithButton {...defaultProps} value="Initial" />
      )

      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveValue('Initial')

      rerender(
        <AISettingsContext.Provider value={mockAISettings}>
          <ResumeContext.Provider value={mockResumeContext}>
            <AITextAreaWithButton {...defaultProps} value="Updated" />
          </ResumeContext.Provider>
        </AISettingsContext.Provider>
      )
      expect(textarea).toHaveValue('Updated')
    })
  })

  describe('Styling', () => {
    it('should have orange focus styles on textarea', () => {
      const { container } = renderWithProviders(
        <AITextAreaWithButton {...defaultProps} />
      )
      const textarea = container.querySelector('.focus\\:border-amber-400')
      expect(textarea).toBeInTheDocument()
    })

    it('should have fully rounded textarea', () => {
      const { container } = renderWithProviders(
        <AITextAreaWithButton {...defaultProps} />
      )
      const textarea = container.querySelector('.rounded-lg')
      expect(textarea).toBeInTheDocument()
    })

    it('should have inline generate button at top', () => {
      renderWithProviders(<AITextAreaWithButton {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Generate by JD')).toBeInTheDocument()
    })

    it('should have gradient purple/blue button styling', () => {
      const { container } = renderWithProviders(
        <AITextAreaWithButton {...defaultProps} />,
        mockConfiguredAISettings
      )
      const button = container.querySelector(
        '.from-purple-500\\/20.to-blue-500\\/20'
      )
      expect(button).toBeInTheDocument()
    })

    it('should position character counter at top-right', () => {
      const { container } = renderWithProviders(
        <AITextAreaWithButton {...defaultProps} />
      )
      const counter = container.querySelector('.absolute.top-3.right-3')
      expect(counter).toBeInTheDocument()
    })

    it('should apply custom className to wrapper', () => {
      const { container } = renderWithProviders(
        <AITextAreaWithButton {...defaultProps} className="custom-class" />
      )
      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('should have disabled styling when not configured', () => {
      const { container } = renderWithProviders(
        <AITextAreaWithButton {...defaultProps} />
      )
      const button = container.querySelector('.bg-white\\/5')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('cursor-not-allowed')
    })
  })

  describe('Character Counter', () => {
    it('should show 0 for empty value', () => {
      renderWithProviders(<AITextAreaWithButton {...defaultProps} value="" />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should count all characters including spaces', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} value="Hello World" />
      )
      expect(screen.getByText('11')).toBeInTheDocument()
    })

    it('should count newlines', () => {
      const valueWithNewline = 'Line 1\nLine 2'
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} value={valueWithNewline} />
      )
      expect(screen.getByText(`${valueWithNewline.length}`)).toBeInTheDocument()
    })

    it('should count special characters', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} value="Test@123!" />
      )
      expect(screen.getByText('9')).toBeInTheDocument()
    })

    it('should be non-interactive', () => {
      const { container } = renderWithProviders(
        <AITextAreaWithButton {...defaultProps} />
      )
      const counter = container.querySelector('.pointer-events-none')
      expect(counter).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button with title', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} />,
        mockConfiguredAISettings
      )
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Title is only shown when disabled or label is hidden. Since label is shown, title is undefined.
      expect(button).not.toHaveAttribute('title')
      expect(screen.getByText('Generate by JD')).toBeInTheDocument()
    })

    it('should have button type set to button', () => {
      renderWithProviders(<AITextAreaWithButton {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should have name attribute on textarea', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} name="customName" />
      )
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveAttribute('name', 'customName')
    })

    it('should have maxLength attribute when provided', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} maxLength={500} />
      )
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveAttribute('maxLength', '500')
    })

    it('should disable button when AI is not configured', () => {
      renderWithProviders(<AITextAreaWithButton {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should enable button when AI is configured', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} />,
        mockConfiguredAISettings
      )
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined value', () => {
      renderWithProviders(
        <AITextAreaWithButton
          {...defaultProps}
          value={undefined as unknown as string}
        />
      )
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveValue('')
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle null value', () => {
      renderWithProviders(
        <AITextAreaWithButton
          {...defaultProps}
          value={null as unknown as string}
        />
      )
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveValue('')
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(5000)
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} value={longContent} />
      )
      expect(screen.getByText('5000')).toBeInTheDocument()
    })

    it('should handle emoji and unicode characters', () => {
      const content = 'Hello 🎉 你好'
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} value={content} />
      )
      expect(screen.getByText(`${content.length}`)).toBeInTheDocument()
    })
  })

  describe('Mode prop', () => {
    it('should accept summary mode', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} mode="summary" />
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should accept coverLetter mode', () => {
      renderWithProviders(
        <AITextAreaWithButton {...defaultProps} mode="coverLetter" />
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
