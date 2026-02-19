
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AIContentGenerator from '../AIContentGenerator'
import { AISettingsContext } from '@/lib/contexts/AISettingsContext'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData } from '@/types'

// Mock the modular AI modules
jest.mock('@/lib/ai/api', () => ({
  AIAPIError: class AIAPIError extends Error {
    constructor(
      message: string,
      public code?: string,
      public type?: string
    ) {
      super(message)
      this.name = 'AIAPIError'
    }
  },
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
  sanitizeAIError: jest.fn(err => err.message || err.toString()),
}))

jest.mock('@/lib/ai/models', () => ({
  fetchAvailableModels: jest.fn(),
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
    providerKeys: {},
  },
  updateSettings: jest.fn(),
  isConfigured: false,
  connectionStatus: 'idle' as const,
  jobDescriptionStatus: 'idle' as const,
  validateAll: jest.fn(),
  isPipelineActive: false,
  setIsPipelineActive: jest.fn(),
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
    providerKeys: {},
  },
  updateSettings: jest.fn(),
  isConfigured: true,
  connectionStatus: 'valid' as const,
  jobDescriptionStatus: 'valid' as const,
  validateAll: jest.fn(),
  isPipelineActive: false,
  setIsPipelineActive: jest.fn(),
}

const mockResumeContext = {
  resumeData: mockResumeData as any,
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

describe('AIContentGenerator Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    onGenerated: jest.fn(),
    placeholder: 'Test placeholder',
    name: 'testField',
    mode: 'summary' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render AIContentGenerator with provided props', () => {
      renderWithProviders(<AIContentGenerator {...defaultProps} />)
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('name', 'testField')
    })

    it('should render floating AI button', () => {
      renderWithProviders(<AIContentGenerator {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with custom rows prop', () => {
      renderWithProviders(<AIContentGenerator {...defaultProps} rows={10} />)
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveAttribute('rows', '10')
    })

    it('should use default rows value of 18', () => {
      renderWithProviders(<AIContentGenerator {...defaultProps} />)
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveAttribute('rows', '18')
    })

    it('should show configure hint in button title when AI is not configured', () => {
      renderWithProviders(<AIContentGenerator {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Configure AI settings first')
    })

    it('should show generate hint in button title when AI is configured', () => {
      renderWithProviders(
        <AIContentGenerator {...defaultProps} />,
        mockConfiguredAISettings
      )
      const button = screen.getByRole('button', { name: /generate by jd/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when user types', () => {
      const mockOnChange = jest.fn()
      const mockOnGenerated = jest.fn()
      renderWithProviders(
        <AIContentGenerator
          value=""
          onChange={mockOnChange}
          onGenerated={mockOnGenerated}
          name="test-input"
          placeholder="Enter text..."
          mode="summary"
        />
      )
      const textarea = screen.getByPlaceholderText('Enter text...')
      fireEvent.change(textarea, { target: { value: 'New content' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should update displayed value when value prop changes', () => {
      const { rerender } = renderWithProviders(
        <AIContentGenerator {...defaultProps} value="Initial" />
      )

      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveValue('Initial')

      rerender(
        <AISettingsContext.Provider value={mockAISettings}>
          <ResumeContext.Provider value={mockResumeContext}>
            <AIContentGenerator {...defaultProps} value="Updated" />
          </ResumeContext.Provider>
        </AISettingsContext.Provider>
      )
      expect(textarea).toHaveValue('Updated')
    })
  })

  describe('Styling', () => {
    it('should have orange focus styles on textarea', () => {
      const { container } = renderWithProviders(
        <AIContentGenerator {...defaultProps} />
      )
      const textarea = container.querySelector('.focus\\:border-amber-400')
      expect(textarea).toBeInTheDocument()
    })

    it('should have fully rounded textarea', () => {
      const { container } = renderWithProviders(
        <AIContentGenerator {...defaultProps} />
      )
      const textarea = container.querySelector('.rounded-lg')
      expect(textarea).toBeInTheDocument()
    })

    it('should have inline generate button at top', () => {
      renderWithProviders(<AIContentGenerator {...defaultProps} />)
      const button = screen.getByRole('button', { name: /generate by jd/i })
      expect(button).toBeInTheDocument()
    })

    it('should have gradient amber button styling', () => {
      const { container } = renderWithProviders(
        <AIContentGenerator {...defaultProps} />,
        mockConfiguredAISettings
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gradient-to-r')
    })

    it('should apply custom className to wrapper', () => {
      const { container } = renderWithProviders(
        <AIContentGenerator {...defaultProps} className="custom-class" />
      )
      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('should have disabled styling when not configured', () => {
      const { container } = renderWithProviders(
        <AIContentGenerator {...defaultProps} />
      )
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('cursor-not-allowed')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button with title', () => {
      renderWithProviders(
        <AIContentGenerator {...defaultProps} />,
        mockConfiguredAISettings
      )
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Title always shows when showLabel is false (aiShowLabel=false is the default) to show tooltip
      expect(button).toHaveAttribute('title', 'Generate by JD')
      expect(screen.getByRole('button', { name: /generate by jd/i })).toBeInTheDocument()
    })

    it('should have button type set to button', () => {
      renderWithProviders(<AIContentGenerator {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should have name attribute on textarea', () => {
      renderWithProviders(
        <AIContentGenerator {...defaultProps} name="customName" />
      )
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveAttribute('name', 'customName')
    })

    it('should have maxLength attribute when provided', () => {
      renderWithProviders(
        <AIContentGenerator {...defaultProps} maxLength={500} />
      )
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveAttribute('maxLength', '500')
    })

    it('should disable button when AI is not configured', () => {
      renderWithProviders(<AIContentGenerator {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should enable button when AI is configured', () => {
      renderWithProviders(
        <AIContentGenerator {...defaultProps} />,
        mockConfiguredAISettings
      )
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle emoji and unicode characters', () => {
      const content = 'Hello 🎉 你好'
      renderWithProviders(
        <AIContentGenerator {...defaultProps} value={content} />
      )
      const textarea = screen.getByPlaceholderText('Test placeholder')
      expect(textarea).toHaveValue(content)
    })
  })

  describe('Mode prop', () => {
    it('should accept summary mode', () => {
      renderWithProviders(
        <AIContentGenerator {...defaultProps} mode="summary" />
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should accept coverLetter mode', () => {
      renderWithProviders(
        <AIContentGenerator {...defaultProps} mode="coverLetter" />
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
