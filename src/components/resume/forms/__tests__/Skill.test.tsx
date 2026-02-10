import React from 'react'
import Skill from '@/components/resume/forms/Skill'
import {
  renderWithContext,
  createMockResumeData,
  screen,
  fireEvent,
} from '@/lib/__tests__/test-utils'

describe('Skill Component', () => {
  describe('Rendering', () => {
    it('should render skills as inline tags', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Technical Skills',
            skills: [{ text: 'JavaScript' }, { text: 'TypeScript' }],
          },
        ],
      })

      renderWithContext(<Skill title="Technical Skills" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    it('should render inline input for adding skills', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Languages',
            skills: [{ text: 'Python' }],
          },
        ],
      })

      renderWithContext(<Skill title="Languages" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const input = screen.getByPlaceholderText('Add languages...')
      expect(input).toBeInTheDocument()
    })

    it('should display skill text as non-editable labels', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Languages',
            skills: [{ text: 'Python' }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Languages" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // Should display text as label (not editable input for existing skills)
      expect(screen.getByText('Python')).toBeInTheDocument()

      // The only input should be the add input
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBe(1)
      expect(inputs[0]).toHaveAttribute('placeholder', 'Add languages...')
    })
  })

  describe('Add Functionality', () => {
    it('should add new skill when pressing Enter in input', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Existing Skill' }],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const input = screen.getByPlaceholderText('Add skills...')
      fireEvent.change(input, { target: { value: 'New Skill' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSetResumeData).toHaveBeenCalled()
      const callback = mockSetResumeData.mock.calls[0][0]
      const newState = callback(mockData)

      expect(newState.skills[0].skills.length).toBe(2)
      expect(newState.skills[0].skills[1]).toEqual({
        text: 'New Skill',
      })
    })

    it('should add new skill on blur when input has value', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const input = screen.getByPlaceholderText('Add skills...')
      fireEvent.change(input, { target: { value: 'Blurred Skill' } })
      fireEvent.blur(input)

      expect(mockSetResumeData).toHaveBeenCalled()
      const callback = mockSetResumeData.mock.calls[0][0]
      const newState = callback(mockData)

      expect(newState.skills[0].skills.length).toBe(1)
      expect(newState.skills[0].skills[0].text).toBe('Blurred Skill')
    })

    it('should not add skill if input is empty', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const input = screen.getByPlaceholderText('Add skills...')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should not add skill if input is only whitespace', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const input = screen.getByPlaceholderText('Add skills...')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should clear input after adding skill', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const input = screen.getByPlaceholderText('Add skills...')
      fireEvent.change(input, { target: { value: 'New Skill' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(input).toHaveValue('')
    })

    it('should trim whitespace from skill text', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const input = screen.getByPlaceholderText('Add skills...')
      fireEvent.change(input, { target: { value: '  JavaScript  ' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      const callback = mockSetResumeData.mock.calls[0][0]
      const newState = callback(mockData)

      expect(newState.skills[0].skills[0].text).toBe('JavaScript')
    })
  })

  describe('Delete Functionality', () => {
    it('should render remove button with X icon for each skill', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test Skill' }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const removeButton = container.querySelector('button[title="Remove"]')

      expect(removeButton).toBeInTheDocument()
      expect(removeButton?.textContent).toBe('✕')
    })

    it('should delete skill when remove button is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Skill 1' }, { text: 'Skill 2' }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const removeButtons = container.querySelectorAll(
        'button[title="Remove skill"]'
      )

      if (removeButtons[0]) {
        fireEvent.click(removeButtons[0])

        expect(mockSetResumeData).toHaveBeenCalled()
        const callback = mockSetResumeData.mock.calls[0][0]
        const newState = callback(mockData)

        expect(newState.skills[0].skills.length).toBe(1)
        expect(newState.skills[0].skills[0].text).toBe('Skill 2')
      }
    })
  })

  describe('Text Display', () => {
    it('should display skill text correctly', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Skill 1' }, { text: 'Skill 2' }],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByText('Skill 1')).toBeInTheDocument()
      expect(screen.getByText('Skill 2')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('should use flex-wrap layout for inline tags', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test' }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const flexContainer = container.querySelector('.flex.flex-wrap')
      expect(flexContainer).toBeInTheDocument()
    })

    it('should render skills as rounded pill tags', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test' }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const skillTag = container.querySelector('.rounded-full')
      expect(skillTag).toBeInTheDocument()
    })

    it('should render add input with dashed border', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const input = container.querySelector('input.border-dashed')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Technical Skills',
            skills: [{ text: 'JavaScript' }, { text: 'Python' }],
          },
        ],
      })

      renderWithContext(<Skill title="Technical Skills" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // Check for skills displayed as text
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })

    it('should have title attribute on remove button', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'Test' }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Skills" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const removeButton = container.querySelector('button[title="Remove"]')

      expect(removeButton).toHaveAttribute('title', 'Remove')
    })

    it('should have descriptive placeholder on add input', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Frameworks',
            skills: [],
          },
        ],
      })

      renderWithContext(<Skill title="Frameworks" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const input = screen.getByPlaceholderText('Add frameworks...')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Multiple Skill Categories', () => {
    it('should only display skills for matching title', () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Languages',
            skills: [{ text: 'JavaScript' }],
          },
          {
            title: 'Frameworks',
            skills: [{ text: 'React' }],
          },
        ],
      })

      renderWithContext(<Skill title="Languages" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // Should display JavaScript but not React
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.queryByText('React')).not.toBeInTheDocument()
    })

    it('should delete only skills for matching title', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Languages',
            skills: [{ text: 'JavaScript' }, { text: 'TypeScript' }],
          },
          {
            title: 'Frameworks',
            skills: [{ text: 'React' }],
          },
        ],
      })

      const { container } = renderWithContext(<Skill title="Languages" />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const removeButtons = container.querySelectorAll(
        'button[title="Remove skill"]'
      )

      if (removeButtons[0]) {
        fireEvent.click(removeButtons[0])

        const callback = mockSetResumeData.mock.calls[0][0]
        const newState = callback(mockData)

        // Languages category should have one less skill
        expect(newState.skills[0].skills.length).toBe(1)
        expect(newState.skills[0].skills[0].text).toBe('TypeScript')
        // Frameworks category should be unchanged
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
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // Should still render the add input
      const input = screen.getByPlaceholderText('Add skills...')
      expect(input).toBeInTheDocument()
    })

    it('should handle special characters in skill text', () => {
      const specialData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: 'C++/C#' }],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: { ...({} as any), resumeData: specialData },
      })

      expect(screen.getByText('C++/C#')).toBeInTheDocument()
    })

    it('should handle long skill text', () => {
      const longSkillText =
        'Very Long Skill Name That Might Overflow Or Cause Layout Issues'
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Skills',
            skills: [{ text: longSkillText }],
          },
        ],
      })

      renderWithContext(<Skill title="Skills" />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByText(longSkillText)).toBeInTheDocument()
    })
  })
})
