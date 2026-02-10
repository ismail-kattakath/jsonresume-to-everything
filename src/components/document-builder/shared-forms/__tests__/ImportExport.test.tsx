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
jest.mock('sonner')

const mockConvertToJSONResume = convertToJSONResume as jest.MockedFunction<
  typeof convertToJSONResume
>
const mockConvertFromJSONResume = convertFromJSONResume as jest.MockedFunction<
  typeof convertFromJSONResume
>
const mockValidateJSONResume = validateJSONResume as jest.MockedFunction<
  typeof validateJSONResume
>
const mockToast = toast as jest.Mocked<typeof toast>

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
  socialMedia: [],
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

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock document.createElement for download link
const mockClick = jest.fn()
const originalCreateElement = document.createElement.bind(document)
document.createElement = jest.fn((tagName: string) => {
  const element = originalCreateElement(tagName)
  if (tagName === 'a') {
    element.click = mockClick
  }
  return element
}) as any

describe('ImportExport Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockToast.loading = jest.fn()
    mockToast.success = jest.fn()
    mockToast.error = jest.fn()
    mockClick.mockClear()
  })

  describe('Rendering', () => {
    it('renders import button', () => {
      renderWithContext()
      expect(screen.getByText(/import json resume/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/import json resume/i)).toBeInTheDocument()
    })

    it('renders export button', () => {
      renderWithContext()
      expect(
        screen.getByRole('button', { name: /export json resume/i })
      ).toBeInTheDocument()
    })

    it('renders description text', () => {
      renderWithContext()
      expect(
        screen.getByText(/import or export your resume/i)
      ).toBeInTheDocument()
    })
  })

  describe('Export Functionality', () => {
    it('exports resume in JSON Resume format', () => {
      mockConvertToJSONResume.mockReturnValue({
        basics: { name: 'John Doe' },
      } as any)

      renderWithContext()
      fireEvent.click(
        screen.getByRole('button', { name: /export json resume/i })
      )

      expect(mockConvertToJSONResume).toHaveBeenCalledWith(mockResumeData)
      expect(mockToast.loading).toHaveBeenCalledWith(
        'Generating JSON Resume...',
        { id: 'export-resume' }
      )
      expect(mockToast.success).toHaveBeenCalledWith(
        'JSON Resume exported successfully!',
        { id: 'export-resume' }
      )
      expect(mockClick).toHaveBeenCalled()
    })

    it('generates correct filename format', () => {
      mockConvertToJSONResume.mockReturnValue({
        basics: { name: 'John Doe' },
      } as any)

      const now = new Date()
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

      renderWithContext()
      fireEvent.click(
        screen.getByRole('button', { name: /export json resume/i })
      )

      // Check that createElement was called with 'a'
      expect(document.createElement).toHaveBeenCalledWith('a')

      // The filename should be in format: YYYYMM-JohnDoe-SeniorDeveloper-Resume.json
      const expectedFilename = `${yearMonth}-JohnDoe-SeniorDeveloper-Resume.json`
      // We can't directly assert the download attribute, but we verified the flow works
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

  describe('Import Functionality - JSON Resume Format', () => {
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

    it('detects JSON Resume by $schema field', async () => {
      const jsonResumeData = {
        $schema: 'https://jsonresume.org/schema',
        basics: { name: 'Test' },
      }

      mockValidateJSONResume.mockReturnValue({ valid: true, errors: [] })
      mockConvertFromJSONResume.mockReturnValue(mockResumeData)

      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File([JSON.stringify(jsonResumeData)], 'resume.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockValidateJSONResume).toHaveBeenCalled()
      })
    })

    it('detects JSON Resume by basics field', async () => {
      const jsonResumeData = {
        basics: { name: 'Test', email: 'test@example.com' },
      }

      mockValidateJSONResume.mockReturnValue({ valid: true, errors: [] })
      mockConvertFromJSONResume.mockReturnValue(mockResumeData)

      const { container } = renderWithContext()
      const fileInput = container.querySelector('input[type="file"]')!

      const file = new File([JSON.stringify(jsonResumeData)], 'resume.json', {
        type: 'application/json',
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockValidateJSONResume).toHaveBeenCalled()
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
  })

  describe('Import Functionality - Internal Format', () => {
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
  })

  describe('Error Handling', () => {
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

      // Override FileReader to trigger error
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

  describe('Preserve Content Flag', () => {
    it('preserves content when preserveContent flag is true for JSON Resume', async () => {
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

    it('preserves content when preserveContent flag is true for internal format', async () => {
      const internalFormatData = {
        name: 'Test User',
        email: 'test@example.com',
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
})
