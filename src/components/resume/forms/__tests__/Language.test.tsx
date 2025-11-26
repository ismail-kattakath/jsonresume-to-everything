import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Language from '@/components/resume/forms/Language'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  renderWithContext,
  createMockResumeData,
} from '@/lib/__tests__/test-utils'

// Store the onDragEnd callback for testing
let capturedOnDragEnd: ((result: unknown) => void) | null = null

// Mock @hello-pangea/dnd to test drag-and-drop functionality
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode
    onDragEnd: (result: unknown) => void
  }) => {
    capturedOnDragEnd = onDragEnd
    return <div data-testid="drag-drop-context">{children}</div>
  },
  Droppable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode
  }) => (
    <div data-testid="droppable">
      {children(
        {
          droppableProps: {},
          innerRef: jest.fn(),
          placeholder: null,
        },
        {
          isDraggingOver: false,
          draggingOverWith: null,
          draggingFromThisWith: null,
          isUsingPlaceholder: false,
        }
      )}
    </div>
  ),
  Draggable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode
  }) => (
    <div data-testid="draggable">
      {children(
        {
          draggableProps: {},
          dragHandleProps: {},
          innerRef: jest.fn(),
        },
        {
          isDragging: false,
          isDropAnimating: false,
        }
      )}
    </div>
  ),
}))

