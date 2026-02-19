// @ts-nocheck
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImportExport from '@/components/document-builder/shared-forms/ImportExport'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { convertToJSONResume, convertFromJSONResume } from '@/lib/jsonResume'
import { validateJSONResume } from '@/lib/jsonResumeSchema'
import { toast } from 'sonner'
import type { ResumeData } from '@/types/resume'

// Mock dependencies
jest.mock('@/lib/jsonResume')
jest.mock('@/lib/jsonResumeSchema')
jest.mock('@/lib/analytics')
jest.mock('../../ui/PrintButton', () => ({
  __esModule: true,
  default: () => <div data-testid="print-button">Print</div>,
}))

jest.mock('sonner', () => {
  const m = jest.fn() as any
  m.success = jest.fn()
  m.error = jest.fn()
  m.promise = jest.fn()
  m.loading = jest.fn()
  m.dismiss = jest.fn()
  return { toast: m }
})

const mockToast = toast as any

const mockConvertToJSONResume = convertToJSONResume as jest.MockedFunction<
  typeof convertToJSONResume
>
const mockConvertFromJSONResume = convertFromJSONResume as jest.MockedFunction<
  typeof convertFromJSONResume
>
const mockValidateJSONResume = validateJSONResume as jest.MockedFunction<
  typeof validateJSONResume
>

const mockResumeData: ResumeData = {
  name: 'John Doe',
  position: 'Senior Developer',
  email: 'john@example.com',
  phone: '+1234567890',
  location: 'Test City',
  summary: 'Test summary',
  website: 'https://example.com',
  workExperience: [],
  education: [],
  skillGroups: [],
  projects: [],
  certifications: [],
  languages: [],
  socialMedia: {
    linkedin: '',
    github: '',
    twitter: '',
  },
}

const mockSetResumeData = jest.fn()

const renderWithContext = (
  resumeData: ResumeData = mockResumeData,
  props = {}
) => {
  return render(
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData: mockSetResumeData,
      }}
    >
      <ImportExport {...props} />
    </ResumeContext.Provider>
  )
}

