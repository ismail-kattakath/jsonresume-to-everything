import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import {
  DocumentContext,
  DocumentContextType,
} from '@/lib/contexts/DocumentContext'
import {
  AISettingsContext,
  AISettingsContextType,
} from '@/lib/contexts/AISettingsContext'
import resumeData from '@/lib/resumeAdapter'
import type { ResumeData } from '@/types'

/**
 * Creates a mock DocumentContext value for testing
 */
export const createMockDocumentContext = (
  overrides?: Partial<DocumentContextType>
): DocumentContextType => {
  return {
    resumeData: resumeData,
    setResumeData: jest.fn(),
    handleProfilePicture: jest.fn(),
    handleChange: jest.fn(),
    editable: true,
    ...overrides,
  }
}

/**
 * Creates mock resume data for testing
 */
export const createMockResumeData = (
  overrides?: Partial<ResumeData>
): ResumeData => {
  return {
    name: 'Test User',
    position: 'Test Position',
    contactInformation: '+1 (555) 123-4567',
    email: 'test@example.com',
    address: '123 Test St, Test City, TC 12345',
    profilePicture: '',
    calendarLink: '',
    socialMedia: [],
    summary: 'Test summary',
    education: [],
    workExperience: [],
    skills: [{ title: 'Test Skills', skills: [] }],
    languages: [],
    certifications: [],
    content: '',
    ...overrides,
  }
}

/**
 * Creates a mock AISettingsContext value for testing
 */
export const createMockAISettingsContext = (
  overrides?: Partial<AISettingsContextType>
): AISettingsContextType => {
  return {
    settings: {
      apiUrl: 'https://api.openai.com',
      apiKey: '',
      model: 'gpt-4o-mini',
      jobDescription: '',
      providerType: 'openai-compatible',
      skillsToHighlight: '',
      providerKeys: {},
      rememberCredentials: true,
    },
    updateSettings: jest.fn(),
    isConfigured: false,
    connectionStatus: 'idle',
    jobDescriptionStatus: 'idle',
    validateAll: jest.fn().mockResolvedValue(false),
    isPipelineActive: false,
    setIsPipelineActive: jest.fn(),
    ...overrides,
  }
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  contextValue?: Partial<DocumentContextType>
  aiSettingsValue?: Partial<AISettingsContextType>
  resumeData?: Partial<ResumeData>
  setResumeData?: jest.Mock
  aiSettings?: {
    apiUrl: string
    apiKey: string
    model: string
    jobDescription: string
    providerType: 'openai-compatible' | 'gemini'
    rememberCredentials: boolean
    skillsToHighlight: string
    providerKeys: Record<string, string>
  }
}

/**
 * Custom render function that wraps components with DocumentContext and AISettingsContext
 */
export const renderWithContext = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const {
    contextValue,
    aiSettingsValue,
    resumeData: resumeDataOverride,
    setResumeData,
    aiSettings,
    ...renderOptions
  } = options || {}

  // Build context value with resume data override
  const contextOverrides: Partial<DocumentContextType> = {
    ...contextValue,
  }
  if (resumeDataOverride) {
    contextOverrides.resumeData = createMockResumeData(resumeDataOverride)
  }
  if (setResumeData) {
    contextOverrides.setResumeData = setResumeData
  }

  // Build AI settings with custom settings
  const aiSettingsOverrides: Partial<AISettingsContextType> = {
    ...aiSettingsValue,
  }
  if (aiSettings) {
    aiSettingsOverrides.settings = aiSettings
    aiSettingsOverrides.isConfigured =
      !!aiSettings.apiUrl &&
      !!aiSettings.apiKey &&
      !!aiSettings.model &&
      !!aiSettings.jobDescription
  }

  const mockContextValue = createMockDocumentContext(contextOverrides)
  const mockAISettingsValue = createMockAISettingsContext(aiSettingsOverrides)

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AISettingsContext.Provider value={mockAISettingsValue}>
      <DocumentContext.Provider value={mockContextValue}>
        {children}
      </DocumentContext.Provider>
    </AISettingsContext.Provider>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockContextValue,
    mockAISettingsValue,
  }
}

/**
 * Alias for renderWithContext - provides a more intuitive name for tests
 */
export const renderWithProviders = renderWithContext

/**
 * Helper to get form elements by their floating labels
 */
export const getInputByLabel = (container: HTMLElement, labelText: string) => {
  const label = Array.from(container.querySelectorAll('.floating-label')).find(
    (el) => el.textContent === labelText
  )

  if (!label) {
    throw new Error(`Could not find input with label: ${labelText}`)
  }

  // Get the input element that is a sibling of the label
  const input = label.parentElement?.querySelector('input, textarea')

  if (!input) {
    throw new Error(`Could not find input element for label: ${labelText}`)
  }

  return input
}

/**
 * Helper to simulate user typing in an input
 */
export const typeInInput = (
  input: Element,
  value: string,
  eventName = 'change'
) => {
  const event = new Event(eventName, { bubbles: true })
  Object.defineProperty(event, 'target', {
    writable: false,
    value: { value, name: input.getAttribute('name') },
  })
  input.dispatchEvent(event)
}

/**
 * Mock data for testing different form sections
 */
export const mockFormData = {
  personalInfo: {
    name: 'John Doe',
    position: 'Software Engineer',
    contactInformation: '+1 (555) 123-4567',
    email: 'john@example.com',
    address: '123 Main St, Toronto, ON M5H 2N2',
  },
  socialMedia: [
    { socialMedia: 'Github', link: 'github.com/johndoe' },
    { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
  ],
  workExperience: [
    {
      organization: 'Tech Corp',
      url: 'techcorp.com',
      position: 'Senior Developer',
      description: 'Led development projects',
      keyAchievements: [{ text: 'Increased performance by 50%' }],
      startYear: '2020-01-01',
      endYear: 'Present',
      technologies: ['React', 'Node.js'],
    },
  ],
  education: [
    {
      school: 'University of Toronto',
      url: 'utoronto.ca',
      studyType: "Bachelor's Degree in Computer Science",
      startYear: '2015-09-01',
      endYear: '2019-06-01',
    },
  ],
  skills: [
    {
      title: 'Programming Languages',
      skills: [
        { text: 'JavaScript', highlight: true },
        { text: 'Python', highlight: false },
      ],
    },
  ],
  languages: ['English', 'French'],
  certifications: [
    {
      name: 'AWS Certified',
      date: '2022',
      issuer: 'Amazon',
      url: 'aws.com',
    },
  ],
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
