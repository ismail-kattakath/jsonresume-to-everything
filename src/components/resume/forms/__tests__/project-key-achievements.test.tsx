import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectKeyAchievements from '@/components/resume/forms/project-key-achievements'
import { useProjectKeyAchievementsForm } from '@/hooks/use-project-key-achievements-form'

// Mock the hook
jest.mock('@/hooks/use-project-key-achievements-form')

describe('ProjectKeyAchievements', () => {
  const mockAchievements = [{ text: 'Achievement 1' }, { text: 'Achievement 2' }]

  const mockAdd = jest.fn()
  const mockRemove = jest.fn()
  const mockHandleChange = jest.fn()

  const mockHookReturnValue = {
    achievements: mockAchievements,
    add: mockAdd,
    remove: mockRemove,
    handleChange: mockHandleChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useProjectKeyAchievementsForm as jest.Mock).mockReturnValue(mockHookReturnValue)
  })

  const renderComponent = (props: { projectIndex?: number; variant?: 'teal' | 'pink' } = { projectIndex: 0 }) => {
    return render(<ProjectKeyAchievements projectIndex={0} {...props} />)
  }

  it('renders existing achievements', () => {
    renderComponent()
    expect(screen.getByText('Achievement 1')).toBeInTheDocument()
    expect(screen.getByText('Achievement 2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // First number bullet
    expect(screen.getByText('2')).toBeInTheDocument() // Second number bullet
  })

  it('handles adding an achievement via Enter', () => {
    renderComponent()
    const input = screen.getByPlaceholderText(/Add key achievement/i)

    fireEvent.change(input, { target: { value: 'New Achievement' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(mockAdd).toHaveBeenCalledWith('New Achievement')
    expect(input).toHaveValue('')
  })

  it('ignores empty achievement on Enter', () => {
    renderComponent()
    const input = screen.getByPlaceholderText(/Add key achievement/i)

    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(mockAdd).not.toHaveBeenCalled()
  })

  it('handles removing an achievement', () => {
    renderComponent()
    const removeButtons = screen.getAllByTitle('Remove achievement')
    fireEvent.click(removeButtons[0]!)
    expect(mockRemove).toHaveBeenCalledWith(0)
  })

  it('handles starting to edit an achievement', () => {
    renderComponent()
    const achievement = screen.getByText('Achievement 1')
    fireEvent.click(achievement)

    const input = screen.getByDisplayValue('Achievement 1')
    expect(input).toBeInTheDocument()
  })

  it('handles saving an edited achievement via Enter', () => {
    renderComponent()
    fireEvent.click(screen.getByText('Achievement 1'))

    const input = screen.getByDisplayValue('Achievement 1')
    fireEvent.change(input, { target: { value: 'Updated' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(mockHandleChange).toHaveBeenCalledWith(0, 'Updated')
    expect(screen.queryByDisplayValue('Updated')).not.toBeInTheDocument()
  })

  it('handles cancelling edit via Escape', () => {
    renderComponent()
    fireEvent.click(screen.getByText('Achievement 1'))

    const input = screen.getByDisplayValue('Achievement 1')
    fireEvent.change(input, { target: { value: 'Updated' } })
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })

    expect(mockHandleChange).not.toHaveBeenCalled()
    expect(screen.queryByDisplayValue('Updated')).not.toBeInTheDocument()
    expect(screen.getByText('Achievement 1')).toBeInTheDocument()
  })

  it('handles saving an edited achievement via Blur', () => {
    renderComponent()
    fireEvent.click(screen.getByText('Achievement 1'))

    const input = screen.getByDisplayValue('Achievement 1')
    fireEvent.change(input, { target: { value: 'Updated Blur' } })
    fireEvent.blur(input)

    expect(mockHandleChange).toHaveBeenCalledWith(0, 'Updated Blur')
  })

  it('ignores blur save if text is same', () => {
    renderComponent()
    fireEvent.click(screen.getByText('Achievement 1'))

    const input = screen.getByDisplayValue('Achievement 1')
    fireEvent.blur(input)

    expect(mockHandleChange).not.toHaveBeenCalled()
  })

  it('renders with pink variant', () => {
    const { container } = renderComponent({ projectIndex: 0, variant: 'pink' })
    // Check for pink border class
    const group = container.querySelector('.border-pink-400\\/30')
    expect(group).toBeInTheDocument()
  })

  it('handles achievements being undefined', () => {
    ;(useProjectKeyAchievementsForm as jest.Mock).mockReturnValue({
      ...mockHookReturnValue,
      achievements: undefined,
    })
    renderComponent()
    expect(screen.getByPlaceholderText(/Add key achievement/i)).toBeInTheDocument()
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })
})
