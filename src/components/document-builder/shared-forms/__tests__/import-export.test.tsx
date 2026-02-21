import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ImportExport from '@/components/document-builder/shared-forms/import-export'
import { ResumeContext } from '@/lib/contexts/document-context'
import { toast } from 'sonner'
import { analytics } from '@/lib/analytics'
import { createMockResumeData } from '@/lib/__tests__/test-utils'
import * as jsonResume from '@/lib/json-resume'
import * as jsonResumeSchema from '@/lib/json-resume-schema'
import AIActionButton from '@/components/ui/ai-action-button'

// Mock AIActionButton locally to avoid AISettingsContext requirements
jest.mock('@/components/ui/ai-action-button', () => ({
  __esModule: true,
  default: ({ onClick, label }: any) => (
    <button onClick={onClick} aria-label={label}>
      {label}
    </button>
  ),
}))

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/lib/json-resume', () => ({
  convertToJSONResume: jest.fn(),
  convertFromJSONResume: jest.fn(),
}))

jest.mock('@/lib/json-resume-schema', () => ({
  validateJSONResume: jest.fn(),
}))

jest.mock('@/lib/analytics', () => ({
  analytics: {
    resumeImport: jest.fn(),
    resumeExport: jest.fn(),
  },
}))

describe('ImportExport', () => {
  const mockSetResumeData = jest.fn()
  const mockResumeData: any = {
    name: 'John Doe',
    position: 'Software Engineer',
    contactInformation: '123-456-7890',
    email: 'john@example.com',
    address: '123 Main St',
    profilePicture: '',
    socials: [],
    summary: 'Summary',
    workExperience: [],
    education: [],
    projects: [],
    skills: [
      {
        category: 'Languages',
        skills: [{ text: 'TypeScript', highlight: true }],
      },
    ],
  }

  const renderComponent = (props = {}) => {
    return render(
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
        <ImportExport {...props} />
      </ResumeContext.Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
  })

  it('renders all buttons by default', () => {
    renderComponent()
    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Reset All')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument()
  })

  it('hides buttons based on props', () => {
    renderComponent({ hideExportButton: true, hidePrintButton: true })
    expect(screen.queryByText('Export')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /print/i })).not.toBeInTheDocument()
  })

  it('handles reset correctly when confirmed', () => {
    renderComponent()
    const resetButton = screen.getByText('Reset All')
    fireEvent.click(resetButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(mockSetResumeData).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('All data reset successfully', expect.any(Object))
  })

  it('does not reset when cancelled', () => {
    ;(window.confirm as jest.Mock).mockReturnValue(false)
    renderComponent()
    const resetButton = screen.getByText('Reset All')
    fireEvent.click(resetButton)

    expect(mockSetResumeData).not.toHaveBeenCalled()
  })

  it('handles JSON import correctly', async () => {
    const file = new File(['{"basics": {"name": "Imported"}}'], 'resume.json', { type: 'application/json' })
    ;(jsonResumeSchema.validateJSONResume as jest.Mock).mockReturnValue({ valid: true })
    ;(jsonResume.convertFromJSONResume as jest.Mock).mockReturnValue({ name: 'Imported' })

    renderComponent()
    const input = screen.getByLabelText('Import JSON Resume') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    // Since handleImport uses FileReader, we wait for the effect
    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalledWith('Processing resume data...', expect.any(Object))
    })
  })

  it('handles import with migration and preservation', async () => {
    const setResumeData = jest.fn()
    const initialData = createMockResumeData({ content: 'Preserve me' })

    render(
      <ResumeContext.Provider
        value={
          {
            resumeData: initialData,
            setResumeData,
          } as any
        }
      >
        <ImportExport preserveContent={true} />
      </ResumeContext.Provider>
    )

    // Mock FileReader
    const mockResult = JSON.stringify({
      basics: { name: 'New' },
      skills: [
        {
          name: 'S1',
          skills: ['SkillA', { text: 'SkillB', underline: true }],
        },
      ],
    })

    const file = new File([mockResult], 'resume.json', { type: 'application/json' })
    const input = screen.getByLabelText('Import JSON Resume')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(setResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Preserve me',
        })
      )
    })
  })

  it('handles invalid JSON Resume import', async () => {
    ;(jsonResumeSchema.validateJSONResume as jest.Mock).mockReturnValue({
      valid: false,
      errors: ['Validation failed'],
    })

    renderComponent()

    const mockResult = JSON.stringify({ basics: { name: 'Invalid' } })
    const file = new File([mockResult], 'resume.json', { type: 'application/json' })
    const input = screen.getByLabelText('Import JSON Resume')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid JSON Resume format'),
        expect.any(Object)
      )
    })
  })

  it('handles failed conversion during import', async () => {
    ;(jsonResumeSchema.validateJSONResume as jest.Mock).mockReturnValue({ valid: true, errors: [] })
    ;(jsonResume.convertFromJSONResume as jest.Mock).mockReturnValue(null)

    renderComponent()

    const mockResult = JSON.stringify({ basics: { name: 'Fail' } })
    const file = new File([mockResult], 'resume.json', { type: 'application/json' })
    const input = screen.getByLabelText('Import JSON Resume')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to convert JSON Resume format', expect.any(Object))
    })
  })

  it('handles export correctly', () => {
    ;(jsonResume.convertToJSONResume as jest.Mock).mockReturnValue({ basics: { name: 'Exported' } })

    // Mock URL and createElement for download logic
    const mockURL = 'blob:test'
    global.URL.createObjectURL = jest.fn(() => mockURL)
    const linkSpy = { click: jest.fn(), href: '', download: '' }

    // Use a spy that only intercepts 'a' and calls original otherwise
    const nativeCreateElement = Document.prototype.createElement
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') return linkSpy as any
      return nativeCreateElement.call(document, tagName)
    })

    renderComponent()
    const exportButton = screen.getByText('Export')
    fireEvent.click(exportButton)

    expect(jsonResume.convertToJSONResume).toHaveBeenCalledWith(mockResumeData)
    expect(toast.success).toHaveBeenCalledWith('JSON Resume exported successfully!', expect.any(Object))

    createElementSpy.mockRestore()
  })

  it('returns early in handleImportClick if click is missing', () => {
    // Mock ref missing click
    const nativeCreateElement = Document.prototype.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = nativeCreateElement.call(document, tagName)
      if (tagName === 'input') {
        Object.defineProperty(el, 'click', { value: undefined, configurable: true })
      }
      return el
    })

    renderComponent()
    const importButton = screen.getByText('Import')
    fireEvent.click(importButton)
    // No error should occur
  })
})
