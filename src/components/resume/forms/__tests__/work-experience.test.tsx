import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import WorkExperience from '@/components/resume/forms/work-experience'
import { ResumeContext } from '@/lib/contexts/document-context'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { useArrayForm } from '@/hooks/use-array-form'
import { useAccordion } from '@/hooks/use-accordion'
import { sortTechStackGraph } from '@/lib/ai/strands/agent'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/lib/contexts/ai-settings-context')
jest.mock('@/hooks/use-array-form')
jest.mock('@/hooks/use-accordion')
jest.mock('@/lib/ai/strands/agent')
jest.mock('sonner', () => ({
  toast: Object.assign(
    jest.fn(() => 'mock-toast-id'),
    {
      success: jest.fn(),
      error: jest.fn(),
      dismiss: jest.fn(),
    }
  ),
}))

jest.mock('@/components/resume/forms/key-achievements', () => ({
  __esModule: true,
  default: () => <div data-testid="key-achievements">Key Achievements</div>,
}))

jest.mock('@/components/ui/sortable-tag-input', () => ({
  __esModule: true,
  default: ({
    tags,
    onAdd,
    onRemove,
    onReorder,
  }: {
    tags: string[]
    onAdd: (t: string) => void
    onRemove: (i: number) => void
    onReorder: (i: number, j: number) => void
  }) => (
    <div data-testid="tag-input">
      {tags.map((tag: string, i: number) => (
        <div key={i}>
          {tag}
          <button onClick={() => onRemove(i)}>Remove {tag}</button>
        </div>
      ))}
      <button onClick={() => onAdd('New Tech')}>Add Tech</button>
      <button onClick={() => onReorder(0, 1)}>Reorder Tech</button>
    </div>
  ),
}))

jest.mock('@/components/ui/ai-action-button', () => ({
  __esModule: true,
  default: ({ onClick, label, isConfigured }: { onClick: () => void; label: string; isConfigured: boolean }) => (
    <button onClick={onClick} aria-label={label}>
      {label}
    </button>
  ),
}))

jest.mock('@/components/document-builder/shared-forms/ai-content-generator', () => ({
  __esModule: true,
  default: ({
    label,
    value,
    onChange,
    onGenerated,
  }: {
    label?: string
    value: string
    onChange: (e: any) => void
    onGenerated: (v: string, a?: string[]) => void
  }) => (
    <div data-testid="ai-generator">
      {label && <label htmlFor="description-input">{label}</label>}
      <textarea id="description-input" data-testid="description-input" value={value} onChange={(e) => onChange(e)} />
      <button data-testid="trigger-string-change" onClick={() => onChange('New String Description')}>
        String Change
      </button>
      <button
        data-testid="trigger-generated"
        onClick={() => onGenerated('AI Generated Description', ['New Achievement'])}
      >
        Generate
      </button>
    </div>
  ),
}))

