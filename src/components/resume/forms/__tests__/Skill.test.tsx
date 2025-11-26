import React from 'react'
import Skill from '@/components/resume/forms/Skill'
import {
  renderWithContext,
  createMockResumeData,
  screen,
  fireEvent,
} from '@/lib/__tests__/test-utils'

// Store the onDragEnd callback for testing
let capturedOnDragEnd: ((result: unknown) => void) | null = null

// Mock drag-and-drop components
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => {
    capturedOnDragEnd = onDragEnd
    return (
      <div data-testid="drag-drop-context" onDragEnd={onDragEnd}>
        {children}
      </div>
    )
  },
  Droppable: ({ children, droppableId }: any) => {
    const provided = {
      droppableProps: {
        'data-droppable-id': droppableId,
      },
      innerRef: jest.fn(),
      placeholder: null,
    }
    const snapshot = {
      isDraggingOver: false,
    }
    return (
      <div data-testid="droppable" {...provided.droppableProps}>
        {children(provided, snapshot)}
      </div>
    )
  },
  Draggable: ({ children, draggableId, index }: any) => {
    const provided = {
      draggableProps: {
        'data-draggable-id': draggableId,
        'data-index': index,
      },
      dragHandleProps: {},
      innerRef: jest.fn(),
    }
    const snapshot = {
      isDragging: false,
    }
    return (
      <div data-testid="draggable" {...provided.draggableProps}>
        {children(provided, snapshot)}
      </div>
    )
  },
}))

