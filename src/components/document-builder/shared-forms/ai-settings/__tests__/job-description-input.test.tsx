import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import JobDescriptionInput from '@/components/document-builder/shared-forms/ai-settings/job-description-input'

// Mock AIContentGenerator
jest.mock('@/components/document-builder/shared-forms/ai-content-generator', () => ({
  __esModule: true,
  default: ({ label, value, onChange, onGenerated }: any) => (
    <div data-testid="mock-generator">
      {label}: {value}
      <button onClick={() => onGenerated('Generated Content')}>Generate</button>
      <button onClick={() => onChange('Direct String')}>String Change</button>
      <button onClick={() => onChange({ target: { value: 'Event Change' } })}>Event Change</button>
    </div>
  ),
}))

describe('JobDescriptionInput', () => {
  it('covers all branches of onChange', () => {
    const onChangeMock = jest.fn()
    render(<JobDescriptionInput value="" onChange={onChangeMock} />)

    // Branch 1: String
    fireEvent.click(screen.getByText('String Change'))
    expect(onChangeMock).toHaveBeenCalledWith('Direct String')

    // Branch 2: Event
    fireEvent.click(screen.getByText('Event Change'))
    expect(onChangeMock).toHaveBeenCalledWith('Event Change')

    // onGenerated path
    fireEvent.click(screen.getByText('Generate'))
    expect(onChangeMock).toHaveBeenCalledWith('Generated Content')
  })
})
