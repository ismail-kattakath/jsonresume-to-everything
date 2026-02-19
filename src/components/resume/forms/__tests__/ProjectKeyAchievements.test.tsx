// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProjectKeyAchievements from '../ProjectKeyAchievements'
import { useProjectKeyAchievementsForm } from '@/hooks/useProjectKeyAchievementsForm'

// Mock the hook
jest.mock('@/hooks/useProjectKeyAchievementsForm')

const mockUseProjectKeyAchievementsForm =
  useProjectKeyAchievementsForm as jest.MockedFunction<
    typeof useProjectKeyAchievementsForm
  >

describe('ProjectKeyAchievements', () => {
  const mockAdd = jest.fn()
  const mockRemove = jest.fn()
  const mockHandleChange = jest.fn()

  const defaultHookReturn = {
    achievements: [
      { text: 'First project achievement' },
      { text: 'Second project achievement' },
      { text: 'Third project achievement' },
    ],
    add: mockAdd,
    remove: mockRemove,
    handleChange: mockHandleChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseProjectKeyAchievementsForm.mockReturnValue(defaultHookReturn)
  })

  describe('Rendering', () => {
    it('renders all achievements from the hook', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      expect(screen.getByText('First project achievement')).toBeInTheDocument()
      expect(screen.getByText('Second project achievement')).toBeInTheDocument()
      expect(screen.getByText('Third project achievement')).toBeInTheDocument()
    })

    it('renders numbered bullets for achievements', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders add input with placeholder', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      expect(
        screen.getByPlaceholderText(
          'Add key achievement... (Press Enter to save)'
        )
      ).toBeInTheDocument()
    })

    it('renders with empty achievements list', () => {
      mockUseProjectKeyAchievementsForm.mockReturnValue({
        ...defaultHookReturn,
        achievements: [],
      })

      render(<ProjectKeyAchievements projectIndex={0} />)

      expect(
        screen.getByPlaceholderText(
          'Add key achievement... (Press Enter to save)'
        )
      ).toBeInTheDocument()
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })
  })

  describe('Adding Achievements', () => {
    it('adds achievement when Enter is pressed with text', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const input = screen.getByPlaceholderText(
        'Add key achievement... (Press Enter to save)'
      )
      fireEvent.change(input, { target: { value: 'New achievement' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockAdd).toHaveBeenCalledWith('New achievement')
    })

    it('clears input after adding achievement', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const input = screen.getByPlaceholderText(
        'Add key achievement... (Press Enter to save)'
      ) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'New achievement' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(input.value).toBe('')
    })

    it('does not add achievement when Enter is pressed with empty text', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const input = screen.getByPlaceholderText(
        'Add key achievement... (Press Enter to save)'
      )
      fireEvent.change(input, { target: { value: '' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockAdd).not.toHaveBeenCalled()
    })

    it('does not add achievement when Enter is pressed with only whitespace', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const input = screen.getByPlaceholderText(
        'Add key achievement... (Press Enter to save)'
      )
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockAdd).not.toHaveBeenCalled()
    })

    it('does not trigger on other key presses', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const input = screen.getByPlaceholderText(
        'Add key achievement... (Press Enter to save)'
      )
      fireEvent.change(input, { target: { value: 'New achievement' } })
      fireEvent.keyDown(input, { key: 'a' })

      expect(mockAdd).not.toHaveBeenCalled()
    })
  })

  describe('Editing Achievements', () => {
    it('enters edit mode when clicking on achievement text', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      expect(
        screen.getByDisplayValue('First project achievement')
      ).toBeInTheDocument()
    })

    it('saves edited achievement when Enter is pressed', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: 'Updated achievement' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockHandleChange).toHaveBeenCalledWith(0, 'Updated achievement')
    })

    it('exits edit mode after saving', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: 'Updated achievement' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(
        screen.queryByDisplayValue('Updated achievement')
      ).not.toBeInTheDocument()
    })

    it('cancels edit when Escape is pressed', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: 'Changed text' } })
      fireEvent.keyDown(input, { key: 'Escape' })

      expect(mockHandleChange).not.toHaveBeenCalled()
      expect(screen.queryByDisplayValue('Changed text')).not.toBeInTheDocument()
    })

    it('does not save empty text when Enter is pressed', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: '' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockHandleChange).not.toHaveBeenCalled()
    })

    it('does not save whitespace-only text when Enter is pressed', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockHandleChange).not.toHaveBeenCalled()
    })

    it('can edit multiple achievements independently', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      // Edit first achievement
      fireEvent.click(screen.getByText('First project achievement'))
      let input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: 'Updated first' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockHandleChange).toHaveBeenCalledWith(0, 'Updated first')

      // Edit second achievement
      fireEvent.click(screen.getByText('Second project achievement'))
      input = screen.getByDisplayValue('Second project achievement')
      fireEvent.change(input, { target: { value: 'Updated second' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockHandleChange).toHaveBeenCalledWith(1, 'Updated second')
    })
  })

  describe('Edit Blur Behavior', () => {
    it('saves changes on blur if text was modified', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: 'Modified text' } })
      fireEvent.blur(input)

      expect(mockHandleChange).toHaveBeenCalledWith(0, 'Modified text')
    })

    it('does not save on blur if text was not modified', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.blur(input)

      expect(mockHandleChange).not.toHaveBeenCalled()
    })

    it('does not save on blur if text is empty', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: '' } })
      fireEvent.blur(input)

      expect(mockHandleChange).not.toHaveBeenCalled()
    })

    it('does not save on blur if text is only whitespace', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.blur(input)

      expect(mockHandleChange).not.toHaveBeenCalled()
    })

    it('exits edit mode after blur', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const input = screen.getByDisplayValue('First project achievement')
      fireEvent.change(input, { target: { value: 'Modified text' } })
      fireEvent.blur(input)

      expect(
        screen.queryByDisplayValue('Modified text')
      ).not.toBeInTheDocument()
    })
  })

  describe('Removing Achievements', () => {
    it('removes achievement when remove button is clicked', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const removeButtons = screen.getAllByTitle('Remove achievement')
      fireEvent.click(removeButtons[0])

      expect(mockRemove).toHaveBeenCalledWith(0)
    })

    it('can remove any achievement by index', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const removeButtons = screen.getAllByTitle('Remove achievement')
      fireEvent.click(removeButtons[1])

      expect(mockRemove).toHaveBeenCalledWith(1)
    })

    it('renders remove button for each achievement', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const removeButtons = screen.getAllByTitle('Remove achievement')
      expect(removeButtons).toHaveLength(3)
    })
  })

  describe('Variant Styling', () => {
    it('applies teal variant styles by default', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const input = screen.getByPlaceholderText(
        'Add key achievement... (Press Enter to save)'
      )
      expect(input).toHaveClass('border-teal-400/30')
      expect(input).toHaveClass('focus:border-teal-400')
    })

    it('applies pink variant styles when specified', () => {
      render(<ProjectKeyAchievements projectIndex={0} variant="pink" />)

      const input = screen.getByPlaceholderText(
        'Add key achievement... (Press Enter to save)'
      )
      expect(input).toHaveClass('border-pink-400/30')
      expect(input).toHaveClass('focus:border-pink-400')
    })

    it('applies variant styles to achievement containers', () => {
      render(<ProjectKeyAchievements projectIndex={0} variant="teal" />)

      const achievement = screen.getByText('First project achievement')
      const container = achievement.closest('.group')
      expect(container).toHaveClass('border-teal-400/30')
    })

    it('applies pink variant to achievement containers', () => {
      render(<ProjectKeyAchievements projectIndex={0} variant="pink" />)

      const achievement = screen.getByText('First project achievement')
      const container = achievement.closest('.group')
      expect(container).toHaveClass('border-pink-400/30')
    })

    it('applies variant styles to edit input', () => {
      render(<ProjectKeyAchievements projectIndex={0} variant="pink" />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const editInput = screen.getByDisplayValue('First project achievement')
      expect(editInput).toHaveClass('border-pink-400/30')
      expect(editInput).toHaveClass('focus:border-pink-400')
    })
  })

  describe('Hook Integration', () => {
    it('calls hook with correct project index', () => {
      render(<ProjectKeyAchievements projectIndex={5} />)

      expect(mockUseProjectKeyAchievementsForm).toHaveBeenCalledWith(5)
    })

    it('uses achievements from hook', () => {
      mockUseProjectKeyAchievementsForm.mockReturnValue({
        ...defaultHookReturn,
        achievements: [{ text: 'Custom project achievement' }],
      })

      render(<ProjectKeyAchievements projectIndex={0} />)

      expect(screen.getByText('Custom project achievement')).toBeInTheDocument()
    })
  })

  describe('Auto-focus Behavior', () => {
    it('auto-focuses edit input when entering edit mode', async () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      fireEvent.click(achievement)

      const editInput = screen.getByDisplayValue('First project achievement')
      await waitFor(() => {
        expect(editInput).toHaveFocus()
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible title for achievement text', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const achievement = screen.getByText('First project achievement')
      expect(achievement).toHaveAttribute('title', 'Click to edit')
    })

    it('has accessible title for remove buttons', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const removeButtons = screen.getAllByTitle('Remove achievement')
      expect(removeButtons).toHaveLength(3)
      removeButtons.forEach((button) => {
        expect(button).toHaveAttribute('title', 'Remove achievement')
      })
    })

    it('uses proper input types', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const addInput = screen.getByPlaceholderText(
        'Add key achievement... (Press Enter to save)'
      )
      expect(addInput).toHaveAttribute('type', 'text')
    })

    it('uses proper button types for remove buttons', () => {
      render(<ProjectKeyAchievements projectIndex={0} />)

      const removeButtons = screen.getAllByTitle('Remove achievement')
      removeButtons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })
  })
})
