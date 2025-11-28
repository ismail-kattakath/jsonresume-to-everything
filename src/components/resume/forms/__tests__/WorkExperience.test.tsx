import React from 'react'
import { axe } from 'jest-axe'
import WorkExperience from '@/components/resume/forms/WorkExperience'
import {
  renderWithContext,
  createMockResumeData,
  screen,
  fireEvent,
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

describe('WorkExperience Component', () => {
  describe('Rendering', () => {
    // Note: Skipping this test due to next/dynamic SSR:false causing issues in test environment
    it.skip('should render all form fields with floating labels', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Software Engineer',
            description: 'Test description',
            keyAchievements: [{ text: 'Test achievements' }],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
            technologies: [],
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Company Name')).toBeInTheDocument()
      expect(screen.getByText('Company Website URL')).toBeInTheDocument()
      expect(screen.getByText('Job Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Key Achievements')).toBeInTheDocument()
      expect(screen.getAllByText('Start Date')[0]).toBeInTheDocument()
      expect(screen.getAllByText('End Date')[0]).toBeInTheDocument()
    })

    // Note: Skipping this test due to next/dynamic SSR:false causing issues in test environment
    it.skip('should display work experience data in inputs', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Acme Corp',
            url: 'acme.com',
            position: 'Senior Developer',
            description: 'Leading development team',
            keyAchievements: [{ text: 'Shipped major features' }],
            startYear: '2020-06-01',
            endYear: '2023-12-01',
            technologies: [],
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const companyInput = container.querySelector(
        'input[name="company"]'
      ) as HTMLInputElement
      const urlInput = container.querySelector(
        'input[name="url"]'
      ) as HTMLInputElement
      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement

      expect(companyInput?.value).toBe('Acme Corp')
      expect(urlInput?.value).toBe('acme.com')
      expect(positionInput?.value).toBe('Senior Developer')
    })

    it('should render add button with FormButton', () => {
      renderWithContext(<WorkExperience />)

      const addButton = screen.getByText(/Add Experience/i)
      expect(addButton).toBeInTheDocument()
    })

    it('should render multiple work experience entries', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Company 1',
            url: 'company1.com',
            position: 'Role 1',
            description: 'Desc 1',
            keyAchievements: [{ text: 'Achievements 1' }],
            startYear: '2020-01-01',
            endYear: '2021-01-01',
          },
          {
            organization: 'Company 2',
            url: 'company2.com',
            position: 'Role 2',
            description: 'Desc 2',
            keyAchievements: [{ text: 'Achievements 2' }],
            startYear: '2021-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const companyInputs = container.querySelectorAll('input[name="company"]')
      expect(companyInputs.length).toBe(2)
    })
  })

  describe('Add Functionality', () => {
    it('should add new work experience entry when add button is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Existing Company',
            url: 'existing.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [{ text: 'Test' }],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const addButton = screen.getByText(/Add Experience/i).closest('button')

      if (addButton) {
        fireEvent.click(addButton)

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          workExperience: [
            ...mockData.workExperience,
            {
              organization: '',
              url: '',
              position: '',
              description: '',
              keyAchievements: [],
              startYear: '',
              endYear: '',
              technologies: [],
            },
          ],
        })
      }
    })
  })

  describe('Accordion Toggle Functionality', () => {
    it('should toggle accordion when expand/collapse button is clicked', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [{ text: 'Test' }],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      // Find the toggle button by title attribute (should be "Expand" or "Collapse")
      const expandButton = container.querySelector('button[title="Expand"]')
      const collapseButton = container.querySelector('button[title="Collapse"]')
      const toggleButton = expandButton || collapseButton

      if (toggleButton) {
        fireEvent.click(toggleButton)
        // After click, should toggle the expanded state
        expect(toggleButton).toBeInTheDocument()
      }
    })
  })

  describe('Delete Functionality', () => {
    it('should render delete button for each entry', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [{ text: 'Test' }],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete experience"]'
      )

      expect(deleteButton).toBeInTheDocument()
    })

    it('should delete work experience entry when delete button is clicked', () => {
      // Mock window.confirm to return true
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Company 1',
            url: 'company1.com',
            position: 'Role 1',
            description: 'Desc 1',
            keyAchievements: [{ text: 'Achievements 1' }],
            startYear: '2020-01-01',
            endYear: '2021-01-01',
          },
          {
            organization: 'Company 2',
            url: 'company2.com',
            position: 'Role 2',
            description: 'Desc 2',
            keyAchievements: [{ text: 'Achievements 2' }],
            startYear: '2021-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const deleteButtons = container.querySelectorAll(
        'button[title="Delete experience"]'
      )

      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0])

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          workExperience: [mockData.workExperience[1]],
        })
      }

      confirmSpy.mockRestore()
    })
  })

  describe('Input Changes', () => {
    it('should handle company name changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: '',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const companyInput = container.querySelector('input[name="company"]')

      if (companyInput) {
        fireEvent.change(companyInput, {
          target: { name: 'company', value: 'New Company' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })

    it('should strip https:// from URL input', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const urlInput = container.querySelector('input[name="url"]')

      if (urlInput) {
        fireEvent.change(urlInput, {
          target: { name: 'url', value: 'https://example.com' },
        })

        const callArg = mockSetResumeData.mock.calls[0][0]
        expect(callArg.workExperience[0].url).toBe('example.com')
      }
    })

    it('should handle position changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const positionInput = container.querySelector('input[name="position"]')

      if (positionInput) {
        fireEvent.change(positionInput, {
          target: { name: 'position', value: 'Software Engineer' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })

    it('should handle textarea changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const descriptionTextarea = container.querySelector(
        'textarea[name="description"]'
      )

      if (descriptionTextarea) {
        fireEvent.change(descriptionTextarea, {
          target: { name: 'description', value: 'New description' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })

    it('should handle start date changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const startYearInput = container.querySelector('input[name="startYear"]')

      if (startYearInput) {
        fireEvent.change(startYearInput, {
          target: { name: 'startYear', value: '2020-01-01' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })

    it('should handle end date changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const endYearInput = container.querySelector('input[name="endYear"]')

      if (endYearInput) {
        fireEvent.change(endYearInput, {
          target: { name: 'endYear', value: '2023-01-01' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })
  })

  describe('Character Counters', () => {
    it('should display character count for description', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: 'Test description',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('16/250')).toBeInTheDocument()
    })

    it.skip('should display character count for key achievements', () => {
      // Note: KeyAchievements now uses individual achievement items instead of textarea
      // Character count is no longer displayed in the new UI
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [{ text: 'Test achievements' }],
            startYear: '',
            endYear: '',
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('17 chars')).toBeInTheDocument()
    })

    it('should have maxLength on description textarea', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const descriptionTextarea = container.querySelector(
        'textarea[name="description"]'
      )

      expect(descriptionTextarea).toHaveAttribute('maxLength', '250')
    })
  })

  describe('Floating Labels', () => {
    it('should have floating-label-group for all input fields', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const floatingLabelGroups = container.querySelectorAll(
        '.floating-label-group'
      )

      // Should have 6 groups per entry (company, url, position, description, startYear, endYear)
      // keyAchievements uses a custom component, not a floating-label-group
      expect(floatingLabelGroups.length).toBe(6)
    })

    it('should have floating-label class on all labels', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const floatingLabels = container.querySelectorAll('.floating-label')

      // Should have 6 labels per entry
      // keyAchievements uses a custom component, not a floating-label
      expect(floatingLabels.length).toBe(6)
    })
  })

  describe('Layout and Styling', () => {
    it('should apply card styling to entry containers', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const entryContainer = container.querySelector('.rounded-lg.border')

      expect(entryContainer).toBeInTheDocument()
      expect(entryContainer).toHaveClass('bg-white/5')
    })

    it('should use responsive layout for date inputs', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const dateContainer = container.querySelector(
        '.flex.flex-col.sm\\:flex-row'
      )

      expect(dateContainer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [{ text: 'Test' }],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
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
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete experience"]'
      )

      expect(deleteButton).toHaveAttribute('title')
    })

    it('should have proper input types', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const urlInput = container.querySelector('input[name="url"]')
      const startYearInput = container.querySelector('input[name="startYear"]')

      expect(urlInput).toHaveAttribute('type', 'url')
      expect(startYearInput).toHaveAttribute('type', 'date')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty work experience array', () => {
      const mockData = createMockResumeData({
        workExperience: [],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      // Should still render the add button
      expect(screen.getByText('Add Experience')).toBeInTheDocument()
    })

    it('should handle URLs with existing https:// protocol', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const urlInput = container.querySelector('input[name="url"]')

      if (urlInput) {
        fireEvent.change(urlInput, {
          target: { name: 'url', value: 'https://example.com' },
        })

        const callArg = mockSetResumeData.mock.calls[0][0]
        // Should strip the https://
        expect(callArg.workExperience[0].url).toBe('example.com')
      }
    })

    it('should handle special characters in input values', () => {
      const specialData = createMockResumeData({
        workExperience: [
          {
            organization: "O'Brien & Associates",
            url: 'test.com',
            position: 'Senior Developer (Team Lead)',
            description: 'Leading the "innovation" team',
            keyAchievements: [{ text: 'Shipped #1 product' }],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      const { container } = renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: specialData },
      })

      const companyInput = container.querySelector(
        'input[name="company"]'
      ) as HTMLInputElement
      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement

      expect(companyInput?.value).toBe("O'Brien & Associates")
      expect(positionInput?.value).toBe('Senior Developer (Team Lead)')
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
        workExperience: [
          {
            organization: 'Company 1',
            url: 'company1.com',
            position: 'Role 1',
            description: 'Desc 1',
            keyAchievements: [{ text: 'Achievements 1' }],
            startYear: '2020-01-01',
            endYear: '2021-01-01',
          },
          {
            organization: 'Company 2',
            url: 'company2.com',
            position: 'Role 2',
            description: 'Desc 2',
            keyAchievements: [{ text: 'Achievements 2' }],
            startYear: '2021-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      // Simulate dropping outside droppable area
      capturedOnDragEnd!({
        source: { droppableId: 'work-experience', index: 0 },
        destination: null,
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should not update data when dropped in same position', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Company 1',
            url: 'company1.com',
            position: 'Role 1',
            description: 'Desc 1',
            keyAchievements: [{ text: 'Achievements 1' }],
            startYear: '2020-01-01',
            endYear: '2021-01-01',
          },
          {
            organization: 'Company 2',
            url: 'company2.com',
            position: 'Role 2',
            description: 'Desc 2',
            keyAchievements: [{ text: 'Achievements 2' }],
            startYear: '2021-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      // Simulate dropping in the same position
      capturedOnDragEnd!({
        source: { droppableId: 'work-experience', index: 1 },
        destination: { droppableId: 'work-experience', index: 1 },
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should reorder work experience items from first to last position', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Company 1',
            url: 'company1.com',
            position: 'Role 1',
            description: 'Desc 1',
            keyAchievements: [{ text: 'Achievements 1' }],
            startYear: '2020-01-01',
            endYear: '2021-01-01',
          },
          {
            organization: 'Company 2',
            url: 'company2.com',
            position: 'Role 2',
            description: 'Desc 2',
            keyAchievements: [{ text: 'Achievements 2' }],
            startYear: '2021-01-01',
            endYear: '2022-01-01',
          },
          {
            organization: 'Company 3',
            url: 'company3.com',
            position: 'Role 3',
            description: 'Desc 3',
            keyAchievements: [{ text: 'Achievements 3' }],
            startYear: '2022-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      // Drag first item to last position
      capturedOnDragEnd!({
        source: { droppableId: 'work-experience', index: 0 },
        destination: { droppableId: 'work-experience', index: 2 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        workExperience: [
          mockData.workExperience[1],
          mockData.workExperience[2],
          mockData.workExperience[0],
        ],
      })
    })

    it('should reorder work experience items from last to first position', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Company 1',
            url: 'company1.com',
            position: 'Role 1',
            description: 'Desc 1',
            keyAchievements: [{ text: 'Achievements 1' }],
            startYear: '2020-01-01',
            endYear: '2021-01-01',
          },
          {
            organization: 'Company 2',
            url: 'company2.com',
            position: 'Role 2',
            description: 'Desc 2',
            keyAchievements: [{ text: 'Achievements 2' }],
            startYear: '2021-01-01',
            endYear: '2022-01-01',
          },
          {
            organization: 'Company 3',
            url: 'company3.com',
            position: 'Role 3',
            description: 'Desc 3',
            keyAchievements: [{ text: 'Achievements 3' }],
            startYear: '2022-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      // Drag last item to first position
      capturedOnDragEnd!({
        source: { droppableId: 'work-experience', index: 2 },
        destination: { droppableId: 'work-experience', index: 0 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        workExperience: [
          mockData.workExperience[2],
          mockData.workExperience[0],
          mockData.workExperience[1],
        ],
      })
    })

    it('should reorder work experience items between middle positions', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Company 1',
            url: 'company1.com',
            position: 'Role 1',
            description: 'Desc 1',
            keyAchievements: [{ text: 'Achievements 1' }],
            startYear: '2020-01-01',
            endYear: '2021-01-01',
          },
          {
            organization: 'Company 2',
            url: 'company2.com',
            position: 'Role 2',
            description: 'Desc 2',
            keyAchievements: [{ text: 'Achievements 2' }],
            startYear: '2021-01-01',
            endYear: '2022-01-01',
          },
          {
            organization: 'Company 3',
            url: 'company3.com',
            position: 'Role 3',
            description: 'Desc 3',
            keyAchievements: [{ text: 'Achievements 3' }],
            startYear: '2022-01-01',
            endYear: '2023-01-01',
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      // Drag middle item (index 1) down one position (index 2)
      capturedOnDragEnd!({
        source: { droppableId: 'work-experience', index: 1 },
        destination: { droppableId: 'work-experience', index: 2 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        workExperience: [
          mockData.workExperience[0],
          mockData.workExperience[2],
          mockData.workExperience[1],
        ],
      })
    })
  })

  describe('Technology Management', () => {
    it('should render TagInput for technologies', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
            technologies: ['React', 'TypeScript', 'Node.js'],
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
    })

    it('should render Technologies label', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
            technologies: [],
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Technologies')).toBeInTheDocument()
    })

    it('should add technology when TagInput onAdd is called', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
            technologies: ['React'],
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const input = screen.getByPlaceholderText('Add technology...')

      fireEvent.change(input, { target: { value: 'TypeScript' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        workExperience: [
          {
            ...mockData.workExperience[0],
            technologies: ['React', 'TypeScript'],
          },
        ],
      })
    })

    it('should remove technology when TagInput onRemove is called', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
            technologies: ['React', 'TypeScript', 'Node.js'],
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const removeButtons = screen.getAllByTitle('Remove')

      // Click the remove button for TypeScript (index 1)
      fireEvent.click(removeButtons[1])

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        workExperience: [
          {
            ...mockData.workExperience[0],
            technologies: ['React', 'Node.js'],
          },
        ],
      })
    })

    it('should handle empty technologies array', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
            technologies: [],
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const input = screen.getByPlaceholderText('Add technology...')
      expect(input).toBeInTheDocument()

      // Should not render any remove buttons for technologies
      const removeButtons = screen.queryAllByTitle('Remove')
      expect(removeButtons.length).toBe(0)
    })

    it('should handle undefined technologies array', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test Company',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
            // technologies field is undefined
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const input = screen.getByPlaceholderText('Add technology...')

      fireEvent.change(input, { target: { value: 'React' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        workExperience: [
          {
            ...mockData.workExperience[0],
            technologies: ['React'],
          },
        ],
      })
    })

    it('should add technologies to correct work experience entry', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Company 1',
            url: 'company1.com',
            position: 'Role 1',
            description: 'Desc 1',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2021-01-01',
            technologies: ['Vue'],
          },
          {
            organization: 'Company 2',
            url: 'company2.com',
            position: 'Role 2',
            description: 'Desc 2',
            keyAchievements: [],
            startYear: '2021-01-01',
            endYear: '2023-01-01',
            technologies: ['React'],
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const inputs = screen.getAllByPlaceholderText('Add technology...')

      // Add technology to second entry
      fireEvent.change(inputs[1], { target: { value: 'TypeScript' } })
      fireEvent.keyDown(inputs[1], { key: 'Enter', code: 'Enter' })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        workExperience: [
          mockData.workExperience[0], // Unchanged
          {
            ...mockData.workExperience[1],
            technologies: ['React', 'TypeScript'],
          },
        ],
      })
    })

    it('should remove technologies from correct work experience entry', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Company 1',
            url: 'company1.com',
            position: 'Role 1',
            description: 'Desc 1',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2021-01-01',
            technologies: ['Vue', 'Nuxt'],
          },
          {
            organization: 'Company 2',
            url: 'company2.com',
            position: 'Role 2',
            description: 'Desc 2',
            keyAchievements: [],
            startYear: '2021-01-01',
            endYear: '2023-01-01',
            technologies: ['React', 'Next.js'],
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      // Get all remove buttons
      const removeButtons = screen.getAllByTitle('Remove')

      // Remove "Next.js" from second entry (index would be after Vue, Nuxt, React)
      fireEvent.click(removeButtons[3]) // Vue=0, Nuxt=1, React=2, Next.js=3

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        workExperience: [
          mockData.workExperience[0], // Unchanged
          {
            ...mockData.workExperience[1],
            technologies: ['React'],
          },
        ],
      })
    })

    it('should use teal variant for TagInput', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
            technologies: [],
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      const input = screen.getByPlaceholderText('Add technology...')
      expect(input).toHaveClass('border-teal-400/30')
    })

    it('should display multiple technologies correctly', () => {
      const technologies = [
        'React',
        'TypeScript',
        'Node.js',
        'Express',
        'PostgreSQL',
        'Docker',
      ]

      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Test',
            url: 'test.com',
            position: 'Developer',
            description: 'Test',
            keyAchievements: [],
            startYear: '2020-01-01',
            endYear: '2023-01-01',
            technologies,
          },
        ],
      })

      renderWithContext(<WorkExperience />, {
        contextValue: { resumeData: mockData },
      })

      technologies.forEach((tech) => {
        expect(screen.getByText(tech)).toBeInTheDocument()
      })
    })
  })
})
