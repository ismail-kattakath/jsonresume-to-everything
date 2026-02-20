import { render, screen, fireEvent } from '@testing-library/react'
import AIPipelineButton from '@/components/document-builder/shared-forms/ai-settings/ai-pipeline-button'

describe('AIPipelineButton', () => {
  it('renders with Sparkles icon when not loading', () => {
    render(<AIPipelineButton onRun={jest.fn()} disabled={false} isLoading={false} />)
    expect(screen.getByText('Optimize by JD')).toBeInTheDocument()
    // Icon rendering check (just checking it doesn't throw and renders button content)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders with Loader2 spinner when loading', () => {
    render(<AIPipelineButton onRun={jest.fn()} disabled={false} isLoading={true} />)
    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('calls onRun when clicked', () => {
    const onRun = jest.fn()
    render(<AIPipelineButton onRun={onRun} disabled={false} isLoading={false} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onRun).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<AIPipelineButton onRun={jest.fn()} disabled={true} isLoading={false} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
