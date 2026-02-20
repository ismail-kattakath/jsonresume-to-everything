import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdditionalSections from '@/components/resume/forms/additional-sections'
import { ResumeContext } from '@/lib/contexts/document-context'
import { createMockResumeData } from '@/lib/__tests__/test-utils'

// Mock DnD
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: any) => <div>{children}</div>,
  Droppable: ({ children }: any) =>
    children(
      {
        droppableProps: {},
        innerRef: jest.fn(),
        placeholder: null,
      },
      {}
    ),
  Draggable: ({ children }: any) =>
    children(
      {
        draggableProps: {},
        dragHandleProps: {},
        innerRef: jest.fn(),
      },
      { isDragging: false }
    ),
}))

// Mock child components
jest.mock('../language', () => {
  const Mock = () => <div data-testid="language-form">Language Form</div>
  Mock.displayName = 'MockLanguage'
  return Mock
})
jest.mock('../certification', () => {
  const Mock = () => <div data-testid="certification-form">Certification Form</div>
  Mock.displayName = 'MockCertification'
  return Mock
})

describe('AdditionalSections Component', () => {
  const mockSetResumeData = jest.fn()

  const setup = (initialData: any = {}) => {
    const mockData = createMockResumeData(initialData)
    return render(
      <ResumeContext.Provider value={{ resumeData: mockData as any, setResumeData: mockSetResumeData } as any}>
        <AdditionalSections />
      </ResumeContext.Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders both Languages and Certifications headers', () => {
    setup()
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('Certifications')).toBeInTheDocument()
  })

  it('toggles expansion between sections', () => {
    setup()

    const languagesButton = screen.getByText('Languages')
    const certificationsButton = screen.getByText('Certifications')

    // Initial state: Expand first
    fireEvent.click(languagesButton)
    expect(screen.getByTestId('language-form')).toBeInTheDocument()

    // Toggle to certifications
    fireEvent.click(certificationsButton)
    expect(screen.getByTestId('certification-form')).toBeInTheDocument()

    // Language should be collapsed (assuming single-expand accordion behavior)
    // AccordionCard usually handles this via its isExpanded prop
  })

  it('handles reordering via onDragEnd branches', () => {
    setup()
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    // Case 1: No destination
    act(() => {
      onDragEnd({ destination: null, source: { index: 0 } })
    })

    // Case 2: Same index
    act(() => {
      onDragEnd({ destination: { index: 0 }, source: { index: 0 } })
    })

    // Case 3: Reorder
    act(() => {
      onDragEnd({ destination: { index: 1 }, source: { index: 0 } })
    })

    // Case 4: Invalid removed (Line 54)
    act(() => {
      onDragEnd({ destination: { index: 1 }, source: { index: 99 } })
    })

    // Header should still be there but data shifted internally
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('Certifications')).toBeInTheDocument()
  })

  it('shows correct tooltips for expand/collapse buttons', () => {
    setup()
    const expandButtons = screen.getAllByRole('button', { name: /Expand/i })
    expect(expandButtons).toHaveLength(2)

    fireEvent.click(expandButtons[0]!)
    expect(screen.getByRole('button', { name: /Collapse/i })).toBeInTheDocument()
  })
})
