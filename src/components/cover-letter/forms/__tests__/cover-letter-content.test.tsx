// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CoverLetterContent from '@/components/cover-letter/forms/CoverLetterContent'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { AISettingsContext } from '@/lib/contexts/AISettingsContext'
import { renderWithContext, createMockResumeData, createMockAISettingsContext } from '@/lib/__tests__/test-utils'

import { generateCoverLetterGraph } from '@/lib/ai/strands/agent'

// Mock the strands agent
jest.mock('@/lib/ai/strands/agent', () => ({
  generateCoverLetterGraph: jest.fn(),
}))

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
  sanitizeAIError: jest.fn((err) => err.message || err.toString()),
}))

// Mock sonner toast
jest.mock('sonner', () => {
  const toastMock = jest.fn()
  // Add methods to the function
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

// Helper to render with both contexts for tests that need custom setResumeData
const renderWithBothContexts = (mockData: ReturnType<typeof createMockResumeData>, mockSetResumeData: jest.Mock) => {
  const mockAISettings = createMockAISettingsContext()
  return render(
    <AISettingsContext.Provider value={mockAISettings}>
      <ResumeContext.Provider
        value={{
          resumeData: mockData,
          setResumeData: mockSetResumeData,
          handleProfilePicture: jest.fn(),
          handleChange: jest.fn(),
        } as unknown as React.ContextType<typeof ResumeContext>}
      >
        <CoverLetterContent />
      </ResumeContext.Provider>
    </AISettingsContext.Provider>
  )
}

describe('CoverLetterContent Component', () => {
  describe('Rendering', () => {
    // Note: Section heading is now rendered by CollapsibleSection wrapper

    it('should render textarea with placeholder', () => {
      renderWithContext(<CoverLetterContent />)
      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('should render floating AI button', () => {
      renderWithContext(<CoverLetterContent />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should display existing content in textarea', () => {
      const mockData = createMockResumeData({
        content: 'This is my cover letter content',
      })
      renderWithContext(<CoverLetterContent />, {
        contextValue: { resumeData: mockData } as unknown as React.ContextType<typeof ResumeContext>,
      })

      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      expect(textarea).toHaveValue('This is my cover letter content')
    })
  })

  describe('Input Changes', () => {
    it('should update content when user types', () => {
      const mockData = createMockResumeData({ content: '' })
      const mockSetResumeData = jest.fn()

      renderWithBothContexts(mockData, mockSetResumeData)

      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      fireEvent.change(textarea, {
        target: { value: 'New cover letter content' },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        content: 'New cover letter content',
      })
    })

    it('should handle empty string input', () => {
      const mockData = createMockResumeData({ content: 'Existing content' })
      const mockSetResumeData = jest.fn()

      renderWithBothContexts(mockData, mockSetResumeData)

      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      fireEvent.change(textarea, { target: { value: '' } })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        content: '',
      })
    })

    it('should handle multiline input', () => {
      const mockData = createMockResumeData({ content: '' })
      const mockSetResumeData = jest.fn()

      renderWithBothContexts(mockData, mockSetResumeData)

      const multilineContent = 'First paragraph\n\nSecond paragraph\n\nThird paragraph'
      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      fireEvent.change(textarea, { target: { value: multilineContent } })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        content: multilineContent,
      })
    })
  })

  describe('Layout and Styling', () => {
    // Note: Section gradient is now in CollapsibleSection wrapper

    it('should have focus styles with orange color', () => {
      const { container } = renderWithContext(<CoverLetterContent />)
      const textarea = container.querySelector('.focus\\:border-amber-400')
      expect(textarea).toBeInTheDocument()
    })

    it('should have resizable textarea', () => {
      const { container } = renderWithContext(<CoverLetterContent />)
      const textarea = container.querySelector('.resize-y')
      expect(textarea).toBeInTheDocument()
    })

    it('should have minimum height set', () => {
      renderWithContext(<CoverLetterContent />)
      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      expect(textarea).toHaveStyle({ minHeight: '400px' })
    })
  })

  describe('Accessibility', () => {
    // Note: Semantic heading is now in CollapsibleSection wrapper

    it('should have name attribute on textarea', () => {
      renderWithContext(<CoverLetterContent />)
      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      expect(textarea).toHaveAttribute('name', 'content')
    })

    it('should have rows attribute for better accessibility', () => {
      renderWithContext(<CoverLetterContent />)
      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      expect(textarea).toHaveAttribute('rows', '12')
    })

    it('should have descriptive placeholder', () => {
      renderWithContext(<CoverLetterContent />)
      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i) as HTMLTextAreaElement
      expect(textarea.placeholder).toBe('Write your cover letter content...')
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters and emojis', () => {
      const specialContent = 'Hello 🎉 Special chars: @#$%^&*()'
      const mockData = createMockResumeData({ content: specialContent })
      const mockSetResumeData = jest.fn()

      renderWithBothContexts(mockData, mockSetResumeData)

      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      expect(textarea).toHaveValue(specialContent)
    })

    it('should handle null content gracefully', () => {
      const mockData = createMockResumeData({ content: undefined })
      renderWithContext(<CoverLetterContent />, {
        contextValue: { resumeData: mockData } as unknown as React.ContextType<typeof ResumeContext>,
      })

      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      expect(textarea).toHaveValue('')
    })

    it('should handle content with only whitespace', () => {
      const whitespaceContent = '   \n\n   '
      const mockData = createMockResumeData({ content: whitespaceContent })
      renderWithContext(<CoverLetterContent />, {
        contextValue: { resumeData: mockData } as unknown as React.ContextType<typeof ResumeContext>,
      })

      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      expect(textarea).toHaveValue(whitespaceContent)
    })

    it('should handle Unicode characters correctly', () => {
      const unicodeContent = 'Hello 你好 مرحبا'
      const mockData = createMockResumeData({ content: unicodeContent })
      renderWithContext(<CoverLetterContent />, {
        contextValue: { resumeData: mockData } as unknown as React.ContextType<typeof ResumeContext>,
      })

      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)
      expect(textarea).toHaveValue(unicodeContent)
    })

    it('should handle rapid content updates', () => {
      const mockData = createMockResumeData({ content: '' })
      const mockSetResumeData = jest.fn()

      renderWithBothContexts(mockData, mockSetResumeData)

      const textarea = screen.getByPlaceholderText(/Write your cover letter content\.\.\./i)

      // Simulate rapid typing
      fireEvent.change(textarea, { target: { value: 'H' } })
      fireEvent.change(textarea, { target: { value: 'He' } })
      fireEvent.change(textarea, { target: { value: 'Hel' } })
      fireEvent.change(textarea, { target: { value: 'Hell' } })
      fireEvent.change(textarea, { target: { value: 'Hello' } })

      expect(mockSetResumeData).toHaveBeenCalledTimes(5)
      expect(mockSetResumeData).toHaveBeenLastCalledWith({
        ...mockData,
        content: 'Hello',
      })
    })
  })

  describe('AI Generation Callback', () => {
    it('updates content when AI generation completes', async () => {
      // Mock successful AI generation
      const generatedText = 'AI-generated cover letter content with compelling narrative and skills alignment'
        ; (generateCoverLetterGraph as jest.Mock).mockImplementation(
          async (_data: unknown, _jobDescription: unknown, _config: unknown, onChunk: (arg: { content: string }) => void) => {
            // Simulate streaming by calling onChunk
            onChunk({ content: generatedText })
            return generatedText
          }
        )

      const mockData = createMockResumeData({ content: '' })
      const mockSetResumeData = jest.fn()
      const mockAISettings = createMockAISettingsContext({
        settings: {
          apiUrl: 'https://api.openai.com',
          apiKey: 'sk-test-key',
          model: 'gpt-4o-mini',
          jobDescription: 'Test job description with enough characters to be valid',
          rememberCredentials: false,
        },
        isConfigured: true,
        connectionStatus: 'valid' as const,
        jobDescriptionStatus: 'valid' as const,
      })

      render(
        <AISettingsContext.Provider value={mockAISettings}>
          <ResumeContext.Provider
            value={{
              resumeData: mockData,
              setResumeData: mockSetResumeData,
              handleProfilePicture: jest.fn(),
              handleChange: jest.fn(),
            } as unknown as React.ContextType<typeof ResumeContext>}
          >
            <CoverLetterContent />
          </ResumeContext.Provider>
        </AISettingsContext.Provider>
      )

      mockSetResumeData.mockClear()

      // Click the AI generation button
      const aiButton = screen.getByRole('button', { name: /generate by jd/i })
      fireEvent.click(aiButton)

      // Wait for AI generation to complete and setResumeData to be called
      await waitFor(() => {
        expect(mockSetResumeData).toHaveBeenCalledWith(
          expect.objectContaining({
            content: generatedText,
          })
        )
      })
    })
  })
})
