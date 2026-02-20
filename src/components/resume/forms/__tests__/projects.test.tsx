import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Projects from '@/components/resume/forms/projects'
import { ResumeContext } from '@/lib/contexts/document-context'
import { useArrayForm } from '@/hooks/use-array-form'

// Mock dependencies
jest.mock('@/hooks/use-array-form')
jest.mock('@/components/resume/forms/project-key-achievements', () => ({
  __esModule: true,
  default: () => <div data-testid="project-achievements">Achievements</div>,
}))

jest.mock('@/components/ui/sortable-tag-input', () => ({
  __esModule: true,
  default: ({
    tags,
    onRemove,
    onAdd,
    onReorder,
  }: {
    tags: string[]
    onRemove: (i: number) => void
    onAdd: (s: string) => void
    onReorder: (s: number, d: number) => void
  }) => (
    <div data-testid="tag-input">
      {tags.map((tag: string, i: number) => (
        <div key={i}>
          {tag}
          <button onClick={() => onRemove(i)}>Remove {tag}</button>
        </div>
      ))}
      <button onClick={() => onAdd('New Keyword')}>Add Keyword</button>
      <button onClick={() => onReorder(0, 1)}>Reorder Keyword</button>
    </div>
  ),
}))

// Mock next/dynamic to handle DND render props synchronously
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<unknown>) => {
    const ReactComp = React
    // Call loader to get coverage for the dynamic imports
    loader()
    return (props: Record<string, unknown> & { children?: unknown; onDragEnd?: unknown }) => {
      if (props.onDragEnd) {
        // @ts-ignore
        global.__MOCKED_DND_CONTEXT_ON_DRAG_END__ = props.onDragEnd
      }
      if (typeof props.children === 'function') {
        const provided = {
          innerRef: jest.fn(),
          droppableProps: {},
          draggableProps: {},
          dragHandleProps: {},
          placeholder: ReactComp.createElement('div', { 'data-testid': 'placeholder' }),
        }
        const snapshot = { isDragging: Boolean((global as Record<string, unknown>)['__MOCK_IS_DRAGGING__']) }
        return props.children(provided, snapshot)
      }
      return ReactComp.createElement('div', props, props.children as React.ReactNode)
    }
  },
}))