describe('ImportExport Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()
  })

  describe('Rendering', () => {
    it('renders import button by default', () => {
      renderWithContext()
      expect(screen.getByText('Import')).toBeInTheDocument()
      expect(screen.getByLabelText(/import json resume/i)).toBeInTheDocument()
    })

    it('renders export button by default', () => {
      renderWithContext()
      expect(
        screen.getByRole('button', { name: /export json resume/i })
      ).toBeInTheDocument()
    })

    it('renders reset button by default', () => {
      renderWithContext()
      expect(
        screen.getByRole('button', { name: /reset/i })
      ).toBeInTheDocument()
    })

    it('renders print button by default', () => {
      renderWithContext()
      expect(screen.getByText(/print/i)).toBeInTheDocument()
    })

    it('hides export button when hideExportButton is true', () => {
      renderWithContext(mockResumeData, { hideExportButton: true })
      expect(
        screen.queryByRole('button', { name: /export json resume/i })
      ).not.toBeInTheDocument()
    })

    it('hides print button when hidePrintButton is true', () => {
      renderWithContext(mockResumeData, { hidePrintButton: true })
      expect(screen.queryByText(/print/i)).not.toBeInTheDocument()
    })
  })

  describe('Import Functionality', () => {
    it('imports valid JSON Resume format', async () => {
      const jsonResumeData = {
        $schema:
          'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
        basics: {
          name: 'Jane Smith',
          position: 'Developer',
          email: 'jane@example.com',
        },
      }

      mockValidateJSONResume.mockReturnValue({ valid: true, errors: [] })
      mockConvertFromJSONResume.mockReturnValue({
        ...mockResumeData,
        name: 'Jane Smith',
      })

      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File([JSON.stringify(jsonResumeData)], 'resume.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.loading).toHaveBeenCalledWith(
          'Processing resume data...',
          { id: 'import-resume' }
        )
      })

      await waitFor(() => {
        expect(mockValidateJSONResume).toHaveBeenCalledWith(jsonResumeData)
        expect(mockConvertFromJSONResume).toHaveBeenCalledWith(jsonResumeData)
        expect(mockSetResumeData).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith(
          'JSON Resume imported successfully!',
          { id: 'import-resume' }
        )
      })
    })

    it('imports internal format resume', async () => {
      const internalFormatData = {
        name: 'Test User',
        position: 'Developer',
        skills: [
          {
            category: 'Programming',
            skills: ['JavaScript', 'TypeScript'],
          },
        ],
      }

      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File(
        [JSON.stringify(internalFormatData)],
        'resume.json',
        { type: 'application/json' }
      )

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockSetResumeData).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith(
          'Resume data imported successfully!',
          { id: 'import-resume' }
        )
      })
    })

    it('handles invalid JSON Resume format', async () => {
      const invalidData = {
        $schema: 'https://jsonresume.org/schema',
        basics: {},
      }

      mockValidateJSONResume.mockReturnValue({
        valid: false,
        errors: ['Missing required field: name'],
      })

      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File([JSON.stringify(invalidData)], 'resume.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining('Invalid JSON Resume format'),
          expect.any(Object)
        )
      })
    })

    it('handles conversion failure', async () => {
      const jsonResumeData = {
        $schema: 'https://jsonresume.org/schema',
        basics: { name: 'Test' },
      }

      mockValidateJSONResume.mockReturnValue({ valid: true, errors: [] })
      mockConvertFromJSONResume.mockReturnValue(null)

      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File([JSON.stringify(jsonResumeData)], 'resume.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to convert JSON Resume format',
          { id: 'import-resume' }
        )
      })
    })

    it('handles JSON parse errors', async () => {
      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File(['invalid json{'], 'resume.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to import resume'),
          expect.any(Object)
        )
      })
    })

    it('handles file read errors', async () => {
      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File(['test'], 'resume.json', {
        type: 'application/json',
      })

      const originalFileReader = global.FileReader
      global.FileReader = jest.fn().mockImplementation(() => ({
        readAsText: function () {
          setTimeout(() => this.onerror?.(), 0)
        },
        onerror: null,
      })) as any

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to read file', {
          id: 'import-resume',
        })
      })

      global.FileReader = originalFileReader
    })

    it('preserves content when preserveContent flag is true', async () => {
      const jsonResumeData = {
        $schema: 'https://jsonresume.org/schema',
        basics: { name: 'Test' },
      }

      const resumeWithContent = {
        ...mockResumeData,
        content: 'Existing cover letter content',
      }

      mockValidateJSONResume.mockReturnValue({ valid: true, errors: [] })
      mockConvertFromJSONResume.mockReturnValue(mockResumeData)

      const { container } = renderWithContext(resumeWithContent, {
        preserveContent: true,
      })
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File([JSON.stringify(jsonResumeData)], 'resume.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockSetResumeData).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'Existing cover letter content',
          })
        )
      })
    })

    it('migrates old skills format to new format', async () => {
      const oldSkillsData = {
        name: 'Test',
        skills: [
          {
            category: 'Languages',
            skills: ['JavaScript', { text: 'TypeScript', underline: true }],
          },
        ],
      }

      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File([JSON.stringify(oldSkillsData)], 'resume.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockSetResumeData).toHaveBeenCalledWith(
          expect.objectContaining({
            skills: [
              {
                category: 'Languages',
                skills: [
                  { text: 'JavaScript', highlight: false },
                  { text: 'TypeScript', highlight: true },
                ],
              },
            ],
          })
        )
      })
    })

    it('preserves skills already in new format during migration', async () => {
      const mixedSkillsData = {
        name: 'Test',
        skills: [
          {
            category: 'Languages',
            skills: [
              'JavaScript',
              { text: 'TypeScript', underline: true },
              { text: 'Python', highlight: true },
            ],
          },
        ],
      }

      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File([JSON.stringify(mixedSkillsData)], 'resume.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockSetResumeData).toHaveBeenCalledWith(
          expect.objectContaining({
            skills: [
              {
                category: 'Languages',
                skills: [
                  { text: 'JavaScript', highlight: false },
                  { text: 'TypeScript', highlight: true },
                  { text: 'Python', highlight: true },
                ],
              },
            ],
          })
        )
      })
    })

    it('preserves content when importing internal format with preserveContent flag', async () => {
      const internalFormatData = {
        name: 'Test User',
        email: 'test@example.com',
        skills: [
          {
            title: 'Programming',
            skills: [{ text: 'JavaScript', highlight: false }],
          },
        ],
      }

      const resumeWithContent = {
        ...mockResumeData,
        content: 'My existing cover letter content',
      }

      const { container } = renderWithContext(resumeWithContent, {
        preserveContent: true,
      })
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File(
        [JSON.stringify(internalFormatData)],
        'resume.json',
        {
          type: 'application/json',
        }
      )

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockSetResumeData).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'My existing cover letter content',
            name: 'Test User',
          })
        )
      })
    })
  })

  describe('Export Functionality', () => {
    it('exports resume in JSON Resume format', () => {
      mockConvertToJSONResume.mockReturnValue({ basics: { name: 'John Doe' } })

      renderWithContext()
      fireEvent.click(
        screen.getByRole('button', { name: /export json resume/i })
      )

      expect(mockConvertToJSONResume).toHaveBeenCalledWith(mockResumeData)
      expect(mockToast.success).toHaveBeenCalledWith(
        'JSON Resume exported successfully!',
        { id: 'export-resume' }
      )
    })

    it('handles export errors', () => {
      mockConvertToJSONResume.mockImplementation(() => {
        throw new Error('Conversion failed')
      })

      renderWithContext()
      fireEvent.click(
        screen.getByRole('button', { name: /export json resume/i })
      )

      expect(mockToast.error).toHaveBeenCalledWith(
        'Failed to export resume: Conversion failed',
        { id: 'export-resume', duration: 5000 }
      )
    })
  })

  describe('Reset Functionality', () => {
    it('resets resume to default when confirmed', () => {
      const originalConfirm = window.confirm
      window.confirm = jest.fn(() => true)

      const setItemSpy = jest.spyOn(Storage.prototype, 'removeItem')

      renderWithContext()

      fireEvent.click(screen.getByRole('button', { name: /reset/i }))

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to reset your resume? All your changes will be lost.')
      expect(setItemSpy).toHaveBeenCalledWith('resumeData')
      expect(mockSetResumeData).toHaveBeenCalled()
      expect(mockToast.success).toHaveBeenCalledWith('Resume reset successfully', { id: 'reset-resume' })

      window.confirm = originalConfirm
      setItemSpy.mockRestore()
    })

    it('does not reset resume if confirmation is cancelled', () => {
      const originalConfirm = window.confirm
      window.confirm = jest.fn(() => false)

      const setItemSpy = jest.spyOn(Storage.prototype, 'removeItem')

      renderWithContext()

      fireEvent.click(screen.getByRole('button', { name: /reset/i }))

      expect(window.confirm).toHaveBeenCalled()
      expect(setItemSpy).not.toHaveBeenCalled()
      expect(mockSetResumeData).not.toHaveBeenCalled()

      window.confirm = originalConfirm
      setItemSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty file selection', () => {
      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      fireEvent.change(fileInput, { target: { files: [] } })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('accepts only .json files', () => {
      const { container } = renderWithContext()
      const fileInput = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement

      expect(fileInput.accept).toBe('.json')
    })
  })
})
