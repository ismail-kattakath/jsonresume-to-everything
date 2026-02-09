import React, { useContext } from 'react'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import ResumeEditPage from '../page'
import { ResumeContext } from '@/lib/contexts/DocumentContext'

// Mock components
jest.mock('@/components/auth/PasswordProtection', () => ({ children }: any) => (
  <div data-testid="password-protection">{children}</div>
))
jest.mock('@/components/onboarding', () => ({
  OnboardingTour: ({ children }: any) => (
    <div data-testid="onboarding-tour">{children}</div>
  ),
}))
jest.mock(
  '@/components/document-builder/ui/ScaledPreviewWrapper',
  () =>
    ({ children }: any) => <div data-testid="scaled-preview">{children}</div>
)
jest.mock('@/components/layout/MainLayout', () => ({ children }: any) => (
  <div data-testid="main-layout">{children}</div>
))
jest.mock('@/components/ui/Tooltip', () => ({
  Tooltip: () => <div data-testid="tooltip" />,
}))
jest.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/lib/pwa/registerServiceWorker', () => ({
  registerServiceWorker: jest.fn(),
}))

jest.mock('@/components/ui/DragAndDrop', () => ({
  DnDContext: ({ children }: any) => <div>{children}</div>,
  DnDDroppable: ({ children }: any) => (
    <div>{children({ innerRef: jest.fn(), droppableProps: {} }, {})}</div>
  ),
  DnDDraggable: ({ children }: any) => (
    <div>
      {children(
        { innerRef: jest.fn(), draggableProps: {}, dragHandleProps: {} },
        { isDragging: false }
      )}
    </div>
  ),
}))

jest.mock(
  '@/components/document-builder/shared-forms/PersonalInformation',
  () => {
    return () => {
      const context = useContext(
        require('@/lib/contexts/DocumentContext').ResumeContext
      ) as any
      if (!context) return null
      const { resumeData, handleChange } = context
      return (
        <div data-testid="form-personal-info">
          <input
            name="name"
            data-testid="input-name"
            value={resumeData.name || ''}
            onChange={handleChange}
          />
          <input
            name="position"
            data-testid="input-position"
            value={resumeData.position || ''}
            onChange={handleChange}
          />
        </div>
      )
    }
  }
)

jest.mock('@/components/cover-letter/forms/CoverLetterContent', () => {
  return () => {
    const context = useContext(
      require('@/lib/contexts/DocumentContext').ResumeContext
    ) as any
    if (!context) return null
    const { resumeData } = context
    return (
      <div data-testid="form-cover-letter-content">
        <span data-testid="sync-name-display">{resumeData.name}</span>
        <span data-testid="sync-position-display">{resumeData.position}</span>
      </div>
    )
  }
})

jest.mock('@/components/resume/forms/WorkExperience', () => () => (
  <div data-testid="form-work-exp">Work Experience</div>
))
jest.mock('@/components/resume/preview/Preview', () => () => (
  <div data-testid="preview-resume">Resume Preview</div>
))
jest.mock('@/components/cover-letter/preview/CoverLetterPreview', () => () => (
  <div data-testid="preview-cover-letter">Cover Letter Preview</div>
))
jest.mock('@/components/document-builder/ui/PrintButton', () => () => (
  <button>Print</button>
))
jest.mock(
  '@/components/document-builder/shared-forms/ImportExport',
  () => () => <div data-testid="import-export">Import/Export</div>
)
jest.mock('@/components/document-builder/shared-forms/AISettings', () => () => (
  <div data-testid="ai-settings">AI Settings</div>
))
jest.mock(
  '@/components/document-builder/shared-forms/SocialMedia',
  () => () => <div data-testid="social-media">Social Media</div>
)
jest.mock('@/components/resume/forms/Summary', () => () => (
  <div data-testid="summary">Summary</div>
))
jest.mock('@/components/resume/forms/Education', () => () => (
  <div data-testid="education">Education</div>
))
jest.mock('@/components/resume/forms/AdditionalSections', () => () => (
  <div data-testid="additional-info">Additional Info</div>
))
jest.mock('@/components/resume/forms/Skill', () => ({ title }: any) => (
  <div data-testid={`skill-group-${title}`}>Skills: {title}</div>
))
jest.mock('@/components/ui/AISortButton', () => ({ onClick }: any) => (
  <button data-testid="ai-sort-btn" onClick={onClick}>
    Sort
  </button>
))