describe('Skill Component', () => {
  describe('Rendering', () => {
    it('should render section heading with title prop', () => {
      const mockData = createMockResumeData({
        skills: [{ title: 'Programming Languages', skills: [] }],
      })

      renderWithContext(<Skill title="Programming Languages" />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Programming Languages')).toBeInTheDocument()
    })

    it('should render skills with text and highlight checkbox', async () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Technical Skills',
            skills: [
              { text: 'JavaScript', highlight: false },
              { text: 'TypeScript', highlight: true },
            ],
          },
        ],
      })

      const { container } = renderWithContext(
        <Skill title="Technical Skills" />,
        {
          contextValue: { resumeData: mockData },
        }
      )

      // Wait a tick for dynamic imports to resolve
      await new Promise((resolve) => setTimeout(resolve, 0))

      const skillInputs = container.querySelectorAll('input[type="text"]')
      expect(skillInputs.length).toBe(2)

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(2)
    })

    it('should display skill text in inputs', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Languages',
            skills: [{ text: 'Python', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Languages" />, {
        contextValue: { resumeData: mockData },
      })

      const skillInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement

      expect(skillInput?.value).toBe('Python')
    })

    it('should reflect highlight state in checkbox', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Tools',
            skills: [
              { text: 'Git', highlight: true },
              { text: 'Docker', highlight: false },
            ],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Tools" />, {
        contextValue: { resumeData: mockData },
      })

      const checkboxes = container.querySelectorAll(
        'input[type="checkbox"]'
      ) as NodeListOf<HTMLInputElement>

      expect(checkboxes[0].checked).toBe(true)
      expect(checkboxes[1].checked).toBe(false)
    })

    it('should render add button with FormButton', () => {
      const mockData = createMockResumeData({
        skills: [{ title: 'Frameworks', skills: [] }],
      })

      renderWithContext(<Skill title="Frameworks" />, {
        contextValue: { resumeData: mockData },
      })

      const addButton = screen.getByText(/Add Frameworks/i)
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Highlight Toggle', () => {
    it('should toggle highlight when checkbox is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'React', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement

      fireEvent.click(checkbox)

      expect(mockSetResumeData).toHaveBeenCalled()
      const callback = mockSetResumeData.mock.calls[0][0]
      const newState = callback(mockData)

      expect(newState.skills[0].skills[0].highlight).toBe(true)
    })

    it('should untoggle highlight when checked checkbox is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Node.js', highlight: true }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement

      fireEvent.click(checkbox)

      expect(mockSetResumeData).toHaveBeenCalled()
      const callback = mockSetResumeData.mock.calls[0][0]
      const newState = callback(mockData)

      expect(newState.skills[0].skills[0].highlight).toBe(false)
    })

    it('should toggle correct skill when multiple skills exist', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'React', highlight: false },
              { text: 'Vue', highlight: false },
            ],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const checkboxes = container.querySelectorAll(
        'input[type="checkbox"]'
      ) as NodeListOf<HTMLInputElement>

      fireEvent.click(checkboxes[1])

      expect(mockSetResumeData).toHaveBeenCalled()
      const callback = mockSetResumeData.mock.calls[0][0]
      const newState = callback(mockData)

      expect(newState.skills[0].skills[0].highlight).toBe(false)
      expect(newState.skills[0].skills[1].highlight).toBe(true)
    })
  })

  describe('Add Functionality', () => {
    it('should add new skill when add button is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Existing Skill', highlight: false }],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const addButton = screen.getByText(/Add Skills/i).closest('button')

      if (addButton) {
        fireEvent.click(addButton)

        expect(mockSetResumeData).toHaveBeenCalled()
        const callback = mockSetResumeData.mock.calls[0][0]
        const newState = callback(mockData)

        expect(newState.skills[0].skills.length).toBe(2)
        expect(newState.skills[0].skills[1]).toEqual({
          text: '',
          highlight: false,
        })
      }
    })
  })

  describe('Delete Functionality', () => {
    it('should render delete button for each skill', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test Skill', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete this skill"]'
      )

      expect(deleteButton).toBeInTheDocument()
    })

    it('should delete skill when delete button is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'Skill 1', highlight: false },
              { text: 'Skill 2', highlight: false },
            ],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const deleteButtons = container.querySelectorAll(
        'button[title="Delete this skill"]'
      )

      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0])

        expect(mockSetResumeData).toHaveBeenCalled()
        const callback = mockSetResumeData.mock.calls[0][0]
        const newState = callback(mockData)

        expect(newState.skills[0].skills.length).toBe(1)
        expect(newState.skills[0].skills[0].text).toBe('Skill 2')
      }
    })
  })

  describe('Input Changes', () => {
    it('should handle skill text changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: '', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const skillInput = container.querySelector('input[type="text"]')

      if (skillInput) {
        fireEvent.change(skillInput, {
          target: { value: 'JavaScript' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
        const callback = mockSetResumeData.mock.calls[0][0]
        const newState = callback(mockData)

        expect(newState.skills[0].skills[0].text).toBe('JavaScript')
      }
    })

    it('should update correct skill when multiple skills exist', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'Skill 1', highlight: false },
              { text: 'Skill 2', highlight: false },
            ],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const skillInputs = container.querySelectorAll(
        'input[type="text"]'
      ) as NodeListOf<HTMLInputElement>

      fireEvent.change(skillInputs[1], {
        target: { value: 'Updated Skill 2' },
      })

      expect(mockSetResumeData).toHaveBeenCalled()
      const callback = mockSetResumeData.mock.calls[0][0]
      const newState = callback(mockData)

      expect(newState.skills[0].skills[0].text).toBe('Skill 1')
      expect(newState.skills[0].skills[1].text).toBe('Updated Skill 2')
    })
  })

  describe('Floating Labels', () => {
    it('should have floating-label-group for each skill input', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'Skill 1', highlight: false },
              { text: 'Skill 2', highlight: false },
            ],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: mockData },
      })

      const floatingLabelGroups = container.querySelectorAll(
        '.floating-label-group'
      )

      expect(floatingLabelGroups.length).toBe(2)
    })

    it('should have floating-label class on all labels', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: mockData },
      })

      const floatingLabels = container.querySelectorAll('.floating-label')

      expect(floatingLabels.length).toBe(1)
    })

    it('should display title as label text', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Programming Languages',
            skills: [{ text: 'Python', highlight: false }],
          },
        ],
      })

      renderWithContext(<Skill title="Programming Languages" />, {
        contextValue: { resumeData: mockData },
      })

      const labels = screen.getAllByText('Programming Languages')
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  describe('Layout and Styling', () => {
    it('should apply hover effects to skill containers', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: mockData },
      })

      const skillContainer = container.querySelector('.group')

      expect(skillContainer).toHaveClass(
        'hover:border-white/20',
        'hover:bg-white/10'
      )
    })

    it('should layout checkbox, input, and delete button in row', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: mockData },
      })

      const skillContainer = container.querySelector('.group')

      // Updated: New structure uses flex items-center inside the card, not on the card itself
      const innerContainer = skillContainer?.querySelector('.flex.items-center')
      expect(innerContainer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Technical Skills',
            skills: [
              { text: 'JavaScript', highlight: false },
              { text: 'Python', highlight: true },
            ],
          },
        ],
      })

      const { container } = renderWithContext(
        <Skill title="Technical Skills" />,
        {
          contextValue: { resumeData: mockData },
        }
      )

      // Check for heading and inputs
      const headings = screen.getAllByText('Technical Skills')
      expect(headings.length).toBeGreaterThan(0)
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('should have title attribute on highlight checkbox', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: mockData },
      })

      const checkbox = container.querySelector('input[type="checkbox"]')

      expect(checkbox).toHaveAttribute('title', 'Highlight this skill')
    })

    it('should have title attribute on delete button', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete this skill"]'
      )

      expect(deleteButton).toHaveAttribute('title')
    })

    it('should have proper placeholder text', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Frameworks',
            skills: [{ text: '', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Frameworks" />, {
        contextValue: { resumeData: mockData },
      })

      const skillInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement

      expect(skillInput.placeholder).toBe('Enter frameworks')
    })
  })

  describe('Multiple Skill Categories', () => {
    it('should only display skills for matching title', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Languages',
            skills: [{ text: 'JavaScript', highlight: false }],
          },
          {
            title: 'Frameworks',
            skills: [{ text: 'React', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Languages" />, {
        contextValue: { resumeData: mockData },
      })

      const skillInputs = container.querySelectorAll(
        'input[type="text"]'
      ) as NodeListOf<HTMLInputElement>

      expect(skillInputs.length).toBe(1)
      expect(skillInputs[0].value).toBe('JavaScript')
    })

    it('should update only skills for matching title', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Languages',
            skills: [{ text: 'JavaScript', highlight: false }],
          },
          {
            title: 'Frameworks',
            skills: [{ text: 'React', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Languages" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const skillInput = container.querySelector('input[type="text"]')

      if (skillInput) {
        fireEvent.change(skillInput, {
          target: { value: 'TypeScript' },
        })

        const callback = mockSetResumeData.mock.calls[0][0]
        const newState = callback(mockData)

        expect(newState.skills[0].skills[0].text).toBe('TypeScript')
        expect(newState.skills[1].skills[0].text).toBe('React')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty skills array', () => {
      const mockData = createMockResumeData({
        skills: [{ title: 'Skills', skills: [] }],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: mockData },
      })

      // Should still render the section heading and add button
      expect(screen.getByText('Skills')).toBeInTheDocument()
    })

    it('should handle special characters in skill text', () => {
      const specialData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'C++/C#', highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: specialData },
      })

      const skillInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement

      expect(skillInput?.value).toBe('C++/C#')
    })

    it('should handle long skill text', () => {
      const longSkillText =
        'Very Long Skill Name That Might Overflow Or Cause Layout Issues'
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: longSkillText, highlight: false }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { resumeData: mockData },
      })

      const skillInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement

      expect(skillInput?.value).toBe(longSkillText)
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('should reorder skills from first to last position', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'JavaScript', highlight: false },
              { text: 'Python', highlight: false },
              { text: 'Java', highlight: false },
            ],
          },
        ],
      })
      const mockSetResumeData = jest.fn()

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      capturedOnDragEnd!({
        source: { droppableId: 'skills-Skills', index: 0 },
        destination: { droppableId: 'skills-Skills', index: 2 },
      })

      expect(mockSetResumeData).toHaveBeenCalled()
      const updater = mockSetResumeData.mock.calls[0][0]
      const result = updater(mockData)

      expect(result).toEqual({
        ...mockData,
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'Python', highlight: false },
              { text: 'Java', highlight: false },
              { text: 'JavaScript', highlight: false },
            ],
          },
        ],
      })
    })

    it('should reorder skills from last to first position', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'JavaScript', highlight: false },
              { text: 'Python', highlight: false },
              { text: 'Java', highlight: false },
            ],
          },
        ],
      })
      const mockSetResumeData = jest.fn()

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      capturedOnDragEnd!({
        source: { droppableId: 'skills-Skills', index: 2 },
        destination: { droppableId: 'skills-Skills', index: 0 },
      })

      expect(mockSetResumeData).toHaveBeenCalled()
      const updater = mockSetResumeData.mock.calls[0][0]
      const result = updater(mockData)

      expect(result).toEqual({
        ...mockData,
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'Java', highlight: false },
              { text: 'JavaScript', highlight: false },
              { text: 'Python', highlight: false },
            ],
          },
        ],
      })
    })

    it('should not reorder when dropped in same position', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'JavaScript', highlight: false },
              { text: 'Python', highlight: false },
            ],
          },
        ],
      })
      const mockSetResumeData = jest.fn()

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      capturedOnDragEnd!({
        source: { droppableId: 'skills-Skills', index: 0 },
        destination: { droppableId: 'skills-Skills', index: 0 },
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should not reorder when dropped outside droppable area', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [
              { text: 'JavaScript', highlight: false },
              { text: 'Python', highlight: false },
            ],
          },
        ],
      })
      const mockSetResumeData = jest.fn()

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      capturedOnDragEnd!({
        source: { droppableId: 'skills-Skills', index: 0 },
        destination: null,
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })
  })
})
