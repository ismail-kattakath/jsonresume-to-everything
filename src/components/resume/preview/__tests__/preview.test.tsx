import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Preview from '@/components/resume/preview/preview'
import { ResumeContext } from '@/lib/contexts/document-context'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { createMockResumeData } from '@/lib/__tests__/test-utils'

// Mock dependencies
jest.mock('@/lib/contexts/ai-settings-context')
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

// Mock Dynamic Imports - Simplified
jest.mock('next/dynamic', () => () => {
  return function MockDynamicComponent({ children, menu, droppableId, onDragEnd }: any) {
    if (onDragEnd) (global as any).__MOCKED_PREVIEW_ON_DRAG_END__ = onDragEnd
    if (menu) return <div data-testid="highlight-menu">{menu()}</div>
    if (typeof children === 'function') {
      return (
        <div data-testid={`dynamic-${droppableId || 'component'}`}>
          {children(
            {
              droppableProps: {},
              innerRef: jest.fn(),
              placeholder: null,
            },
            { isDragging: false }
          )}
        </div>
      )
    }
    if (droppableId) return <div data-testid={`droppable-${droppableId}`}>{children}</div>
    return <>{children}</>
  }
})

// Mock DnD
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => {
    ;(global as any).__MOCKED_PREVIEW_ON_DRAG_END__ = onDragEnd
    return <div>{children}</div>
  },
  Droppable: ({ children }: any) =>
    children(
      {
        droppableProps: {},
        innerRef: jest.fn(),
        placeholder: <div data-testid="placeholder" />,
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

// Mock Child Components
jest.mock('@/components/resume/preview/skills', () => {
  const M = () => <div data-testid="skills-preview">Skills</div>
  M.displayName = 'MockSkills'
  return M
})
jest.mock('@/components/resume/preview/language', () => {
  const M = () => <div data-testid="language-preview">Language</div>
  M.displayName = 'MockLanguage'
  return M
})
jest.mock('@/components/resume/preview/certification', () => {
  const M = () => <div data-testid="cert-preview">Certification</div>
  M.displayName = 'MockCertification'
  return M
})
jest.mock('@/components/document-builder/shared-preview/contact-info', () => {
  const M = () => <div data-testid="contact-preview">Contact</div>
  M.displayName = 'MockContactInfo'
  return M
})
jest.mock('@/lib/utils/date-range', () => {
  const M = () => <div data-testid="date-range">DateRange</div>
  M.displayName = 'MockDateRange'
  return M
})

const TestWrapper = ({ initialData, children }: { initialData: any; children: React.ReactNode }) => {
  const [resumeData, setResumeData] = React.useState(createMockResumeData(initialData))
  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData, editable: true } as any}>
      {children}
    </ResumeContext.Provider>
  )
}

