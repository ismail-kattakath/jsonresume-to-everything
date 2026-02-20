import React, { useState } from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Education from '@/components/resume/forms/education'
import { ResumeContext } from '@/lib/contexts/document-context'
import { createMockResumeData } from '@/lib/__tests__/test-utils'

// Mock DnD to avoid complex setup
jest.mock('@hello-pangea/dnd', () => ({
  DnDContext: ({ children }: any) => <div>{children}</div>,
  DnDDroppable: ({ children }: any) =>
    children(
      {
        droppableProps: {},
        innerRef: jest.fn(),
        placeholder: null,
      },
      {}
    ),
  DnDDraggable: ({ children }: any) =>
    children(
      {
        draggableProps: {},
        dragHandleProps: {},
        innerRef: jest.fn(),
      },
      { isDragging: false }
    ),
}))

const TestWrapper = ({ initialData }: { initialData: any }) => {
  const [resumeData, setResumeData] = useState(createMockResumeData(initialData))
  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData } as any}>
      <Education />
    </ResumeContext.Provider>
  )
}

describe('Education Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
  })

  it('renders existing education entries', () => {
    render(
      <TestWrapper
        initialData={{
          education: [{ school: 'Harvard University', studyType: 'Bachelor', area: 'CS' }],
        }}
      />
    )
    expect(screen.getByText('Harvard University')).toBeInTheDocument()
    expect(screen.getByText('Bachelor in CS')).toBeInTheDocument()
  })

  it('adds a new education entry', async () => {
    render(<TestWrapper initialData={{ education: [] }} />)

    const addButton = screen.getByRole('button', { name: /Add Education/i })
    fireEvent.click(addButton)

    // Check if "New Education" appears (placeholder in header)
    expect(screen.getByText('New Education')).toBeInTheDocument()
  })

  it('updates fields correctly', () => {
    render(
      <TestWrapper
        initialData={{
          education: [{ school: 'MIT', studyType: 'Master', area: 'Physics' }],
        }}
      />
    )

    // Open accordion
    const header = screen.getByText('MIT')
    fireEvent.click(header)

    const schoolInput = screen.getByLabelText(/Institution Name/i)
    fireEvent.change(schoolInput, { target: { value: 'Stanford', name: 'school' } })

    // Check if the header updated to reflect the new school name
    expect(screen.getByText('Stanford')).toBeInTheDocument()
  })

  it('removes an education entry', () => {
    render(
      <TestWrapper
        initialData={{
          education: [{ school: 'MIT' }],
        }}
      />
    )

    expect(screen.getByText('MIT')).toBeInTheDocument()

    const deleteButton = screen.getByTitle('Delete education')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.queryByText('MIT')).not.toBeInTheDocument()
  })
})