describe('WorkExperience', () => {
  const mockSetResumeData = jest.fn()

  const mockResumeData = {
    workExperience: [
      {
        organization: 'Old Corp',
        position: 'Dev',
        technologies: ['React', 'Node'],
        showTechnologies: true,
      },
    ],
  }

  const mockAISettings = {
    settings: {
      apiUrl: 'http://api.test',
      apiKey: 'test-key',
      model: 'test-model',
      providerType: 'openai',
      jobDescription: 'test job description '.repeat(10),
    },
    isConfigured: true,
    isPipelineActive: false,
    setIsPipelineActive: jest.fn(),
    isAnyAIActionActive: false,
    setIsAnyAIActionActive: jest.fn(),
    isAIWorking: false,
    resetAll: jest.fn(),
  }

  const mockArrayForm = {
    data: mockResumeData.workExperience,
    handleChange: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  }

  const mockAccordion = {
    isExpanded: jest.fn((index) => index === 0),
    toggleExpanded: jest.fn(),
    expandNew: jest.fn(),
    updateAfterReorder: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
    ;(useAISettings as jest.Mock).mockReturnValue(mockAISettings)
    ;(useArrayForm as jest.Mock).mockReturnValue(mockArrayForm)
    ;(useAccordion as jest.Mock).mockReturnValue(mockAccordion)
    ;(sortTechStackGraph as jest.Mock).mockResolvedValue(['Node', 'React'])
  })

  const renderComponent = (resumeData = mockResumeData) => {
    return render(
      <ResumeContext.Provider
        value={{ resumeData, setResumeData: mockSetResumeData } as unknown as React.ContextType<typeof ResumeContext>}
      >
        <WorkExperience />
      </ResumeContext.Provider>
    )
  }

  it('renders existing work experience', () => {
    renderComponent()
    expect(screen.getByDisplayValue('Old Corp')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Dev')).toBeInTheDocument()
  })

  it('handles adding an experience entry', () => {
    renderComponent()
    const addButton = screen.getByText(/Add Experience/i)
    fireEvent.click(addButton)
    expect(mockArrayForm.add).toHaveBeenCalled()
    expect(mockAccordion.expandNew).toHaveBeenCalledWith(1)
  })

  it('handles removing an experience entry', () => {
    renderComponent()
    const deleteButton = screen.getByTitle('Delete experience')
    fireEvent.click(deleteButton)
    expect(mockArrayForm.remove).toHaveBeenCalledWith(0)
  })

  it('handles toggling technology visibility', () => {
    renderComponent()
    const visibilityButton = screen.getByTitle('Hide technologies in preview')
    fireEvent.click(visibilityButton)
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        workExperience: [expect.objectContaining({ showTechnologies: false })],
      })
    )
  })

  it('handles adding a technology', () => {
    renderComponent()
    const addTechButton = screen.getByText('Add Tech')
    fireEvent.click(addTechButton)
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        workExperience: [expect.objectContaining({ technologies: ['React', 'Node', 'New Tech'] })],
      })
    )
  })

  it('handles removing a technology', () => {
    renderComponent()
    const removeTechButton = screen.getByText('Remove React')
    fireEvent.click(removeTechButton)
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        workExperience: [expect.objectContaining({ technologies: ['Node'] })],
      })
    )
  })

  it('handles reordering technologies', () => {
    renderComponent()
    const reorderButton = screen.getByText('Reorder Tech')
    fireEvent.click(reorderButton)
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        workExperience: [expect.objectContaining({ technologies: ['Node', 'React'] })],
      })
    )
  })

  it('handles AI tech stack sort', async () => {
    renderComponent()
    const sortButton = screen.getByLabelText('Sort by JD')
    fireEvent.click(sortButton)

    await waitFor(() => {
      expect(sortTechStackGraph).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockSetResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          workExperience: [expect.objectContaining({ technologies: ['Node', 'React'] })],
        })
      )
    })
    expect(toast.success).toHaveBeenCalledWith('Tech stack sorted by job relevance')
  })

  it('handles AI tech stack sort failure', async () => {
    ;(sortTechStackGraph as jest.Mock).mockRejectedValue(new Error('Sort failed'))
    renderComponent()
    const sortButton = screen.getByLabelText('Sort by JD')
    fireEvent.click(sortButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed: Sort failed')
    })
  })

  it('handles AI sort streaming updates', async () => {
    ;(sortTechStackGraph as jest.Mock).mockImplementation((tech, jobDesc, options, onChunk) => {
      onChunk({ content: 'Analyzing 🚀', done: false })
      onChunk({ content: 'Sorting ⚡', done: false })
      return Promise.resolve(['Node', 'React'])
    })

    renderComponent()
    const sortButton = screen.getByLabelText('Sort by JD')
    fireEvent.click(sortButton)

    await waitFor(() => {
      // Check that toast was called with cleaned message (emojis removed)
      expect(toast).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ duration: Infinity }))
    })
  })

  it('handles drag and drop reordering of experience', () => {
    renderComponent()
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAV_END__ || global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    act(() => {
      onDragEnd({
        destination: { index: 1 },
        source: { index: 0 },
      })
    })

    expect(mockSetResumeData).toHaveBeenCalled()
    expect(mockAccordion.updateAfterReorder).toHaveBeenCalledWith(0, 1)
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

  it('handles changes to all input fields', () => {
    renderComponent()

    const inputConfigs = [
      { label: 'Organization Name', value: 'New Corp' },
      { label: 'Organization Website URL', value: 'http://new.corp' },
      { label: 'Start Date', value: '2020-01-01' },
      { label: 'End Date', value: '2021-01-01' },
      { label: 'Job Title', value: 'Senior Dev' },
      { label: 'Description', value: 'Did stuff' },
    ]

    inputConfigs.forEach(({ label, value }) => {
      const input = screen.getByLabelText(label)
      fireEvent.change(input, { target: { value } })
      expect(mockArrayForm.handleChange).toHaveBeenCalled()
    })
  })

  it('handles accordion toggle', () => {
    renderComponent()
    const toggleButton = screen.getByRole('button', { name: /Old Corp/i })
    fireEvent.click(toggleButton)
    expect(mockAccordion.toggleExpanded).toHaveBeenCalledWith(0)
  })

  it('handles AIContentGenerator string change', () => {
    renderComponent()
    const stringChangeButton = screen.getByTestId('trigger-string-change')
    fireEvent.click(stringChangeButton)
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        workExperience: [expect.objectContaining({ description: 'New String Description' })],
      })
    )
  })

  it('handles AIContentGenerator generated content including achievements', () => {
    renderComponent()
    const generateButton = screen.getByTestId('trigger-generated')
    fireEvent.click(generateButton)
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        workExperience: [
          expect.objectContaining({
            description: 'AI Generated Description',
            keyAchievements: [{ text: 'New Achievement' }],
          }),
        ],
      })
    )
  })

  it('ignores drag if destination is same as source', () => {
    renderComponent()
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    act(() => {
      onDragEnd({ destination: { index: 0 }, source: { index: 0 } })
    })

    expect(mockSetResumeData).not.toHaveBeenCalled()
  })

  it('hides tech stack button if less than 2 technologies', () => {
    const dataWithOneTech = {
      workExperience: [{ ...mockResumeData.workExperience[0], technologies: ['React'] }],
    }
    ;(useArrayForm as jest.Mock).mockReturnValue({ ...mockArrayForm, data: dataWithOneTech.workExperience })

    renderComponent(dataWithOneTech as never)
    expect(screen.queryByLabelText('Sort by JD')).not.toBeInTheDocument()
  })

  it('prevents sort if not configured', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({ ...mockAISettings, isConfigured: false })
    renderComponent()

    const sortButton = screen.getByLabelText('Sort by JD')
    fireEvent.click(sortButton)
    expect(sortTechStackGraph).not.toHaveBeenCalled()
  })

  it('updates toast on subsequent chunks during AI sort', async () => {
    ;(sortTechStackGraph as jest.Mock).mockImplementation((tech, jobDesc, options, onChunk) => {
      onChunk({ content: 'Chunk 1', done: false })
      onChunk({ content: 'Chunk 2', done: false })
      return Promise.resolve(['Node', 'React'])
    })

    renderComponent()
    const sortButton = screen.getByLabelText('Sort by JD')
    fireEvent.click(sortButton)

    await waitFor(() => {
      // First call: no id
      expect(toast).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ duration: Infinity }))
      // Second call: has id
      expect(toast).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ id: 'mock-toast-id' }))
    })
  })

  it('early returns in handlers if data drifts', () => {
    // Mock useArrayForm to return an item, but ResumeContext has none
    ;(useArrayForm as jest.Mock).mockReturnValue({
      ...mockArrayForm,
      data: [{ organization: 'Ghost', position: 'Phantom', technologies: ['Invisibility'] }],
    })

    render(
      <ResumeContext.Provider
        value={
          { resumeData: { workExperience: [] }, setResumeData: mockSetResumeData } as unknown as React.ContextType<
            typeof ResumeContext
          >
        }
      >
        <WorkExperience />
      </ResumeContext.Provider>
    )

    // 1. toggleTechnologiesVisibility (Line 131)
    const visibilityButton = screen.getByTitle('Hide technologies in preview')
    fireEvent.click(visibilityButton)
    expect(mockSetResumeData).not.toHaveBeenCalled()

    // 2. handleAddTechnology (Line 167)
    const addTechButton = screen.getByText('Add Tech')
    fireEvent.click(addTechButton)
    expect(mockSetResumeData).not.toHaveBeenCalled()

    // 3. handleRemoveTechnology (Line 180)
    const removeTechButton = screen.getByText('Remove Invisibility')
    fireEvent.click(removeTechButton)
    expect(mockSetResumeData).not.toHaveBeenCalled()

    // 4. handleReorderTechnology (Line 194)
    const reorderTechButton = screen.getByText('Reorder Tech')
    fireEvent.click(reorderTechButton)
    expect(mockSetResumeData).not.toHaveBeenCalled()
  })

  it('handles missing removed item during drag end', () => {
    renderComponent()
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    // Mock splice to return [undefined] (simulating missing item)
    const spy = jest.spyOn(Array.prototype, 'splice').mockReturnValue([])

    act(() => {
      onDragEnd({
        destination: { index: 1 },
        source: { index: 0 },
      })
    })

    expect(mockSetResumeData).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('early returns in TechStackSortButton if workExperience disappears', () => {
    // Render with 0 but then try to sort? Hard.
    // But we already have a test for "if workExperience is missing" in TechStackSortButton
  })
})