describe('Preview Component', () => {
  const mockAISettings = {
    settings: {
      skillsToHighlight: 'React, Node',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAISettings as jest.Mock).mockReturnValue(mockAISettings)
    document.execCommand = jest.fn()
  })

  it('renders basic resume info', () => {
    render(
      <TestWrapper initialData={{ name: 'John Doe', position: 'Developer' }}>
        <Preview />
      </TestWrapper>
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Developer')).toBeInTheDocument()
  })

  it('handles field edits (onBlur)', () => {
    const setResumeData = jest.fn()
    render(
      <ResumeContext.Provider
        value={
          {
            resumeData: createMockResumeData({ socialMedia: [{ socialMedia: 'Github', link: 'old' }] }),
            setResumeData,
            editable: true,
          } as any
        }
      >
        <Preview />
      </ResumeContext.Provider>
    )

    const githubLink = screen.getByLabelText('Github')
    fireEvent.blur(githubLink, { target: { innerText: 'new-link' } })
    expect(setResumeData).toHaveBeenCalled()
  })

  it('handles formatting commands', () => {
    render(
      <TestWrapper initialData={{}}>
        <Preview />
      </TestWrapper>
    )

    // Formatting buttons are in HighlightMenu which we mocked
    const boldButton = screen.getByTitle(/Bold/i)
    fireEvent.click(boldButton)
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined)
  })

  it('handles drag and drop for work experience', () => {
    const setResumeData = jest.fn()
    render(
      <ResumeContext.Provider
        value={
          {
            resumeData: createMockResumeData({
              workExperience: [{ organization: 'A' } as any, { organization: 'B' } as any],
            }),
            setResumeData,
          } as any
        }
      >
        <Preview />
      </ResumeContext.Provider>
    )

    const onDragEnd = (global as any).__MOCKED_PREVIEW_ON_DRAG_END__

    act(() => {
      onDragEnd({
        source: { index: 0, droppableId: 'work-experience' },
        destination: { index: 1, droppableId: 'work-experience' },
      })
    })

    expect(setResumeData).toHaveBeenCalled()
  })

  it('handles drag and drop for project key achievements', () => {
    const setResumeData = jest.fn()
    render(
      <ResumeContext.Provider
        value={
          {
            resumeData: createMockResumeData({
              projects: [{ name: 'P1', keyAchievements: [{ text: 'A1' }, { text: 'A2' }] } as any],
            }),
            setResumeData,
          } as any
        }
      >
        <Preview />
      </ResumeContext.Provider>
    )

    const onDragEnd = (global as any).__MOCKED_PREVIEW_ON_DRAG_END__

    act(() => {
      onDragEnd({
        source: { index: 0, droppableId: 'PROJECTS_KEY_ACHIEVEMENT-0' },
        destination: { index: 1, droppableId: 'PROJECTS_KEY_ACHIEVEMENT-0' },
      })
    })

    expect(setResumeData).toHaveBeenCalled()
  })

  it('returns early in onDragEnd if no destination', () => {
    const setResumeData = jest.fn()
    render(
      <ResumeContext.Provider
        value={
          {
            resumeData: createMockResumeData({ workExperience: [{ organization: 'A' } as any] }),
            setResumeData,
          } as any
        }
      >
        <Preview />
      </ResumeContext.Provider>
    )

    const onDragEnd = (global as any).__MOCKED_PREVIEW_ON_DRAG_END__

    act(() => {
      onDragEnd({ destination: null, source: { index: 0 } })
    })
    expect(setResumeData).not.toHaveBeenCalled()
  })

  it('renders profile picture if present', () => {
    render(
      <TestWrapper initialData={{ profilePicture: 'test.jpg' }}>
        <Preview />
      </TestWrapper>
    )
    expect(screen.getByAltText('profile')).toBeInTheDocument()
  })

  it('handles missing project link and keywords', () => {
    render(
      <TestWrapper initialData={{ projects: [{ name: 'Secret Project', description: 'No link' }] }}>
        <Preview />
      </TestWrapper>
    )
    const link = screen.getByText('Secret Project')
    expect(link).toHaveAttribute('href', '#')
  })

  it('handles projects with keywords', () => {
    render(
      <TestWrapper initialData={{ projects: [{ name: 'P1', keywords: ['TS', 'React'] }] }}>
        <Preview />
      </TestWrapper>
    )
    // Use getAllByText as Highlight might wrap text in multiple spans
    expect(screen.getAllByText(/TS/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/React/i).length).toBeGreaterThan(0)
  })

  it('handles project reordering in onDragEnd', () => {
    const setResumeData = jest.fn()
    const initialData = createMockResumeData({
      projects: [
        { name: 'P1', description: 'D1', link: '', keyAchievements: [], startYear: '', endYear: '' },
        { name: 'P2', description: 'D2', link: '', keyAchievements: [], startYear: '', endYear: '' },
      ],
    })

    render(
      <ResumeContext.Provider
        value={
          {
            resumeData: initialData,
            setResumeData,
          } as any
        }
      >
        <Preview />
      </ResumeContext.Provider>
    )

    const onDragEnd = (global as any).__MOCKED_PREVIEW_ON_DRAG_END__

    act(() => {
      onDragEnd({
        source: { droppableId: 'projects', index: 0 },
        destination: { droppableId: 'projects', index: 1 },
      })
    })

    expect(setResumeData).toHaveBeenCalled()
  })

  it('handles work experience reordering in onDragEnd', () => {
    const setResumeData = jest.fn()
    const initialData = createMockResumeData({
      workExperience: [
        { organization: 'First', position: 'A', description: 'D1' } as any,
        { organization: 'Second', position: 'B', description: 'D2' } as any,
      ],
    })

    render(
      <ResumeContext.Provider
        value={
          {
            resumeData: initialData,
            setResumeData,
          } as any
        }
      >
        <Preview />
      </ResumeContext.Provider>
    )

    const onDragEnd = (global as any).__MOCKED_PREVIEW_ON_DRAG_END__

    act(() => {
      onDragEnd({
        source: { droppableId: 'work-experience', index: 0 },
        destination: { droppableId: 'work-experience', index: 1 },
      })
    })

    expect(setResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        workExperience: [
          expect.objectContaining({ organization: 'Second' }),
          expect.objectContaining({ organization: 'First' }),
        ],
      })
    )
  })

  it('handles skills reordering in onDragEnd', () => {
    const setResumeData = jest.fn()
    const initialData = createMockResumeData({
      skills: [
        { title: 'S1', skills: [] },
        { title: 'S2', skills: [] },
      ],
    })

    render(
      <ResumeContext.Provider
        value={
          {
            resumeData: initialData,
            setResumeData,
          } as any
        }
      >
        <Preview />
      </ResumeContext.Provider>
    )

    const onDragEnd = (global as any).__MOCKED_PREVIEW_ON_DRAG_END__

    act(() => {
      onDragEnd({
        source: { droppableId: 'skills', index: 0 },
        destination: { droppableId: 'skills', index: 1 },
      })
    })

    expect(setResumeData).toHaveBeenCalled()
  })

  it('handles drag and drop for work experience key achievements', () => {
    const setResumeData = jest.fn()
    render(
      <ResumeContext.Provider
        value={
          {
            resumeData: createMockResumeData({
              workExperience: [{ organization: 'W1', keyAchievements: [{ text: 'A1' }, { text: 'A2' }] } as any],
            }),
            setResumeData,
          } as any
        }
      >
        <Preview />
      </ResumeContext.Provider>
    )

    const onDragEnd = (global as any).__MOCKED_PREVIEW_ON_DRAG_END__

    act(() => {
      onDragEnd({
        source: { index: 0, droppableId: 'WORK_EXPERIENCE_KEY_ACHIEVEMENT-0' },
        destination: { index: 1, droppableId: 'WORK_EXPERIENCE_KEY_ACHIEVEMENT-0' },
      })
    })

    expect(setResumeData).toHaveBeenCalled()
  })

  it('handles font size and alignment buttons', () => {
    render(
      <TestWrapper initialData={{}}>
        <Preview />
      </TestWrapper>
    )

    const plusButton = screen.getByTitle(/Increase Font Size/i)
    fireEvent.click(plusButton)
    expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '4')

    const minusButton = screen.getByTitle(/Decrease Font Size/i)
    fireEvent.click(minusButton)
    expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '2')

    const leftButton = screen.getByTitle(/Align Left/i)
    fireEvent.click(leftButton)
    expect(document.execCommand).toHaveBeenCalledWith('justifyLeft', false, undefined)

    const centerButton = screen.getByTitle(/Align Center/i)
    fireEvent.click(centerButton)
    expect(document.execCommand).toHaveBeenCalledWith('justifyCenter', false, undefined)

    const rightButton = screen.getByTitle(/Align Right/i)
    fireEvent.click(rightButton)
    expect(document.execCommand).toHaveBeenCalledWith('justifyRight', false, undefined)
  })

  it('renders education section with various data combinations', () => {
    const { unmount } = render(
      <TestWrapper
        initialData={{
          education: [
            {
              school: 'University',
              studyType: 'BS',
              area: 'CS',
              startYear: '2020',
              endYear: '2024',
              url: 'http://edu.com',
            },
          ],
        }}
      >
        <Preview />
      </TestWrapper>
    )
    expect(screen.getByText(/BS/i)).toBeInTheDocument()
    expect(screen.getByText(/CS/i)).toBeInTheDocument()
    expect(screen.getByText('University')).toHaveAttribute('href', 'http://edu.com')
    unmount()

    const { unmount: unmount2 } = render(
      <TestWrapper
        initialData={{
          education: [{ school: 'No Link', studyType: 'MS', area: '' }],
        }}
      >
        <Preview />
      </TestWrapper>
    )
    expect(screen.getByText(/MS/i)).toBeInTheDocument()
    expect(screen.getByText('No Link')).not.toHaveAttribute('href')
    unmount2()

    render(
      <TestWrapper
        initialData={{
          education: [{ school: 'Only Area', studyType: '', area: 'Physics' }],
        }}
      >
        <Preview />
      </TestWrapper>
    )
    expect(screen.getByText(/Physics/i)).toBeInTheDocument()
  })
})
