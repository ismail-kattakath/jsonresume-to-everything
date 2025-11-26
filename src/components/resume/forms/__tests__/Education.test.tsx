import React from 'react'
import { axe } from 'jest-axe'
import Education from '@/components/resume/forms/Education'
import {
  renderWithContext,
  createMockResumeData,
  screen,
  fireEvent,
} from '@/lib/__tests__/test-utils'

// Store the onDragEnd callback for testing
let capturedOnDragEnd: ((result: unknown) => void) | null = null

// Mock @hello-pangea/dnd
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

describe('Education Component', () => {
  describe('Rendering', () => {
    it('should render section heading', () => {
      renderWithContext(<Education />)

      expect(screen.getByText('Education')).toBeInTheDocument()
    })

    it('should render show dates checkbox', () => {
      renderWithContext(<Education />)

      const checkbox = screen.getByRole('checkbox', { name: /show dates/i })
      expect(checkbox).toBeInTheDocument()
    })

    it('should render all form fields with floating labels', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test University',
            url: 'test.edu',
            degree: 'Bachelor of Science',
            startYear: '2015-09-01',
            endYear: '2019-06-01',
          },
        ],
      })

      renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Institution Name')).toBeInTheDocument()
      expect(screen.getByText('Website URL')).toBeInTheDocument()
      expect(screen.getByText('Degree / Program')).toBeInTheDocument()
      expect(screen.getAllByText('Start Date')[0]).toBeInTheDocument()
      expect(screen.getAllByText('End Date')[0]).toBeInTheDocument()
    })

    it('should display education data in inputs', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'MIT',
            url: 'mit.edu',
            degree: 'Computer Science',
            startYear: '2015-09-01',
            endYear: '2019-06-01',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const schoolInput = container.querySelector(
        'input[name="school"]'
      ) as HTMLInputElement
      const urlInput = container.querySelector(
        'input[name="url"]'
      ) as HTMLInputElement
      const degreeInput = container.querySelector(
        'input[name="degree"]'
      ) as HTMLInputElement

      expect(schoolInput?.value).toBe('MIT')
      expect(urlInput?.value).toBe('mit.edu')
      expect(degreeInput?.value).toBe('Computer Science')
    })

    it('should render add button with FormButton', () => {
      renderWithContext(<Education />)

      const addButton = screen.getByText(/Add Education/i)
      expect(addButton).toBeInTheDocument()
    })

    it('should render multiple education entries', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'University 1',
            url: 'uni1.edu',
            degree: 'Degree 1',
            startYear: '2015-09-01',
            endYear: '2019-06-01',
          },
          {
            school: 'University 2',
            url: 'uni2.edu',
            degree: 'Degree 2',
            startYear: '2019-09-01',
            endYear: '2021-06-01',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const schoolInputs = container.querySelectorAll('input[name="school"]')
      expect(schoolInputs.length).toBe(2)
    })
  })

  describe('Show Dates Toggle', () => {
    it('should reflect showEducationDates state in checkbox', () => {
      const mockData = createMockResumeData({
        showEducationDates: true,
        education: [],
      })

      renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const checkbox = screen.getByRole('checkbox', {
        name: /show dates/i,
      }) as HTMLInputElement

      expect(checkbox.checked).toBe(true)
    })

    it('should toggle showEducationDates when checkbox is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        showEducationDates: false,
        education: [],
      })

      renderWithContext(<Education />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const checkbox = screen.getByRole('checkbox', { name: /show dates/i })

      fireEvent.click(checkbox)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        showEducationDates: true,
      })
    })
  })

  describe('Add Functionality', () => {
    it('should add new education entry when add button is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Existing University',
            url: 'existing.edu',
            degree: 'Existing Degree',
            startYear: '2015-09-01',
            endYear: '2019-06-01',
          },
        ],
      })

      renderWithContext(<Education />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const addButton = screen.getByText(/Add Education/i).closest('button')

      if (addButton) {
        fireEvent.click(addButton)

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          education: [
            ...mockData.education,
            { school: '', url: '', degree: '', startYear: '', endYear: '' },
          ],
        })
      }
    })
  })

  describe('Delete Functionality', () => {
    it('should render delete button for each entry', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test University',
            url: 'test.edu',
            degree: 'Test Degree',
            startYear: '2015-09-01',
            endYear: '2019-06-01',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete this education"]'
      )

      expect(deleteButton).toBeInTheDocument()
    })

    it('should delete education entry when delete button is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        education: [
          {
            school: 'University 1',
            url: 'uni1.edu',
            degree: 'Degree 1',
            startYear: '2015-09-01',
            endYear: '2019-06-01',
          },
          {
            school: 'University 2',
            url: 'uni2.edu',
            degree: 'Degree 2',
            startYear: '2019-09-01',
            endYear: '2021-06-01',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const deleteButtons = container.querySelectorAll(
        'button[title="Delete this education"]'
      )

      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0])

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          education: [mockData.education[1]],
        })
      }
    })
  })

  describe('Input Changes', () => {
    it('should handle school name changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        education: [
          {
            school: '',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const schoolInput = container.querySelector('input[name="school"]')

      if (schoolInput) {
        fireEvent.change(schoolInput, {
          target: { name: 'school', value: 'Harvard University' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })

    it('should strip https:// from URL input', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const urlInput = container.querySelector('input[name="url"]')

      if (urlInput) {
        fireEvent.change(urlInput, {
          target: { name: 'url', value: 'https://university.edu' },
        })

        const callArg = mockSetResumeData.mock.calls[0][0]
        expect(callArg.education[0].url).toBe('university.edu')
      }
    })

    it('should handle degree changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const degreeInput = container.querySelector('input[name="degree"]')

      if (degreeInput) {
        fireEvent.change(degreeInput, {
          target: { name: 'degree', value: 'Master of Science' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })

    it('should handle date changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const startYearInput = container.querySelector('input[name="startYear"]')

      if (startYearInput) {
        fireEvent.change(startYearInput, {
          target: { name: 'startYear', value: '2015-09-01' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })
  })

  describe('Floating Labels', () => {
    it('should have floating-label-group for all input fields', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const floatingLabelGroups = container.querySelectorAll(
        '.floating-label-group'
      )

      // Should have 5 groups per entry (school, url, degree, startYear, endYear)
      expect(floatingLabelGroups.length).toBe(5)
    })

    it('should have floating-label class on all labels', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const floatingLabels = container.querySelectorAll('.floating-label')

      // Should have 5 labels per entry
      expect(floatingLabels.length).toBe(5)
    })
  })

  describe('Layout and Styling', () => {
    it('should apply hover effects to entry containers', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const entryContainer = container.querySelector('.group')

      expect(entryContainer).toHaveClass(
        'hover:border-white/20',
        'hover:bg-white/10'
      )
    })

    it('should use responsive layout for date inputs', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const dateContainer = container.querySelector(
        '.flex.flex-col.sm\\:flex-row'
      )

      expect(dateContainer).toBeInTheDocument()
    })

    it('should style show dates checkbox label', () => {
      renderWithContext(<Education />)

      const label = screen.getByText('Show Dates').closest('label')

      expect(label).toHaveClass('cursor-pointer')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test University',
            url: 'test.edu',
            degree: 'Computer Science',
            startYear: '2015-09-01',
            endYear: '2019-06-01',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      // Exclude drag-and-drop wrapper from accessibility check
      // The draggable container creates nested interactive elements which is expected behavior
      const results = await axe(container, {
        rules: {
          'nested-interactive': { enabled: false },
        },
      })

      expect(results).toHaveNoViolations()
    })

    it('should have descriptive title attribute on delete button', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete this education"]'
      )

      expect(deleteButton).toHaveAttribute('title')
    })

    it('should have proper input types', () => {
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const urlInput = container.querySelector('input[name="url"]')
      const startYearInput = container.querySelector('input[name="startYear"]')

      expect(urlInput).toHaveAttribute('type', 'url')
      expect(startYearInput).toHaveAttribute('type', 'date')
    })

    it('should have id on checkbox', () => {
      renderWithContext(<Education />)

      const checkbox = screen.getByRole('checkbox', { name: /show dates/i })

      expect(checkbox).toHaveAttribute('id', 'showEducationDates')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty education array', () => {
      const mockData = createMockResumeData({
        education: [],
      })

      renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      // Should still render the section heading and add button
      expect(screen.getByText('Education')).toBeInTheDocument()
    })

    it('should handle URLs with existing https:// protocol', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        education: [
          {
            school: 'Test',
            url: '',
            degree: '',
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const urlInput = container.querySelector('input[name="url"]')

      if (urlInput) {
        fireEvent.change(urlInput, {
          target: { name: 'url', value: 'https://university.edu' },
        })

        const callArg = mockSetResumeData.mock.calls[0][0]
        // Should strip the https://
        expect(callArg.education[0].url).toBe('university.edu')
      }
    })

    it('should handle special characters in input values', () => {
      const specialData = createMockResumeData({
        education: [
          {
            school: "St. Mary's College",
            url: 'stmarys.edu',
            degree: "Bachelor's Degree (Honours)",
            startYear: '2015-09-01',
            endYear: '2019-06-01',
          },
        ],
      })

      const { container } = renderWithContext(<Education />, {
        contextValue: { resumeData: specialData },
      })

      const schoolInput = container.querySelector(
        'input[name="school"]'
      ) as HTMLInputElement
      const degreeInput = container.querySelector(
        'input[name="degree"]'
      ) as HTMLInputElement

      expect(schoolInput?.value).toBe("St. Mary's College")
      expect(degreeInput?.value).toBe("Bachelor's Degree (Honours)")
    })

    it('should handle unchecked showEducationDates checkbox', () => {
      const mockData = createMockResumeData({
        showEducationDates: false,
        education: [],
      })

      renderWithContext(<Education />, {
        contextValue: { resumeData: mockData },
      })

      const checkbox = screen.getByRole('checkbox', {
        name: /show dates/i,
      }) as HTMLInputElement

      expect(checkbox.checked).toBe(false)
    })
  })

  describe('Drag and Drop Functionality', () => {
    const mockSetResumeData = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      capturedOnDragEnd = null
    })

    describe('onDragEnd - No Destination', () => {
      it('should not update data when dropped outside droppable area', () => {
        const mockData = createMockResumeData({
          education: [
            {
              school: 'University A',
              url: 'ua.edu',
              degree: 'Bachelor of Science',
              startYear: '2015-09-01',
              endYear: '2019-06-01',
            },
          ],
        })

        renderWithContext(<Education />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        capturedOnDragEnd!({
          source: { droppableId: 'education', index: 0 },
          destination: null,
        })

        expect(mockSetResumeData).not.toHaveBeenCalled()
      })
    })

    describe('onDragEnd - Same Position', () => {
      it('should not update data when dropped at same position', () => {
        const mockData = createMockResumeData({
          education: [
            {
              school: 'University A',
              url: 'ua.edu',
              degree: 'Bachelor of Science',
              startYear: '2015-09-01',
              endYear: '2019-06-01',
            },
          ],
        })

        renderWithContext(<Education />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        capturedOnDragEnd!({
          source: { droppableId: 'education', index: 0 },
          destination: { droppableId: 'education', index: 0 },
        })

        expect(mockSetResumeData).not.toHaveBeenCalled()
      })
    })

    describe('onDragEnd - Reordering Education Items', () => {
      it('should reorder education items from first to last position', () => {
        const mockData = createMockResumeData({
          education: [
            {
              school: 'University A',
              url: 'ua.edu',
              degree: 'BS Computer Science',
              startYear: '2015-09-01',
              endYear: '2019-06-01',
            },
            {
              school: 'University B',
              url: 'ub.edu',
              degree: 'MS Software Engineering',
              startYear: '2019-09-01',
              endYear: '2021-06-01',
            },
            {
              school: 'University C',
              url: 'uc.edu',
              degree: 'PhD Computer Science',
              startYear: '2021-09-01',
              endYear: '2024-06-01',
            },
          ],
        })

        renderWithContext(<Education />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        // Move first item to last position
        capturedOnDragEnd!({
          source: { droppableId: 'education', index: 0 },
          destination: { droppableId: 'education', index: 2 },
        })

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          education: [
            mockData.education[1],
            mockData.education[2],
            mockData.education[0],
          ],
        })
      })

      it('should reorder education items from last to first position', () => {
        const mockData = createMockResumeData({
          education: [
            {
              school: 'University A',
              url: 'ua.edu',
              degree: 'Bachelor Degree',
              startYear: '2015-09-01',
              endYear: '2019-06-01',
            },
            {
              school: 'University B',
              url: 'ub.edu',
              degree: 'Master Degree',
              startYear: '2019-09-01',
              endYear: '2021-06-01',
            },
          ],
        })

        renderWithContext(<Education />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        // Move last item to first position
        capturedOnDragEnd!({
          source: { droppableId: 'education', index: 1 },
          destination: { droppableId: 'education', index: 0 },
        })

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          education: [mockData.education[1], mockData.education[0]],
        })
      })

      it('should reorder education items in middle positions', () => {
        const mockData = createMockResumeData({
          education: [
            {
              school: 'A',
              url: '',
              degree: 'Degree A',
              startYear: '',
              endYear: '',
            },
            {
              school: 'B',
              url: '',
              degree: 'Degree B',
              startYear: '',
              endYear: '',
            },
            {
              school: 'C',
              url: '',
              degree: 'Degree C',
              startYear: '',
              endYear: '',
            },
            {
              school: 'D',
              url: '',
              degree: 'Degree D',
              startYear: '',
              endYear: '',
            },
          ],
        })

        renderWithContext(<Education />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        // Move second item to third position
        capturedOnDragEnd!({
          source: { droppableId: 'education', index: 1 },
          destination: { droppableId: 'education', index: 2 },
        })

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          education: [
            mockData.education[0],
            mockData.education[2],
            mockData.education[1],
            mockData.education[3],
          ],
        })
      })
    })
  })
})
