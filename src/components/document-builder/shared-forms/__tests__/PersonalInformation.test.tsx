// @ts-nocheck
import React from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)
import PersonalInformation from '@/components/document-builder/shared-forms/PersonalInformation'
import {
  renderWithContext,
  createMockResumeData,
  screen,
  fireEvent,
  waitFor,
} from '@/lib/__tests__/test-utils'

// Mock the AI generation module
jest.mock('@/lib/ai/strands/agent', () => ({
  generateJobTitleGraph: jest.fn(),
}))
// Mock the modular AI modules
jest.mock('@/lib/ai/api', () => ({
  OpenAIAPIError: class OpenAIAPIError extends Error { },
}))

describe('PersonalInformation Component', () => {
  describe('Rendering', () => {
    it('should render all form fields with floating labels', () => {
      renderWithContext(<PersonalInformation />) as any

      // Check for floating labels
      expect(screen.getByText('Full Name')).toBeInTheDocument()
      expect(screen.getByText('Job Title')).toBeInTheDocument()
      expect(screen.getByText('Phone')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Address')).toBeInTheDocument()
      expect(screen.getByText('Photo')).toBeInTheDocument()
    })

    // Note: Section heading is now rendered by CollapsibleSection wrapper

    it('should render inputs with correct types', () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const nameInput = container.querySelector('input[name="name"]')
      const emailInput = container.querySelector('input[name="email"]')
      const fileInput = container.querySelector('input[type="file"]')

      expect(nameInput).toHaveAttribute('type', 'text')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(fileInput).toHaveAttribute('type', 'file')
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })

    it('should display resume data values in inputs', () => {
      const mockData = createMockResumeData({
        name: 'John Doe',
        position: 'Software Engineer',
        contactInformation: '+1 (555) 123-4567',
        email: 'john@example.com',
        address: '123 Main St, Toronto',
      })

      const { container } = renderWithContext(<PersonalInformation />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      const phoneInput = container.querySelector(
        'input[name="contactInformation"]'
      ) as HTMLInputElement
      const emailInput = container.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement
      const addressInput = container.querySelector(
        'input[name="address"]'
      ) as HTMLInputElement

      expect(nameInput?.value).toBe('John Doe')
      expect(positionInput?.value).toBe('Software Engineer')
      expect(phoneInput?.value).toBe('+1 (555) 123-4567')
      expect(emailInput?.value).toBe('john@example.com')
      expect(addressInput?.value).toBe('123 Main St, Toronto')
    })
  })

  describe('User Interactions', () => {
    it('should call handleChange when text inputs are changed', () => {
      const mockHandleChange = jest.fn()
      const { container } = renderWithContext(<PersonalInformation />, {
        contextValue: { ...({} as any), handleChange: mockHandleChange },
      })

      const nameInput = container.querySelector('input[name="name"]')

      if (nameInput) {
        fireEvent.change(nameInput, {
          target: { value: 'Jane Doe', name: 'name' },
        })
        expect(mockHandleChange).toHaveBeenCalled()
      }
    })

    it('should call handleChange for all text fields', () => {
      const mockHandleChange = jest.fn()
      const { container } = renderWithContext(<PersonalInformation />, {
        contextValue: { ...({} as any), handleChange: mockHandleChange },
      })

      const fields = [
        { name: 'name', value: 'John Doe' },
        { name: 'position', value: 'Developer' },
        { name: 'contactInformation', value: '+1 555 1234' },
        { name: 'email', value: 'test@example.com' },
        { name: 'address', value: '123 Test St' },
      ]

      fields.forEach(({ name, value }) => {
        const input = container.querySelector(`input[name="${name}"]`)
        if (input) {
          fireEvent.change(input, { target: { value, name } })
        }
      })

      expect(mockHandleChange).toHaveBeenCalledTimes(fields.length)
    })

    it('should call handleProfilePicture when file input changes', () => {
      const mockHandleProfilePicture = jest.fn()
      const { container } = renderWithContext(<PersonalInformation />, {
        contextValue: {
          ...({} as any),
          handleProfilePicture: mockHandleProfilePicture,
        },
      })

      const fileInput = container.querySelector('input[type="file"]')
      const file = new File(['profile'], 'profile.jpg', { type: 'image/jpeg' })

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } })
        expect(mockHandleProfilePicture).toHaveBeenCalled()
      }
    })
  })

  describe('Floating Labels', () => {
    it('should have floating-label-group class on all input containers', () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const floatingLabelGroups = container.querySelectorAll(
        '.floating-label-group'
      )

      // Should have 6 floating label groups (name, position, phone, email, address, photo)
      expect(floatingLabelGroups.length).toBe(6)
    })

    it('should have floating-label class on all labels', () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const floatingLabels = container.querySelectorAll('.floating-label')

      // Should have 6 floating labels
      expect(floatingLabels.length).toBe(6)
    })

    it('should position labels correctly with expected text', () => {
      renderWithContext(<PersonalInformation />) as any

      const expectedLabels = [
        'Full Name',
        'Job Title',
        'Phone',
        'Email',
        'Address',
        'Photo',
      ]

      expectedLabels.forEach((labelText) => {
        const label = screen.getByText(labelText)
        expect(label).toHaveClass('floating-label')
      })
    })
  })

  describe('Form Layout', () => {
    it('should use grid layout for responsive design', () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const gridContainer = container.querySelector('.grid')

      expect(gridContainer).toBeInTheDocument()
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2')
    })

    it('should span address and photo fields across full width on medium screens', () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const addressGroup = container.querySelector(
        'input[name="address"]'
      )?.parentElement
      const photoGroup =
        container.querySelector('input[type="file"]')?.parentElement

      expect(addressGroup).toHaveClass('md:col-span-2')
      expect(photoGroup).toHaveClass('md:col-span-2')
    })
  })

  describe('Input Styling', () => {
    it('should apply consistent styling to all text inputs', () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const textInputs = container.querySelectorAll(
        'input[type="text"], input[type="email"]'
      )

      textInputs.forEach((input) => {
        expect(input).toHaveClass(
          'w-full',
          'px-4',
          'py-3',
          'bg-white/10',
          'text-white',
          'rounded-lg'
        )
      })
    })

    it('should have focus styles defined', () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const nameInput = container.querySelector('input[name="name"]')

      expect(nameInput).toHaveClass('focus:border-blue-400', 'focus:ring-2')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const results = await axe(container as any)

      expect(results).toHaveNoViolations()
    })

    it('should have proper input attributes', () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const emailInput = container.querySelector('input[name="email"]')

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('name', 'email')
    })

    it('should accept image files only for profile picture', () => {
      const { container } = renderWithContext(<PersonalInformation />) as any

      const fileInput = container.querySelector('input[type="file"]')

      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty resume data', () => {
      const emptyData = createMockResumeData({
        name: '',
        position: '',
        contactInformation: '',
        email: '',
        address: '',
      })

      const { container } = renderWithContext(<PersonalInformation />, {
        contextValue: { ...({} as any), resumeData: emptyData },
      })

      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement

      expect(nameInput?.value).toBe('')
    })

    it('should handle special characters in input values', () => {
      const specialData = createMockResumeData({
        name: "O'Brien-Smith",
        email: 'test+tag@example.com',
        address: '123 "Main" St., Apt #4-B',
      })

      const { container } = renderWithContext(<PersonalInformation />, {
        contextValue: { ...({} as any), resumeData: specialData },
      })

      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      const emailInput = container.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement
      const addressInput = container.querySelector(
        'input[name="address"]'
      ) as HTMLInputElement

      expect(nameInput?.value).toBe("O'Brien-Smith")
      expect(emailInput?.value).toBe('test+tag@example.com')
      expect(addressInput?.value).toBe('123 "Main" St., Apt #4-B')
    })
  })

  describe('AI Generate Job Title Button', () => {
    const {
      generateJobTitleGraph,
    } = require('@/lib/ai/strands/agent')

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should render AI button for job title field', () => {
      renderWithContext(<PersonalInformation />, {
        aiSettings: {
          apiUrl: 'https://api.test.com',
          apiKey: 'test-key',
          model: 'gpt-4',
          jobDescription: 'Test job description',
          providerType: 'openai-compatible',
          rememberCredentials: true,
          skillsToHighlight: '',
        },
      })

      const aiButton = screen.getByRole('button', { name: /refine/i })
      expect(aiButton).toBeInTheDocument()
    })

    it('should show sparkles icon when not generating', () => {
      const { container } = renderWithContext(<PersonalInformation />, {
        aiSettings: {
          apiUrl: 'https://api.test.com',
          apiKey: 'test-key',
          model: 'gpt-4',
          jobDescription: 'Test job',
          providerType: 'openai-compatible',
          rememberCredentials: true,
          skillsToHighlight: '',
        },
      })

      const sparklesIcon = container.querySelector('svg.lucide-sparkles')
      expect(sparklesIcon).toBeInTheDocument()
    })

    it('should generate job title when button clicked with valid AI settings', async () => {
      generateJobTitleGraph.mockResolvedValue('Senior Software Engineer')

      const mockData = createMockResumeData({ position: 'Developer' })
      const mockSetResumeData = jest.fn()

      renderWithContext(<PersonalInformation />, {
        resumeData: mockData as any,
        setResumeData: mockSetResumeData,
        aiSettings: {
          apiUrl: 'https://api.test.com',
          apiKey: 'test-key',
          model: 'gpt-4',
          jobDescription: 'Senior Software Engineer position',
          providerType: 'openai-compatible',
          rememberCredentials: true,
          skillsToHighlight: '',
        },
      })

      const aiButton = screen.getByRole('button', { name: /refine/i })
      fireEvent.click(aiButton)

      await waitFor(() => {
        expect(generateJobTitleGraph).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockSetResumeData).toHaveBeenCalledWith(
          expect.objectContaining({
            position: 'Senior Software Engineer',
          })
        )
      })
    })

    it('should be disabled when AI is not configured', () => {
      renderWithContext(<PersonalInformation />, {
        aiSettingsValue: {
          isConfigured: false,
          settings: {
            apiUrl: '',
            apiKey: '',
            model: '',
            jobDescription: '',
            providerType: 'openai-compatible',
            rememberCredentials: false,
            skillsToHighlight: '',
            skillsToHighlight: '',
          },
        },
      })

      const aiButton = screen.getByRole('button')
      expect(aiButton).toBeDisabled()
      // Title is set based on disabledTooltip
      expect(aiButton).toHaveAttribute('title', 'Configure AI settings first')
    })

    it('should show loading state while generating', async () => {
      generateJobTitleGraph.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve('Senior Developer'), 50)
          )
      )

      renderWithContext(<PersonalInformation />, {
        aiSettings: {
          apiUrl: 'https://api.test.com',
          apiKey: 'test-key',
          model: 'gpt-4',
          jobDescription: 'Senior Developer position',
          providerType: 'openai-compatible',
          rememberCredentials: true,
          skillsToHighlight: '',
        },
      })

      const aiButton = screen.getByRole('button', { name: /refine/i })

      // Verify button is initially enabled
      expect(aiButton).not.toBeDisabled()

      fireEvent.click(aiButton)

      // Button should be disabled during generation
      expect(aiButton).toBeDisabled()

      // Wait for generation to complete
      await waitFor(() => {
        expect(aiButton).not.toBeDisabled()
      })
    })

    it('should handle generation errors gracefully', async () => {
      generateJobTitleGraph.mockRejectedValue(new Error('API Error'))

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => { })

      renderWithContext(<PersonalInformation />, {
        aiSettings: {
          apiUrl: 'https://api.test.com',
          apiKey: 'test-key',
          model: 'gpt-4',
          jobDescription: 'Software Engineer position',
          providerType: 'openai-compatible',
          rememberCredentials: true,
          skillsToHighlight: '',
        },
      })

      const aiButton = screen.getByRole('button', { name: /refine/i })
      fireEvent.click(aiButton)

      await waitFor(() => {
        expect(generateJobTitleGraph).toHaveBeenCalled()
      })

      // Button should be re-enabled after error
      await waitFor(() => {
        expect(aiButton).not.toBeDisabled()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should update job title field with generated content', async () => {
      generateJobTitleGraph.mockResolvedValue('Lead Frontend Developer')

      const mockData = createMockResumeData({ position: '' })
      const mockSetResumeData = jest.fn()

      renderWithContext(<PersonalInformation />, {
        resumeData: mockData as any,
        setResumeData: mockSetResumeData,
        aiSettings: {
          apiUrl: 'https://api.test.com',
          apiKey: 'test-key',
          model: 'gpt-4',
          jobDescription: 'Lead Frontend Developer position',
          providerType: 'openai-compatible',
          rememberCredentials: true,
          skillsToHighlight: '',
        },
      })

      const aiButton = screen.getByRole('button', { name: /refine/i })
      fireEvent.click(aiButton)

      await waitFor(() => {
        expect(mockSetResumeData).toHaveBeenCalledWith(
          expect.objectContaining({
            position: 'Lead Frontend Developer',
          })
        )
      })
    })
  })
})
