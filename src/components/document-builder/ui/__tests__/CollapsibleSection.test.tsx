// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CollapsibleSection from '../CollapsibleSection'
import { Book } from 'lucide-react'

describe('CollapsibleSection', () => {
  const defaultProps = {
    title: 'Test Section',
    children: <div>Test Content</div>,
  }

  beforeEach(() => {
    jest.spyOn(window, 'confirm').mockImplementation(() => true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with title and children', () => {
      render(<CollapsibleSection {...defaultProps} />)
      expect(screen.getByText('Test Section')).toBeInTheDocument()
    })

    it('renders with icon when provided', () => {
      render(
        <CollapsibleSection
          {...defaultProps}
          icon={<Book data-testid="book-icon" />}
        />
      )
      expect(screen.getByTestId('book-icon')).toBeInTheDocument()
    })

    it('renders action element when provided', () => {
      render(
        <CollapsibleSection
          {...defaultProps}
          action={<button>Action</button>}
        />
      )
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('applies utility variant styling', () => {
      const { container } = render(
        <CollapsibleSection {...defaultProps} variant="utility" />
      )
      const section = container.firstChild
      expect(section).toHaveClass('border-amber-500/20')
    })
  })

  describe('Expansion Behavior', () => {
    it('renders collapsed by default', () => {
      render(<CollapsibleSection {...defaultProps} />)
      const content = screen.getByText('Test Content')
      const wrapper = content.parentElement?.parentElement
      expect(wrapper).toHaveClass('max-h-0')
    })

    it('renders expanded when defaultExpanded is true', () => {
      render(<CollapsibleSection {...defaultProps} defaultExpanded={true} />)
      const content = screen.getByText('Test Content')
      const wrapper = content.parentElement?.parentElement
      expect(wrapper).toHaveClass('max-h-[10000px]')
    })

    it('toggles expansion on header click', () => {
      render(<CollapsibleSection {...defaultProps} />)
      const header = screen.getByRole('button', { name: /test section/i })
      const content = screen.getByText('Test Content')
      const wrapper = content.parentElement?.parentElement

      // Initially collapsed
      expect(wrapper).toHaveClass('max-h-0')

      // Click to expand
      fireEvent.click(header)
      expect(wrapper).toHaveClass('max-h-[10000px]')

      // Click to collapse
      fireEvent.click(header)
      expect(wrapper).toHaveClass('max-h-0')
    })

    it('uses controlled state when isExpanded and onToggle provided', () => {
      const onToggle = jest.fn()
      const { rerender } = render(
        <CollapsibleSection
          {...defaultProps}
          isExpanded={false}
          onToggle={onToggle}
        />
      )
      const content = screen.getByText('Test Content')
      const wrapper = content.parentElement?.parentElement
      const header = screen.getByRole('button')

      // Initially collapsed
      expect(wrapper).toHaveClass('max-h-0')

      // Click calls onToggle
      fireEvent.click(header)
      expect(onToggle).toHaveBeenCalledTimes(1)

      // Rerender with expanded state
      rerender(
        <CollapsibleSection
          {...defaultProps}
          isExpanded={true}
          onToggle={onToggle}
        />
      )
      const updatedWrapper =
        screen.getByText('Test Content').parentElement?.parentElement
      expect(updatedWrapper).toHaveClass('max-h-[10000px]')
    })
  })

  describe('Editable Mode', () => {
    it('renders drag handle when editable and dragHandleProps provided', () => {
      const dragHandleProps = {
        'data-testid': 'drag-handle',
        onMouseDown: jest.fn(),
        onKeyDown: jest.fn(),
      }
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          dragHandleProps={dragHandleProps}
        />
      )
      expect(screen.getByTestId('drag-handle')).toBeInTheDocument()
    })

    it('renders edit and delete buttons when editable', () => {
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onRename={jest.fn()}
          onDelete={jest.fn()}
        />
      )
      expect(screen.getByTitle('Rename skill group')).toBeInTheDocument()
      expect(screen.getByTitle('Delete skill group')).toBeInTheDocument()
    })

    it('enters edit mode when pencil button clicked', () => {
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onRename={jest.fn()}
        />
      )
      const editButton = screen.getByTitle('Rename skill group')
      fireEvent.click(editButton)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('Test Section')
    })

    it('calls onRename when input is blurred with new value', () => {
      const onRename = jest.fn()
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onRename={onRename}
        />
      )

      const editButton = screen.getByTitle('Rename skill group')
      fireEvent.click(editButton)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'New Title' } })
      fireEvent.blur(input)

      expect(onRename).toHaveBeenCalledWith('New Title')
    })

    it('calls onRename when Enter key pressed', () => {
      const onRename = jest.fn()
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onRename={onRename}
        />
      )

      const editButton = screen.getByTitle('Rename skill group')
      fireEvent.click(editButton)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'Updated Title' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onRename).toHaveBeenCalledWith('Updated Title')
    })

    it('resets title when Escape key pressed', () => {
      const onRename = jest.fn()
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onRename={onRename}
        />
      )

      const editButton = screen.getByTitle('Rename skill group')
      fireEvent.click(editButton)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'Changed' } })
      fireEvent.keyDown(input, { key: 'Escape' })

      expect(onRename).not.toHaveBeenCalled()
      // After escape, edit mode should exit and input should be gone
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('does not call onRename if value is empty', () => {
      const onRename = jest.fn()
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onRename={onRename}
        />
      )

      const editButton = screen.getByTitle('Rename skill group')
      fireEvent.click(editButton)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.blur(input)

      expect(onRename).not.toHaveBeenCalled()
    })

    it('does not call onRename if value unchanged', () => {
      const onRename = jest.fn()
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onRename={onRename}
        />
      )

      const editButton = screen.getByTitle('Rename skill group')
      fireEvent.click(editButton)

      const input = screen.getByRole('textbox')
      fireEvent.blur(input)

      expect(onRename).not.toHaveBeenCalled()
    })

    it('calls onDelete with confirmation when delete button clicked', () => {
      const onDelete = jest.fn()
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onDelete={onDelete}
        />
      )

      const deleteButton = screen.getByTitle('Delete skill group')
      fireEvent.click(deleteButton)

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining(
          'Are you sure you want to delete "Test Section"?'
        )
      )
      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('does not call onDelete when confirmation is cancelled', () => {
      jest.spyOn(window, 'confirm').mockImplementation(() => false)
      const onDelete = jest.fn()
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onDelete={onDelete}
        />
      )

      const deleteButton = screen.getByTitle('Delete skill group')
      fireEvent.click(deleteButton)

      expect(onDelete).not.toHaveBeenCalled()
    })

    it('prevents toggle when clicking edit controls', () => {
      const onRename = jest.fn()
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onRename={onRename}
        />
      )

      const content = screen.getByText('Test Content')
      const wrapper = content.parentElement?.parentElement
      expect(wrapper).toHaveClass('max-h-0')

      const editButton = screen.getByTitle('Rename skill group')
      fireEvent.click(editButton)

      // Section should still be collapsed after clicking edit
      expect(wrapper).toHaveClass('max-h-0')
    })

    it('does not toggle when in edit mode', () => {
      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          onRename={jest.fn()}
        />
      )

      const content = screen.getByText('Test Content')
      const wrapper = content.parentElement?.parentElement

      // Initially collapsed
      expect(wrapper).toHaveClass('max-h-0')

      // Enter edit mode
      const editButton = screen.getByTitle('Rename skill group')
      fireEvent.click(editButton)

      // Input should be present
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()

      // Section should still be collapsed
      expect(wrapper).toHaveClass('max-h-0')
    })
  })

  describe('Event Propagation', () => {
    it('prevents propagation when clicking drag handle', () => {
      const onToggle = jest.fn()
      const dragHandleProps = {
        'data-testid': 'drag-handle',
      }

      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          dragHandleProps={dragHandleProps}
          isExpanded={false}
          onToggle={onToggle}
        />
      )

      const dragHandle = screen.getByTestId('drag-handle')
      fireEvent.click(dragHandle)

      // onToggle should not be called because stopPropagation prevents it
      expect(onToggle).not.toHaveBeenCalled()
    })

    it('prevents propagation when clicking title input during edit mode', () => {
      const onToggle = jest.fn()

      render(
        <CollapsibleSection
          {...defaultProps}
          editable={true}
          isExpanded={false}
          onToggle={onToggle}
        />
      )

      // Enter edit mode
      const editButton = screen.getByTitle('Rename skill group')
      fireEvent.click(editButton)

      // Click on the input field
      const input = screen.getByRole('textbox')
      fireEvent.click(input)

      // onToggle should not be called (only called once to enter edit mode)
      expect(onToggle).toHaveBeenCalledTimes(0)
    })

    it('prevents propagation when clicking action element', () => {
      const onToggle = jest.fn()
      const mockActionClick = jest.fn()

      render(
        <CollapsibleSection
          {...defaultProps}
          action={
            <button onClick={mockActionClick} data-testid="action-btn">
              Custom Action
            </button>
          }
          isExpanded={false}
          onToggle={onToggle}
        />
      )

      const actionButton = screen.getByTestId('action-btn')
      fireEvent.click(actionButton)

      // Action click should fire
      expect(mockActionClick).toHaveBeenCalledTimes(1)

      // onToggle should not be called because stopPropagation prevents it
      expect(onToggle).not.toHaveBeenCalled()
    })
  })
})
