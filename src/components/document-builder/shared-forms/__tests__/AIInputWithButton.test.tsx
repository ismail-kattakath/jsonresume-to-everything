// @ts-nocheck
import React from 'react'
import { axe } from 'jest-axe'
import AIInputWithButton from '@/components/document-builder/shared-forms/AIInputWithButton'
import {
  renderWithContext,
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

describe('AIInputWithButton Component', () => {
  const {
    generateJobTitleGraph,
  } = require('@/lib/ai/strands/agent')

  const defaultProps = {
    value: 'Software Engineer',
    onChange: jest.fn(),
    placeholder: 'Job Title',
    name: 'position',
    label: 'Job Title',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render input field with value', () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} />
      )

      const input = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input.value).toBe('Software Engineer')
    })

    it('should render AI button', () => {
      renderWithContext(<AIInputWithButton {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render sparkles icon when not generating', () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} />
      )

      const sparklesIcon = container.querySelector('svg.lucide-sparkles')
      expect(sparklesIcon).toBeInTheDocument()
    })

    it('should render label', () => {
      renderWithContext(<AIInputWithButton {...defaultProps} />)

      expect(screen.getByText('Job Title')).toBeInTheDocument()
    })

    it('should apply floating-label-group class', () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} />
      )

      const wrapper = container.querySelector('.floating-label-group')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when input value changes', () => {
      const mockOnChange = jest.fn()
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} onChange={mockOnChange} />
      )

      const input = container.querySelector('input[name="position"]')
      fireEvent.change(input!, {
        target: { value: 'Senior Developer', name: 'position' },
      })

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should disable input when generating', () => {
      let resolveGeneration: (value: string) => void
      const generationPromise = new Promise<string>((resolve) => {
        resolveGeneration = resolve
      })

      generateJobTitleGraph.mockReturnValue(generationPromise)

      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} />,
        {
          aiSettings: {
            apiUrl: 'https://api.test.com',
            apiKey: 'test-key',
            model: 'gpt-4',
            jobDescription: 'Test job',
            providerType: 'openai-compatible',
            rememberCredentials: true,
          },
        }
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Check disabled state synchronously
      const input = container.querySelector('input[name="position"]')
      expect(input).toBeDisabled()

      // Clean up
      resolveGeneration!('New Title')
    })
  })

  describe('AI Generation', () => {
    it('should generate job title when button clicked', async () => {
      generateJobTitleGraph.mockResolvedValue('Senior Software Engineer')

      const mockOnGenerated = jest.fn()

      renderWithContext(
        <AIInputWithButton {...defaultProps} onGenerated={mockOnGenerated} />,
        {
          aiSettings: {
            apiUrl: 'https://api.test.com',
            apiKey: 'test-key',
            model: 'gpt-4',
            jobDescription: 'Senior Software Engineer position',
            providerType: 'openai-compatible',
            rememberCredentials: true,
          },
        }
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(generateJobTitleGraph).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockOnGenerated).toHaveBeenCalledWith('Senior Software Engineer')
      })
    })

    it('should show loading spinner while generating', async () => {
      generateJobTitleGraph.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve('Lead Developer'), 50)
          )
      )

      renderWithContext(<AIInputWithButton {...defaultProps} />, {
        aiSettings: {
          apiUrl: 'https://api.test.com',
          apiKey: 'test-key',
          model: 'gpt-4',
          jobDescription: 'Lead Developer position',
          providerType: 'openai-compatible',
          rememberCredentials: true,
        },
      })

      const button = screen.getByRole('button')

      // Verify button is initially enabled
      expect(button).not.toBeDisabled()

      fireEvent.click(button)

      // Button should be disabled during generation
      expect(button).toBeDisabled()

      // Wait for generation to complete
      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })

    it('should be disabled when AI is not configured', () => {
      renderWithContext(<AIInputWithButton {...defaultProps} />, {
        aiSettings: {
          apiUrl: '',
          apiKey: '',
          model: '',
          jobDescription: '',
          providerType: 'openai-compatible',
          rememberCredentials: false,
        },
      })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('title', 'Configure AI settings first')
    })

    it('should handle generation errors gracefully', async () => {
      generateJobTitleGraph.mockRejectedValue(new Error('API Error'))

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => { })

      renderWithContext(<AIInputWithButton {...defaultProps} />, {
        aiSettings: {
          apiUrl: 'https://api.test.com',
          apiKey: 'test-key',
          model: 'gpt-4',
          jobDescription: 'Software Engineer position',
          providerType: 'openai-compatible',
          rememberCredentials: true,
        },
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(generateJobTitleGraph).toHaveBeenCalled()
      })

      // Button should be re-enabled after error
      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should update input via onChange when onGenerated not provided', async () => {
      generateJobTitleGraph.mockResolvedValue('Principal Engineer')

      const mockOnChange = jest.fn()

      renderWithContext(
        <AIInputWithButton {...defaultProps} onChange={mockOnChange} />,
        {
          aiSettings: {
            apiUrl: 'https://api.test.com',
            apiKey: 'test-key',
            model: 'gpt-4',
            jobDescription: 'Principal Engineer position',
            providerType: 'openai-compatible',
            rememberCredentials: true,
          },
        }
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: 'Principal Engineer',
              name: 'position',
            }),
          })
        )
      })
    })

    it('should support streaming updates', async () => {
      const mockOnGenerated = jest.fn()

      generateJobTitleGraph.mockImplementation(
        (
          _resumeData: any,
          _jobDescription: any,
          _apiUrl: any,
          _apiKey: any,
          _model: any,
          _providerType: any,
          onProgress: any
        ) => {
          return new Promise((resolve) => {
            // Simulate streaming
            onProgress?.({ content: 'Senior', done: false })
            onProgress?.({ content: ' Software', done: false })
            onProgress?.({ content: ' Engineer', done: false })
            resolve('Senior Software Engineer')
          })
        }
      )

      renderWithContext(
        <AIInputWithButton {...defaultProps} onGenerated={mockOnGenerated} />,
        {
          aiSettings: {
            apiUrl: 'https://api.test.com',
            apiKey: 'test-key',
            model: 'gpt-4',
            jobDescription: 'Senior Software Engineer position',
            providerType: 'openai-compatible',
            rememberCredentials: true,
          },
        }
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(generateJobTitleGraph).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockOnGenerated).toHaveBeenCalledWith('Senior Software Engineer')
      })
    })
  })

  describe('Styling', () => {
    it('should position button inside input field', () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} />
      )

      const button = container.querySelector('button')
      expect(button?.parentElement).toHaveClass('absolute', 'right-2')
    })

    it('should apply gradient styling to enabled button', () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} />,
        {
          aiSettings: {
            apiUrl: 'https://api.test.com',
            apiKey: 'test-key',
            model: 'gpt-4',
            jobDescription: 'Test job',
            providerType: 'openai-compatible',
            rememberCredentials: true,
          },
        }
      )

      const button = container.querySelector('button')
      expect(button).toHaveClass('from-blue-500', 'to-purple-500')
    })

    it('should apply disabled styling when not configured', () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} />,
        {
          aiSettings: {
            apiUrl: '',
            apiKey: '',
            model: '',
            jobDescription: '',
            providerType: 'openai-compatible',
            rememberCredentials: false,
          },
        }
      )

      const button = container.querySelector('button')
      expect(button).toHaveClass('cursor-not-allowed', 'text-white/30')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper button title', () => {
      renderWithContext(<AIInputWithButton {...defaultProps} />, {
        aiSettings: {
          apiUrl: 'https://api.test.com',
          apiKey: 'test-key',
          model: 'gpt-4',
          jobDescription: 'Test job',
          providerType: 'openai-compatible',
          rememberCredentials: true,
        },
      })

      const button = screen.getByRole('button')
      // Title is not shown when showLabel is true and not disabled
      expect(button).not.toHaveAttribute('title')
      expect(screen.getByText('Refine')).toBeInTheDocument()
    })

    it('should have proper input attributes', () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} />
      )

      const input = container.querySelector('input')
      expect(input).toHaveAttribute('name', 'position')
      expect(input).toHaveAttribute('placeholder', 'Job Title')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} value="" />
      )

      const input = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle long generated titles', async () => {
      const longTitle = 'Senior Principal Staff Software Engineering Manager'
      generateJobTitleGraph.mockResolvedValue(longTitle)

      const mockOnGenerated = jest.fn()

      renderWithContext(
        <AIInputWithButton {...defaultProps} onGenerated={mockOnGenerated} />,
        {
          aiSettings: {
            apiUrl: 'https://api.test.com',
            apiKey: 'test-key',
            model: 'gpt-4',
            jobDescription: 'Test',
            providerType: 'openai-compatible',
            rememberCredentials: true,
          },
        }
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockOnGenerated).toHaveBeenCalledWith(longTitle)
      })
    })

    it('should apply custom className', () => {
      const { container } = renderWithContext(
        <AIInputWithButton {...defaultProps} className="custom-class" />
      )

      const wrapper = container.querySelector('.floating-label-group')
      expect(wrapper).toHaveClass('custom-class')
    })
  })
})