const originalConfirm = window.confirm
const originalConsoleError = console.error

beforeAll(() => {
  window.confirm = jest.fn(() => true)
  console.error = jest.fn()
})
afterAll(() => {
  window.confirm = originalConfirm
  console.error = originalConsoleError
})

describe('ResumeEditPage / UnifiedEditor', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders and switches between resume and cover letter modes', () => {
    const { container } = render(<ResumeEditPage />)

    expect(screen.getByText(/AI Resume Builder/i)).toBeInTheDocument()

    const switcher = container.querySelector('#mode-switcher') as HTMLElement
    const coverLetterBtn = within(switcher).getByRole('button', {
      name: /Cover Letter/i,
    })
    fireEvent.click(coverLetterBtn)

    expect(coverLetterBtn).toHaveClass('bg-gradient-to-r')
    expect(screen.getByTestId('preview-cover-letter')).toBeInTheDocument()

    // Switch back to resume
    const resumeBtn = within(switcher).getByRole('button', { name: /Resume/i })
    fireEvent.click(resumeBtn)
    expect(resumeBtn).toHaveClass('bg-gradient-to-r')
  })

  it('manages skill groups with keyboard shortcuts', () => {
    render(<ResumeEditPage />)

    const skillsHeader = screen
      .getByText('Skills', { selector: 'h2' })
      .closest('button')
    if (skillsHeader) fireEvent.click(skillsHeader)

    const addButton = screen.getByLabelText('Add Skill Group')

    // Test Enter key to create
    fireEvent.click(addButton)
    const input1 = screen.getByPlaceholderText(/e.g., Frontend, Backend/i)
    fireEvent.change(input1, { target: { value: 'Backend' } })
    fireEvent.keyDown(input1, { key: 'Enter' })
    expect(screen.getByText('Backend')).toBeInTheDocument()
  })

  it('creates skill group via Create button', () => {
    render(<ResumeEditPage />)

    const skillsHeader = screen
      .getByText('Skills', { selector: 'h2' })
      .closest('button')
    if (skillsHeader) fireEvent.click(skillsHeader)

    const addButton = screen.getByLabelText('Add Skill Group')
    fireEvent.click(addButton)

    const input = screen.getByPlaceholderText(/e.g., Frontend, Backend/i)
    fireEvent.change(input, { target: { value: 'Frontend' } })

    const createBtn = screen.getByText('Create')
    fireEvent.click(createBtn)

    expect(screen.getByText('Frontend')).toBeInTheDocument()
  })

  it('handles cancel button in skill group creation', () => {
    render(<ResumeEditPage />)

    const skillsHeader = screen
      .getByText('Skills', { selector: 'h2' })
      .closest('button')
    if (skillsHeader) fireEvent.click(skillsHeader)

    const addButton = screen.getByLabelText('Add Skill Group')
    fireEvent.click(addButton)

    const input = screen.getByPlaceholderText(/e.g., Frontend, Backend/i)
    fireEvent.change(input, { target: { value: 'To Cancel' } })

    const cancelBtn = screen.getByText('Cancel')
    fireEvent.click(cancelBtn)

    expect(
      screen.queryByPlaceholderText(/e.g., Frontend, Backend/i)
    ).not.toBeInTheDocument()
  })

  it('handles cancel and escape in skill group creation', () => {
    render(<ResumeEditPage />)

    const skillsHeader = screen
      .getByText('Skills', { selector: 'h2' })
      .closest('button')
    if (skillsHeader) fireEvent.click(skillsHeader)

    const addButton = screen.getByLabelText('Add Skill Group')

    // Test Escape key
    fireEvent.click(addButton)
    const escapeInput = screen.getByPlaceholderText(/e.g., Frontend, Backend/i)
    fireEvent.change(escapeInput, { target: { value: 'Will Escape' } })
    fireEvent.keyDown(escapeInput, { key: 'Escape' })
    expect(screen.queryByDisplayValue('Will Escape')).not.toBeInTheDocument()
  })

  it('handles blur on empty skill group name', () => {
    render(<ResumeEditPage />)

    const skillsHeader = screen
      .getByText('Skills', { selector: 'h2' })
      .closest('button')
    if (skillsHeader) fireEvent.click(skillsHeader)

    const addButton = screen.getByLabelText('Add Skill Group')
    fireEvent.click(addButton)

    const input = screen.getByPlaceholderText(/e.g., Frontend, Backend/i)

    // Blur without entering text
    fireEvent.blur(input)

    // Input should disappear
    expect(
      screen.queryByPlaceholderText(/e.g., Frontend, Backend/i)
    ).not.toBeInTheDocument()
  })

  it('prevents form submission default behavior', () => {
    const { container } = render(<ResumeEditPage />)
    const form = container.querySelector('form')

    // Create a real submit event
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault')

    form!.dispatchEvent(submitEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('synchronizes data between resume and cover letter modes', async () => {
    render(<ResumeEditPage />)

    const personalInfoBtn = screen
      .getByText('Personal Information')
      .closest('button')
    if (personalInfoBtn) fireEvent.click(personalInfoBtn)

    const nameInput = screen.getByTestId('input-name')
    fireEvent.change(nameInput, {
      target: { name: 'name', value: 'Test User' },
    })

    const positionInput = screen.getByTestId('input-position')
    fireEvent.change(positionInput, {
      target: { name: 'position', value: 'Developer' },
    })

    await waitFor(() => {
      expect(nameInput).toHaveValue('Test User')
    })

    const switcher = document.querySelector('#mode-switcher') as HTMLElement
    const coverLetterBtn = within(switcher).getByRole('button', {
      name: /Cover Letter/i,
    })
    fireEvent.click(coverLetterBtn)

    const contentBtn = screen.getByText('Content').closest('button')
    if (contentBtn) fireEvent.click(contentBtn)

    expect(screen.getByTestId('sync-name-display')).toHaveTextContent(
      'Test User'
    )
    expect(screen.getByTestId('sync-position-display')).toHaveTextContent(
      'Developer'
    )
  })

  it('loads cover letter data from localStorage', () => {
    localStorage.setItem(
      'coverLetterData',
      JSON.stringify({
        name: 'Stored Name',
        position: 'Stored Position',
        content: 'Stored content',
      })
    )

    render(<ResumeEditPage />)

    const switcher = document.querySelector('#mode-switcher') as HTMLElement
    const coverLetterBtn = within(switcher).getByRole('button', {
      name: /Cover Letter/i,
    })
    fireEvent.click(coverLetterBtn)

    const contentBtn = screen.getByText('Content').closest('button')
    if (contentBtn) fireEvent.click(contentBtn)

    // The name should be synced from localStorage
    expect(screen.getByTestId('sync-name-display')).toHaveTextContent(
      'Stored Name'
    )
  })

  it('handles invalid localStorage data gracefully', () => {
    localStorage.setItem('coverLetterData', 'invalid json')

    // Should not throw error
    expect(() => render(<ResumeEditPage />)).not.toThrow()

    // Console.error should have been called
    expect(console.error).toHaveBeenCalledWith(
      'Error loading saved cover letter data:',
      expect.any(Error)
    )
  })

  it('toggles collapsible sections', () => {
    render(<ResumeEditPage />)

    const personalInfoBtn = screen
      .getByText('Personal Information')
      .closest('button')
    const sectionContainer = personalInfoBtn?.closest('.overflow-hidden')
    const contentDiv = sectionContainer?.querySelector(
      'div[class*="duration-300"]'
    )

    // Initially collapsed
    expect(contentDiv).toHaveClass('max-h-0')

    // Expand
    if (personalInfoBtn) fireEvent.click(personalInfoBtn)
    expect(contentDiv).toHaveClass('max-h-[10000px]')

    // Collapse
    if (personalInfoBtn) fireEvent.click(personalInfoBtn)
    expect(contentDiv).toHaveClass('max-h-0')
  })
})
