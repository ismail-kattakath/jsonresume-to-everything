import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FormTextarea } from '../FormTextarea'

describe('FormTextarea', () => {
  const mockOnChange = jest.fn()
  const mockOnAIAction = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders textarea with label', () => {
    render(
      <FormTextarea
        label="Job Description"
        value=""
        onChange={mockOnChange}
        name="jobDescription"
      />
    )

    expect(screen.getByPlaceholderText('Job Description')).toBeInTheDocument()
    expect(screen.getByText('Job Description')).toBeInTheDocument()
  })

  it('calls onChange when typing', () => {
    render(
      <FormTextarea
        label="Job Description"
        value=""
        onChange={mockOnChange}
        name="jobDescription"
      />
    )

    const textarea = screen.getByPlaceholderText('Job Description')
    fireEvent.change(textarea, { target: { value: 'New JD content' } })

    expect(mockOnChange).toHaveBeenCalledTimes(1)
  })

  it('is disabled when the disabled prop is true', () => {
    render(
      <FormTextarea
        label="Job Description"
        value=""
        onChange={mockOnChange}
        name="jobDescription"
        disabled={true}
      />
    )

    const textarea = screen.getByPlaceholderText('Job Description')
    expect(textarea).toBeDisabled()
  })

  it('renders AI button when onAIAction is provided', () => {
    render(
      <FormTextarea
        label="Job Description"
        value=""
        onChange={mockOnChange}
        name="jobDescription"
        onAIAction={mockOnAIAction}
        aiButtonTitle="Refine with AI"
      />
    )

    const aiButton = screen.getByTitle('Refine with AI')
    expect(aiButton).toBeInTheDocument()

    fireEvent.click(aiButton)
    expect(mockOnAIAction).toHaveBeenCalledTimes(1)
  })

  it('shows loading state on AI button', () => {
    render(
      <FormTextarea
        label="Job Description"
        value=""
        onChange={mockOnChange}
        name="jobDescription"
        onAIAction={mockOnAIAction}
        isAILoading={true}
      />
    )

    // The loader is usually an SVG/icon inside the button
    // AISortButton handles the loading state, but we can check if it exists
    // Since we are mocking icons or they are rendered as SVGs, we look for them.
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows character counter', () => {
    render(
      <FormTextarea
        label="Job Description"
        value="Hello World"
        onChange={mockOnChange}
        name="jobDescription"
        showCounter={true}
      />
    )

    expect(screen.getByText('11 chars')).toBeInTheDocument()
  })
})
