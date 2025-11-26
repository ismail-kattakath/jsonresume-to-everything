import React from 'react'
import { render, screen } from '@testing-library/react'
import { FormCard } from '@/components/ui/FormCard'

describe('FormCard', () => {
  it('renders with children', () => {
    render(
      <FormCard>
        <div>Test Content</div>
      </FormCard>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with className', () => {
    const { container } = render(
      <FormCard className="custom-class">
        <div>Content</div>
      </FormCard>
    )
    const card = container.firstChild
    expect(card).toHaveClass('custom-class')
  })

  it('applies default styling classes', () => {
    const { container } = render(<FormCard>Content</FormCard>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('rounded-lg')
    expect(card.className).toContain('border')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<FormCard ref={ref}>Content</FormCard>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