describe('Projects', () => {
  const mockSetResumeData = jest.fn()

  const mockResumeData = {
    projects: [
      {
        name: 'Project 1',
        link: 'http://p1.com',
        description: 'Desc 1',
        keywords: ['React', 'TypeScript'],
        startYear: '2020-01-01',
        endYear: '2021-01-01',
      },
    ],
  }

  const mockArrayForm = {
    data: mockResumeData.projects,
    handleChange: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useArrayForm as jest.Mock).mockReturnValue(mockArrayForm)
    window.prompt = jest.fn().mockReturnValue('New Keyword')
  })

  const renderComponent = (resumeData: unknown = mockResumeData) => {
    return render(
      <ResumeContext.Provider
        value={
          {
            resumeData,
            setResumeData: mockSetResumeData,
            handleChange: jest.fn(),
            handleProfilePicture: jest.fn(),
          } as unknown as React.ContextType<typeof ResumeContext>
        }
      >
        <Projects />
      </ResumeContext.Provider>
    )
  }

  it('renders existing projects', () => {
    renderComponent()
    expect(screen.getByDisplayValue('Project 1')).toBeInTheDocument()
  })

  it('handles adding a project', () => {
    renderComponent()
    const addButton = screen.getByText(/Add Project/i)
    fireEvent.click(addButton)
    expect(mockArrayForm.add).toHaveBeenCalled()
  })

  it('handles removing a project', () => {
    renderComponent()
    const deleteButton = screen.getByTitle('Delete this project')
    fireEvent.click(deleteButton)
    expect(mockArrayForm.remove).toHaveBeenCalledWith(0)
  })

  it('handles adding a keyword', () => {
    renderComponent()
    const addKeywordButton = screen.getByText('Add Keyword')
    fireEvent.click(addKeywordButton)
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [expect.objectContaining({ keywords: ['React', 'TypeScript', 'New Keyword'] })],
      })
    )
  })

  it('handles removing a keyword', () => {
    renderComponent()
    const removeKeywordButton = screen.getByText('Remove React')
    fireEvent.click(removeKeywordButton)
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [expect.objectContaining({ keywords: ['TypeScript'] })],
      })
    )
  })

  it('handles reordering keywords', () => {
    renderComponent()
    const reorderButton = screen.getByText('Reorder Keyword')
    fireEvent.click(reorderButton)
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [expect.objectContaining({ keywords: ['TypeScript', 'React'] })],
      })
    )
  })

  it('handles input changes for all fields', () => {
    renderComponent()
    const fields = [
      { label: 'Project Name', value: 'New Name' },
      { label: 'Link', value: 'http://new.com' },
      { label: 'Description', value: 'New Desc' },
      { label: 'Start Year', value: '2022-01-01' },
      { label: 'End Year', value: '2023-01-01' },
    ]

    fields.forEach(({ label, value }) => {
      const input = screen.getByLabelText(label)
      fireEvent.change(input, { target: { value } })
    })
    expect(mockArrayForm.handleChange).toHaveBeenCalledTimes(fields.length)
  })

  it('handles drag and drop reordering', () => {
    renderComponent()
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    act(() => {
      onDragEnd({
        destination: { index: 1, droppableId: 'projects' },
        source: { index: 0, droppableId: 'projects' },
      })
    })

    expect(mockSetResumeData).toHaveBeenCalled()
  })

  it('ignores drag if no destination', () => {
    renderComponent()
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    act(() => {
      onDragEnd({ destination: null, source: { index: 0 } })
    })

    expect(mockSetResumeData).not.toHaveBeenCalled()
  })

  it('ignores drag if destination is same as source', () => {
    renderComponent()
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    act(() => {
      onDragEnd({
        destination: { index: 0, droppableId: 'projects' },
        source: { index: 0, droppableId: 'projects' },
      })
    })

    expect(mockSetResumeData).not.toHaveBeenCalled()
  })

  it('handles missing project or keywords in handlers', () => {
    // 1. onDragEnd with missing projects (exercising line 59 fallback)
    renderComponent({ projects: undefined })
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__
    act(() => {
      onDragEnd({
        destination: { index: 1, droppableId: 'projects' },
        source: { index: 0, droppableId: 'projects' },
      })
    })
    expect(mockSetResumeData).not.toHaveBeenCalled()

    // 2. keyword handlers with drift (missing project branch)
    ;(useArrayForm as jest.Mock).mockReturnValue({
      ...mockArrayForm,
      data: [{ name: 'Ghost', keywords: ['Poltergeist'] }],
    })
    render(
      <ResumeContext.Provider
        value={
          { resumeData: { projects: [] }, setResumeData: mockSetResumeData } as unknown as React.ContextType<
            typeof ResumeContext
          >
        }
      >
        <Projects />
      </ResumeContext.Provider>
    )

    // handleRemoveKeyword
    const removeButton = screen.getAllByText('Remove Poltergeist')[0]
    fireEvent.click(removeButton!)
    expect(mockSetResumeData).not.toHaveBeenCalled()

    // handleReorderKeyword
    const reorderButton = screen.getAllByText('Reorder Keyword')[0]
    fireEvent.click(reorderButton!)
    expect(mockSetResumeData).not.toHaveBeenCalled()
  })

  it('handles undefined projects or keywords in handlers', () => {
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__
    act(() => {
      onDragEnd({
        destination: { index: 0, droppableId: 'projects' },
        source: { index: 0, droppableId: 'projects' }, // Trigger return on line 57 anyway, but let's test line 59
      })
      onDragEnd({
        destination: { index: 1, droppableId: 'projects' },
        source: { index: 0, droppableId: 'projects' },
      })
    })
    expect(mockSetResumeData).not.toHaveBeenCalled()

    // 2. handleAddKeyword with undefined keywords (Line 72)
    const dataWithMissingKeywords = {
      projects: [{ name: 'P1', keywords: undefined }],
    }
    ;(useArrayForm as jest.Mock).mockReturnValue({ ...mockArrayForm, data: dataWithMissingKeywords.projects })
    renderComponent(dataWithMissingKeywords)
    const allAddKeywordButtons = screen.queryAllByText('Add Keyword')
    if (allAddKeywordButtons.length > 0) {
      fireEvent.click(allAddKeywordButtons[0]!)
    }
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [expect.objectContaining({ keywords: ['New Keyword'] })],
      })
    )

    // 3. handleRemoveKeyword with undefined keywords (Line 85)
    // This is hard since if keywords is undefined, no remove buttons render.
  })

  it('handles reordering keywords failure (missing removed)', () => {
    renderComponent()
    const spy = jest.spyOn(Array.prototype, 'splice').mockReturnValue([])
    const reorderButton = screen.getAllByText('Reorder Keyword')[0]
    if (reorderButton) {
      fireEvent.click(reorderButton)
    }
    expect(mockSetResumeData).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('renders dragging state', () => {
    // @ts-ignore
    global.__MOCK_IS_DRAGGING__ = true
    renderComponent()
    // Find item with dragging class
    expect(screen.getByDisplayValue('Project 1').closest('.group')).toHaveClass('bg-white/20')
    // @ts-ignore
    global.__MOCK_IS_DRAGGING__ = false
  })
})
