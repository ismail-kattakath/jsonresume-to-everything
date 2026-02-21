import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AIPipelineButton from '@/components/document-builder/shared-forms/ai-settings/ai-pipeline-button'
import { useAISettings } from '@/lib/contexts/ai-settings-context'

jest.mock('@/lib/contexts/ai-settings-context')

describe('AIPipelineButton', () => {
  const mockAISettings = {
    settings: { providerType: 'openai' },
    isAIWorking: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAISettings as jest.Mock).mockReturnValue(mockAISettings)
  })

  it('renders correctly with default state', () => {
    render(<AIPipelineButton onRun={jest.fn()} disabled={false} isLoading={false} />)
    expect(screen.getByText(/Optimize Resume by Job Description/i)).toBeInTheDocument()
  })

  it('shows on-device label when provider is on-device', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({
      ...mockAISettings,
      settings: { providerType: 'on-device' },
    })

    render(<AIPipelineButton onRun={jest.fn()} disabled={false} isLoading={false} />)
    expect(screen.getByText(/Optimize Resume \(On-Device\)/i)).toBeInTheDocument()
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
