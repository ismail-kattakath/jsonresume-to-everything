// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)
import TagInput from '@/components/ui/TagInput'

describe('TagInput Component', () => {
  const mockOnAdd = jest.fn()
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without tags', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(
        <TagInput
          tags={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          placeholder="Add custom item..."
        />
      )

      expect(
        screen.getByPlaceholderText('Add custom item...')
      ).toBeInTheDocument()
    })

    it('should render all tags as badges', () => {
      const tags = ['React', 'TypeScript', 'Next.js']

      render(<TagInput tags={tags} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })

    it('should render remove button for each tag', () => {
      const tags = ['React', 'TypeScript']

      render(<TagInput tags={tags} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const removeButtons = screen.getAllByTitle('Remove')
      expect(removeButtons).toHaveLength(2)
    })

    it('should render input field with correct type', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render empty state correctly', () => {
      const { container } = render(
        <TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      const tags = container.querySelectorAll('.inline-flex.items-center')
      expect(tags.length).toBe(0)
    })
  })

  describe('Adding Tags', () => {
    it('should add tag when pressing Enter key', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: 'New Tag' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockOnAdd).toHaveBeenCalledWith('New Tag')
      expect(mockOnAdd).toHaveBeenCalledTimes(1)
    })

    it('should add tag when input loses focus (blur)', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: 'Tag on blur' } })
      fireEvent.blur(input)

      expect(mockOnAdd).toHaveBeenCalledWith('Tag on blur')
      expect(mockOnAdd).toHaveBeenCalledTimes(1)
    })

    it('should clear input after adding tag via Enter', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText(
        'Add item...'
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: 'Test Tag' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(input.value).toBe('')
    })

    it('should clear input after adding tag via blur', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText(
        'Add item...'
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: 'Test Tag' } })
      fireEvent.blur(input)

      expect(input.value).toBe('')
    })

    it('should trim whitespace from tags', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: '  Trimmed Tag  ' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockOnAdd).toHaveBeenCalledWith('Trimmed Tag')
    })

    it('should not add empty tags', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: '' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockOnAdd).not.toHaveBeenCalled()
    })

    it('should not add whitespace-only tags', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockOnAdd).not.toHaveBeenCalled()
    })

    it('should call onAdd when Enter is pressed', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, {
        key: 'Enter',
        code: 'Enter',
      })

      expect(mockOnAdd).toHaveBeenCalledWith('Test')
    })

    it('should not trigger onAdd for other keys', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'a', code: 'KeyA' })

      expect(mockOnAdd).not.toHaveBeenCalled()
    })
  })

  describe('Removing Tags', () => {
    it('should remove tag when clicking remove button', () => {
      const tags = ['React', 'TypeScript', 'Next.js']

      render(<TagInput tags={tags} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const removeButtons = screen.getAllByTitle('Remove')
      fireEvent.click(removeButtons[1]!)

      expect(mockOnRemove).toHaveBeenCalledWith(1)
      expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    it('should call onRemove with correct index for first tag', () => {
      const tags = ['First', 'Second', 'Third']

      render(<TagInput tags={tags} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const removeButtons = screen.getAllByTitle('Remove')
      fireEvent.click(removeButtons[0]!)

      expect(mockOnRemove).toHaveBeenCalledWith(0)
    })

    it('should call onRemove with correct index for last tag', () => {
      const tags = ['First', 'Second', 'Third']

      render(<TagInput tags={tags} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const removeButtons = screen.getAllByTitle('Remove')
      fireEvent.click(removeButtons[2]!)

      expect(mockOnRemove).toHaveBeenCalledWith(2)
    })

    it('should render correct number of remove buttons after removal', () => {
      const tags = ['React', 'TypeScript']

      const { rerender } = render(
        <TagInput tags={tags} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      expect(screen.getAllByTitle('Remove')).toHaveLength(2)

      rerender(
        <TagInput tags={['React']} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      expect(screen.getAllByTitle('Remove')).toHaveLength(1)
    })
  })

  describe('Variant Styles', () => {
    it('should apply purple variant styles by default', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toHaveClass('border-purple-400/30')
      expect(input).toHaveClass('focus:border-purple-400')
      expect(input).toHaveClass('hover:border-purple-400/50')
    })

    it('should apply purple variant styles when explicitly set', () => {
      render(
        <TagInput
          tags={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          variant="purple"
        />
      )

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toHaveClass('border-purple-400/30')
    })

    it('should apply pink variant styles', () => {
      render(
        <TagInput
          tags={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          variant="pink"
        />
      )

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toHaveClass('border-pink-400/30')
      expect(input).toHaveClass('focus:border-pink-400')
      expect(input).toHaveClass('hover:border-pink-400/50')
    })

    it('should apply teal variant styles', () => {
      render(
        <TagInput
          tags={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          variant="teal"
        />
      )

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toHaveClass('border-teal-400/30')
      expect(input).toHaveClass('focus:border-teal-400')
      expect(input).toHaveClass('hover:border-teal-400/50')
    })

    it('should apply blue variant styles', () => {
      render(
        <TagInput
          tags={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          variant="blue"
        />
      )

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toHaveClass('border-blue-400/30')
      expect(input).toHaveClass('focus:border-blue-400')
      expect(input).toHaveClass('hover:border-blue-400/50')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations with empty tags', async () => {
      const { container } = render(
        <TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      const results = await axe(container as any)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations with tags', async () => {
      const { container } = render(
        <TagInput
          tags={['React', 'TypeScript', 'Next.js']}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
        />
      )

      const results = await axe(container as any)
      expect(results).toHaveNoViolations()
    })

    it('should have button type="button" for remove buttons', () => {
      render(
        <TagInput
          tags={['React', 'TypeScript']}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
        />
      )

      const removeButtons = screen.getAllByTitle('Remove')
      removeButtons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    it('should have title attribute on remove buttons', () => {
      render(
        <TagInput tags={['React']} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      const removeButton = screen.getByTitle('Remove')
      expect(removeButton).toHaveAttribute('title', 'Remove')
    })

    it('should have proper input attributes', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('placeholder', 'Add item...')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty array gracefully', () => {
      const { container } = render(
        <TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      const tags = container.querySelectorAll('.inline-flex.items-center')
      expect(tags.length).toBe(0)
      expect(screen.getByPlaceholderText('Add item...')).toBeInTheDocument()
    })

    it('should handle special characters in tag names', () => {
      const specialTags = [
        'C++',
        'C#',
        'Node.js',
        '@angular/core',
        'React/Redux',
      ]

      render(
        <TagInput
          tags={specialTags}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
        />
      )

      specialTags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })

    it('should handle very long tag names', () => {
      const longTag =
        'ThisIsAVeryLongTechnologyNameThatMightWrapToMultipleLines'

      render(
        <TagInput tags={[longTag]} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      expect(screen.getByText(longTag)).toBeInTheDocument()
    })

    it('should handle many tags', () => {
      const manyTags = Array.from({ length: 20 }, (_, i) => `Tag ${i + 1}`)

      render(
        <TagInput tags={manyTags} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      expect(screen.getAllByTitle('Remove')).toHaveLength(20)
      manyTags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })

    it('should handle tags with numbers', () => {
      const tags = ['ES2015', 'ES2020', 'HTTP/2', 'Vue3']

      render(<TagInput tags={tags} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })

    it('should handle tags with unicode characters', () => {
      const tags = ['日本語', 'Español', 'Français', '中文']

      render(<TagInput tags={tags} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })

    it('should handle rapid tag additions', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: 'Tag1' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      fireEvent.change(input, { target: { value: 'Tag2' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      fireEvent.change(input, { target: { value: 'Tag3' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockOnAdd).toHaveBeenCalledTimes(3)
      expect(mockOnAdd).toHaveBeenNthCalledWith(1, 'Tag1')
      expect(mockOnAdd).toHaveBeenNthCalledWith(2, 'Tag2')
      expect(mockOnAdd).toHaveBeenNthCalledWith(3, 'Tag3')
    })

    it('should handle mixing Enter and blur for tag addition', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: 'Tag1' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      fireEvent.change(input, { target: { value: 'Tag2' } })
      fireEvent.blur(input)

      expect(mockOnAdd).toHaveBeenCalledTimes(2)
      expect(mockOnAdd).toHaveBeenNthCalledWith(1, 'Tag1')
      expect(mockOnAdd).toHaveBeenNthCalledWith(2, 'Tag2')
    })

    it('should not add tag on blur if already added via Enter', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')

      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      fireEvent.blur(input)

      // Should only be called once (Enter), not twice (Enter + blur)
      expect(mockOnAdd).toHaveBeenCalledTimes(1)
    })

    it('should handle changing input value without submission', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText(
        'Add item...'
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: 'Test1' } })
      expect(input.value).toBe('Test1')

      fireEvent.change(input, { target: { value: 'Test2' } })
      expect(input.value).toBe('Test2')

      expect(mockOnAdd).not.toHaveBeenCalled()
    })
  })

  describe('Layout and Styling', () => {
    it('should apply flex-wrap layout to container', () => {
      const { container } = render(
        <TagInput tags={['React']} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      const wrapper = container.querySelector('.flex.flex-wrap')
      expect(wrapper).toBeInTheDocument()
    })

    it('should apply gap-2 spacing to container', () => {
      const { container } = render(
        <TagInput tags={['React']} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      const wrapper = container.querySelector('.gap-2')
      expect(wrapper).toBeInTheDocument()
    })

    it('should apply rounded-full to input', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toHaveClass('rounded-full')
    })

    it('should apply dashed border to input', () => {
      render(<TagInput tags={[]} onAdd={mockOnAdd} onRemove={mockOnRemove} />)

      const input = screen.getByPlaceholderText('Add item...')
      expect(input).toHaveClass('border-dashed')
    })

    it('should apply rounded-full to tag badges', () => {
      const { container } = render(
        <TagInput tags={['React']} onAdd={mockOnAdd} onRemove={mockOnRemove} />
      )

      const badge = container.querySelector('.rounded-full')
      expect(badge).toBeInTheDocument()
    })
  })
})
