import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FormCard } from '@/components/ui/form-card'

describe('FormCard', () => {
  it('renders children correctly', () => {
    render(
      <FormCard>
        <div data-testid="child">Child Content</div>
      </FormCard>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <FormCard className="custom-class">
        <div>Content</div>
      </FormCard>
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <FormCard ref={ref}>
        <div>Content</div>
      </FormCard>
    )

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('DIV')
  })
})
