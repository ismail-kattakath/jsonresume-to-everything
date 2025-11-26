import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Certification from '@/components/resume/forms/Certification'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  renderWithContext,
  createMockResumeData,
} from '@/lib/__tests__/test-utils'

// Store the onDragEnd callback for testing
let capturedOnDragEnd: ((result: unknown) => void) | null = null

// Mock @hello-pangea/dnd
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => {
    capturedOnDragEnd = onDragEnd
    return <div data-testid="drag-drop-context">{children}</div>
  },
  Droppable: ({ children }: any) => (
    <div data-testid="droppable">
      {children(
        { droppableProps: {}, innerRef: jest.fn(), placeholder: null },
        {
          isDraggingOver: false,
          draggingOverWith: null,
          draggingFromThisWith: null,
          isUsingPlaceholder: false,
        }
      )}
    </div>
  ),
  Draggable: ({ children }: any) => (
    <div data-testid="draggable">
      {children(
        { draggableProps: {}, dragHandleProps: {}, innerRef: jest.fn() },
        { isDragging: false, isDropAnimating: false }
      )}
    </div>
  ),
}))

describe('Certification Component', () => {
  describe('Rendering', () => {
    it('should render section heading', () => {
      renderWithContext(<Certification />)
      expect(screen.getByText('Certifications')).toBeInTheDocument()
    })

    it('should render all certification inputs', async () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'Google Cloud Professional',
        ],
      })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(
          'Enter certification name'
        )
        expect(inputs).toHaveLength(2)
        expect(inputs[0]).toHaveValue('AWS Solutions Architect')
        expect(inputs[1]).toHaveValue('Google Cloud Professional')
      })
    })

    it('should render floating labels for each certification input', () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'Google Cloud Professional',
        ],
      })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const labels = screen.getAllByText('Certification Name')
      expect(labels).toHaveLength(2)
      labels.forEach((label) => {
        expect(label.tagName.toLowerCase()).toBe('label')
      })
    })

    it('should render delete button for each certification', () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'Google Cloud Professional',
        ],
      })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButtons = screen.getAllByTitle('Delete this certification')
      expect(deleteButtons).toHaveLength(2)
    })

    it('should render add button', () => {
      renderWithContext(<Certification />)
      expect(screen.getByText(/Add/i)).toBeInTheDocument()
    })
  })

  describe('Add Functionality', () => {
    it('should add new certification when add button is clicked', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Solutions Architect'],
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
          <Certification />
        </ResumeContext.Provider>
      )

      const addButton = screen.getByText(/Add/i)
      fireEvent.click(addButton)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['AWS Solutions Architect', ''],
      })
    })

    it('should add empty string to certifications array', () => {
      const mockData = createMockResumeData({ certifications: [] })
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
          <Certification />
        </ResumeContext.Provider>
      )

      const addButton = screen.getByText(/Add/i)
      fireEvent.click(addButton)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: [''],
      })
    })
  })

  describe('Delete Functionality', () => {
    it('should delete certification when delete button is clicked', () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'Google Cloud Professional',
          'Azure Administrator',
        ],
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
          <Certification />
        </ResumeContext.Provider>
      )

      const deleteButtons = screen.getAllByTitle('Delete this certification')
      fireEvent.click(deleteButtons[1]) // Delete Google Cloud Professional

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['AWS Solutions Architect', 'Azure Administrator'],
      })
    })

    it('should delete first certification correctly', () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'Google Cloud Professional',
        ],
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
          <Certification />
        </ResumeContext.Provider>
      )

      const deleteButtons = screen.getAllByTitle('Delete this certification')
      fireEvent.click(deleteButtons[0])

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['Google Cloud Professional'],
      })
    })

    it('should delete last certification correctly', () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'Google Cloud Professional',
        ],
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
          <Certification />
        </ResumeContext.Provider>
      )

      const deleteButtons = screen.getAllByTitle('Delete this certification')
      fireEvent.click(deleteButtons[1])

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['AWS Solutions Architect'],
      })
    })
  })

  describe('Input Changes', () => {
    it('should update certification value when input changes', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Solutions Architect'],
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
          <Certification />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Enter certification name')
      fireEvent.change(input, {
        target: { value: 'Google Cloud Professional' },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['Google Cloud Professional'],
      })
    })

    it('should update correct certification when multiple certifications exist', () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'Google Cloud Professional',
          'Azure Administrator',
        ],
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
          <Certification />
        </ResumeContext.Provider>
      )

      const inputs = screen.getAllByPlaceholderText('Enter certification name')
      fireEvent.change(inputs[1], {
        target: { value: 'Certified Kubernetes Administrator' },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: [
          'AWS Solutions Architect',
          'Certified Kubernetes Administrator',
          'Azure Administrator',
        ],
      })
    })

    it('should handle empty string input', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Solutions Architect'],
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
          <Certification />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Enter certification name')
      fireEvent.change(input, { target: { value: '' } })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: [''],
      })
    })
  })

  describe('Floating Labels', () => {
    it('should have floating-label-group wrapper for each input', () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'Google Cloud Professional',
        ],
      })
      const { container } = renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const floatingGroups = container.querySelectorAll('.floating-label-group')
      expect(floatingGroups).toHaveLength(2)
    })

    it('should have floating-label class for each label', () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'Google Cloud Professional',
        ],
      })
      const { container } = renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const floatingLabels = container.querySelectorAll('.floating-label')
      expect(floatingLabels).toHaveLength(2)
    })
  })

  describe('Layout and Styling', () => {
    it('should have hover states on certification containers', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Solutions Architect'],
      })
      const { container } = renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const certificationContainer = container.querySelector(
        '.hover\\:border-white\\/20'
      )
      expect(certificationContainer).toBeInTheDocument()
    })

    it('should have gradient accent on section heading with violet colors', () => {
      const { container } = renderWithContext(<Certification />)
      const gradient = container.querySelector(
        '.bg-gradient-to-b.from-violet-500.to-purple-500'
      )
      expect(gradient).toBeInTheDocument()
    })

    it('should have proper delete button styling', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Solutions Architect'],
      })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = screen.getByTitle('Delete this certification')
      expect(deleteButton).toHaveClass('text-red-400')
    })

    it('should have focus styles with violet color', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Solutions Architect'],
      })
      const { container } = renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const input = container.querySelector('.focus\\:border-violet-400')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should use semantic heading structure', () => {
      renderWithContext(<Certification />)
      const heading = screen.getByRole('heading', { name: 'Certifications' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })

    it('should have title attribute on delete buttons', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Solutions Architect'],
      })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = screen.getByTitle('Delete this certification')
      expect(deleteButton).toHaveAttribute('title', 'Delete this certification')
    })

    it('should use text input type', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Solutions Architect'],
      })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const input = screen.getByPlaceholderText('Enter certification name')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should have button type=button for delete buttons', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Solutions Architect'],
      })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = screen.getByTitle('Delete this certification')
      expect(deleteButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Edge Cases', () => {
    it('should render correctly with empty certifications array', () => {
      const mockData = createMockResumeData({ certifications: [] })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Certifications')).toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText('Enter certification name')
      ).not.toBeInTheDocument()
    })

    it('should handle special characters in certification input', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Certified Solutions Architect – Professional'],
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
          <Certification />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Enter certification name')
      fireEvent.change(input, {
        target: { value: 'Cisco CCNA® Routing & Switching' },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['Cisco CCNA® Routing & Switching'],
      })
    })

    it('should handle long certification names', () => {
      const longName =
        'Microsoft Certified: Azure Solutions Architect Expert with Advanced Cloud Infrastructure Management Specialization'
      const mockData = createMockResumeData({
        certifications: [longName],
      })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const input = screen.getByPlaceholderText('Enter certification name')
      expect(input).toHaveValue(longName)
    })

    it('should handle multiple certifications with same value', () => {
      const mockData = createMockResumeData({
        certifications: [
          'AWS Solutions Architect',
          'AWS Solutions Architect',
          'AWS Solutions Architect',
        ],
      })
      renderWithContext(<Certification />, {
        contextValue: { resumeData: mockData },
      })

      const inputs = screen.getAllByPlaceholderText('Enter certification name')
      expect(inputs).toHaveLength(3)
      inputs.forEach((input) => {
        expect(input).toHaveValue('AWS Solutions Architect')
      })
    })

    it('should handle certification names with numbers', () => {
      const mockData = createMockResumeData({
        certifications: ['CompTIA Security+ CE'],
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
          <Certification />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Enter certification name')
      fireEvent.change(input, {
        target: { value: 'ISO/IEC 27001:2013 Lead Auditor' },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['ISO/IEC 27001:2013 Lead Auditor'],
      })
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('should reorder certifications from first to last position', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Certified', 'Google Cloud', 'Azure Certified'],
      })
      const mockSetResumeData = jest.fn()

      renderWithContext(<Certification />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      capturedOnDragEnd!({
        source: { droppableId: 'certifications', index: 0 },
        destination: { droppableId: 'certifications', index: 2 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['Google Cloud', 'Azure Certified', 'AWS Certified'],
      })
    })

    it('should reorder certifications from last to first position', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Certified', 'Google Cloud', 'Azure Certified'],
      })
      const mockSetResumeData = jest.fn()

      renderWithContext(<Certification />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      capturedOnDragEnd!({
        source: { droppableId: 'certifications', index: 2 },
        destination: { droppableId: 'certifications', index: 0 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['Azure Certified', 'AWS Certified', 'Google Cloud'],
      })
    })

    it('should reorder certifications to adjacent position', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Certified', 'Google Cloud', 'Azure Certified'],
      })
      const mockSetResumeData = jest.fn()

      renderWithContext(<Certification />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      capturedOnDragEnd!({
        source: { droppableId: 'certifications', index: 0 },
        destination: { droppableId: 'certifications', index: 1 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: ['Google Cloud', 'AWS Certified', 'Azure Certified'],
      })
    })

    it('should not reorder when dropped in same position', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Certified', 'Google Cloud'],
      })
      const mockSetResumeData = jest.fn()

      renderWithContext(<Certification />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      capturedOnDragEnd!({
        source: { droppableId: 'certifications', index: 0 },
        destination: { droppableId: 'certifications', index: 0 },
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should not reorder when dropped outside droppable area', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Certified', 'Google Cloud'],
      })
      const mockSetResumeData = jest.fn()

      renderWithContext(<Certification />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      capturedOnDragEnd!({
        source: { droppableId: 'certifications', index: 0 },
        destination: null,
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })
  })
})