describe('Language Component', () => {
  describe('Rendering', () => {
    it('should render section heading', () => {
      renderWithContext(<Language />)
      expect(screen.getByText('Languages')).toBeInTheDocument()
    })

    it('should render Display Section checkbox', () => {
      renderWithContext(<Language />)
      const checkbox = screen.getByLabelText('Display Section')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })

    it('should render all language inputs', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const inputs = screen.getAllByPlaceholderText('Language')
      expect(inputs).toHaveLength(2)
      expect(inputs[0]).toHaveValue('English')
      expect(inputs[1]).toHaveValue('Spanish')
    })

    it('should render floating labels for each language input', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const labels = screen.getAllByText('Language')
      expect(labels).toHaveLength(2)
      labels.forEach((label) => {
        expect(label.tagName.toLowerCase()).toBe('label')
      })
    })

    it('should render delete button for each language', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButtons = screen.getAllByTitle('Delete this language')
      expect(deleteButtons).toHaveLength(2)
    })

    it('should render add button', () => {
      renderWithContext(<Language />)
      expect(screen.getByText(/Add/i)).toBeInTheDocument()
    })
  })

  describe('Display Section Toggle', () => {
    it('should reflect showLanguages state in checkbox', () => {
      const mockData = createMockResumeData({ showLanguages: true })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const checkbox = screen.getByLabelText(
        'Display Section'
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('should call setResumeData with updated showLanguages when checkbox is clicked', () => {
      const mockData = createMockResumeData({ showLanguages: false })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const checkbox = screen.getByLabelText('Display Section')
      fireEvent.click(checkbox)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        showLanguages: true,
      })
    })

    it('should toggle showLanguages from true to false', () => {
      const mockData = createMockResumeData({ showLanguages: true })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const checkbox = screen.getByLabelText('Display Section')
      fireEvent.click(checkbox)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        showLanguages: false,
      })
    })
  })

  describe('Add Functionality', () => {
    it('should add new language when add button is clicked', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const addButton = screen.getByText(/Add/i)
      fireEvent.click(addButton)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English', ''],
      })
    })

    it('should add empty string to languages array', () => {
      const mockData = createMockResumeData({ languages: [] })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const addButton = screen.getByText(/Add/i)
      fireEvent.click(addButton)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: [''],
      })
    })
  })

  describe('Delete Functionality', () => {
    it('should delete language when delete button is clicked', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish', 'French'],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const deleteButtons = screen.getAllByTitle('Delete this language')
      fireEvent.click(deleteButtons[1]) // Delete Spanish

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English', 'French'],
      })
    })

    it('should delete first language correctly', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const deleteButtons = screen.getAllByTitle('Delete this language')
      fireEvent.click(deleteButtons[0])

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['Spanish'],
      })
    })

    it('should delete last language correctly', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const deleteButtons = screen.getAllByTitle('Delete this language')
      fireEvent.click(deleteButtons[1])

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English'],
      })
    })
  })

  describe('Input Changes', () => {
    it('should update language value when input changes', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Language')
      fireEvent.change(input, { target: { value: 'Spanish' } })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['Spanish'],
      })
    })

    it('should update correct language when multiple languages exist', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish', 'French'],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const inputs = screen.getAllByPlaceholderText('Language')
      fireEvent.change(inputs[1], { target: { value: 'German' } })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English', 'German', 'French'],
      })
    })

    it('should handle empty string input', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Language')
      fireEvent.change(input, { target: { value: '' } })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: [''],
      })
    })
  })

  describe('Floating Labels', () => {
    it('should have floating-label-group wrapper for each input', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      const { container } = renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const floatingGroups = container.querySelectorAll('.floating-label-group')
      expect(floatingGroups).toHaveLength(2)
    })

    it('should have floating-label class for each label', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      const { container } = renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const floatingLabels = container.querySelectorAll('.floating-label')
      expect(floatingLabels).toHaveLength(2)
    })
  })

  describe('Layout and Styling', () => {
    it('should render with responsive flex layout', () => {
      const { container } = renderWithContext(<Language />)
      const header = container.querySelector('.sm\\:flex-row')
      expect(header).toBeInTheDocument()
    })

    it('should have hover states on language containers', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      const { container } = renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const languageContainer = container.querySelector(
        '.hover\\:border-white\\/20'
      )
      expect(languageContainer).toBeInTheDocument()
    })

    it('should have gradient accent on section heading', () => {
      const { container } = renderWithContext(<Language />)
      const gradient = container.querySelector(
        '.bg-gradient-to-b.from-emerald-500.to-teal-500'
      )
      expect(gradient).toBeInTheDocument()
    })

    it('should have proper delete button styling', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = screen.getByTitle('Delete this language')
      expect(deleteButton).toHaveClass('text-red-400')
    })
  })

  describe('Accessibility', () => {
    it('should use semantic heading structure', () => {
      renderWithContext(<Language />)
      const heading = screen.getByRole('heading', { name: 'Languages' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })

    it('should have accessible checkbox with label', () => {
      renderWithContext(<Language />)
      const checkbox = screen.getByLabelText('Display Section')
      expect(checkbox).toHaveAttribute('type', 'checkbox')
      expect(checkbox).toHaveAttribute('id', 'showLanguages')
    })

    it('should have title attribute on delete buttons', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = screen.getByTitle('Delete this language')
      expect(deleteButton).toHaveAttribute('title', 'Delete this language')
    })

    it('should use text input type', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const input = screen.getByPlaceholderText('Language')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should have button type=button for delete buttons', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = screen.getByTitle('Delete this language')
      expect(deleteButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Edge Cases', () => {
    it('should render correctly with empty languages array', () => {
      const mockData = createMockResumeData({ languages: [] })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Languages')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Language')).not.toBeInTheDocument()
    })

    it('should handle special characters in language input', () => {
      const mockData = createMockResumeData({
        languages: ['中文 (Chinese)'],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Language')
      fireEvent.change(input, { target: { value: 'العربية (Arabic)' } })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['العربية (Arabic)'],
      })
    })

    it('should handle long language names', () => {
      const longName =
        'Language with a very long name that exceeds normal length'
      const mockData = createMockResumeData({
        languages: [longName],
      })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const input = screen.getByPlaceholderText('Language')
      expect(input).toHaveValue(longName)
    })

    it('should handle multiple languages with same value', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'English', 'English'],
      })
      renderWithContext(<Language />, {
        contextValue: { resumeData: mockData },
      })

      const inputs = screen.getAllByPlaceholderText('Language')
      expect(inputs).toHaveLength(3)
      inputs.forEach((input) => {
        expect(input).toHaveValue('English')
      })
    })
  })

  describe('Drag and Drop Functionality', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      capturedOnDragEnd = null
    })

    it('should not update data when dropped outside droppable area', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      // Simulate dropping outside droppable area
      capturedOnDragEnd!({
        source: { droppableId: 'languages', index: 0 },
        destination: null,
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should not update data when dropped in same position', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      // Simulate dropping in the same position
      capturedOnDragEnd!({
        source: { droppableId: 'languages', index: 1 },
        destination: { droppableId: 'languages', index: 1 },
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should reorder languages from first to last position', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish', 'French'],
      })

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      // Drag first item to last position
      capturedOnDragEnd!({
        source: { droppableId: 'languages', index: 0 },
        destination: { droppableId: 'languages', index: 2 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['Spanish', 'French', 'English'],
      })
    })

    it('should reorder languages from last to first position', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish', 'French'],
      })

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      // Drag last item to first position
      capturedOnDragEnd!({
        source: { droppableId: 'languages', index: 2 },
        destination: { droppableId: 'languages', index: 0 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['French', 'English', 'Spanish'],
      })
    })

    it('should reorder languages between middle positions', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish', 'French'],
      })

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Language />
        </ResumeContext.Provider>
      )

      // Drag middle item (index 1) down one position (index 2)
      capturedOnDragEnd!({
        source: { droppableId: 'languages', index: 1 },
        destination: { droppableId: 'languages', index: 2 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English', 'French', 'Spanish'],
      })
    })
  })
})
