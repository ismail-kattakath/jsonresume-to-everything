import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AIGenerateCoverLetterModal from '@/components/cover-letter/forms/ai-generate-modal'

// Mock the base component
jest.mock('@/components/document-builder/shared-forms/ai-document-generator-modal', () => {
  return jest.fn(({ mode }) => <div data-testid="base-modal">Mode: {mode}</div>)
})

describe('AIGenerateCoverLetterModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onGenerate: jest.fn(),
    resumeData: { name: 'John Doe' } as any,
  }

  it('renders base AIDocumentGeneratorModal with coverLetter mode', () => {
    render(<AIGenerateCoverLetterModal {...mockProps} />)
    expect(screen.getByTestId('base-modal')).toBeInTheDocument()
    expect(screen.getByText('Mode: coverLetter')).toBeInTheDocument()
  })
})
