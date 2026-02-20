import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TagInput from '@/components/ui/tag-input'

describe('TagInput', () => {
  const mockOnAdd = jest.fn()
  const mockOnRemove = jest.fn()
  const defaultProps = {
    tags: ['Tag 1', 'Tag 2'],
    onAdd: mockOnAdd,
    onRemove: mockOnRemove,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders tags correctly', () => {
    render(<TagInput {...defaultProps} />)

    expect(screen.getByText('Tag 1')).toBeInTheDocument()
    expect(screen.getByText('Tag 2')).toBeInTheDocument()
  })

  it('calls onAdd when Enter is pressed with a value', () => {
    render(<TagInput {...defaultProps} />)

    const input = screen.getByPlaceholderText('Add item...')
    fireEvent.change(input, { target: { value: 'New Tag' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockOnAdd).toHaveBeenCalledWith('New Tag')
  })

  it('does not call onAdd when Enter is pressed with empty value', () => {
    render(<TagInput {...defaultProps} />)

    const input = screen.getByPlaceholderText('Add item...')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('calls onAdd when input is blurred with a value', () => {
    render(<TagInput {...defaultProps} />)

    const input = screen.getByPlaceholderText('Add item...')
    fireEvent.change(input, { target: { value: 'Blurred Tag' } })
    fireEvent.blur(input)

    expect(mockOnAdd).toHaveBeenCalledWith('Blurred Tag')
  })

  it('calls onRemove when remove button is clicked', () => {
    render(<TagInput {...defaultProps} />)

    const removeButtons = screen.getAllByTitle('Remove')
    fireEvent.click(removeButtons[0]!)

    expect(mockOnRemove).toHaveBeenCalledWith(0)
  })

  it('renders with different variants', () => {
    const { rerender, container } = render(<TagInput {...defaultProps} variant="pink" />)
    expect(container.querySelector('input')).toHaveClass('border-pink-400/30')

    rerender(<TagInput {...defaultProps} variant="blue" />)
    expect(container.querySelector('input')).toHaveClass('border-blue-400/30')

    rerender(<TagInput {...defaultProps} variant="teal" />)
    expect(container.querySelector('input')).toHaveClass('border-teal-400/30')
  })

  it('handles empty/undefined tags safely', () => {
    // @ts-ignore
    render(<TagInput {...defaultProps} tags={undefined} />)
    expect(screen.getByPlaceholderText('Add item...')).toBeInTheDocument()
  })
})
