import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { SkillsSection } from '@/components/resume/forms/skills-section'
import { ResumeContext } from '@/lib/contexts/document-context'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { useSkillGroupsManagement } from '@/hooks/use-skill-groups-management'
import { useAccordion } from '@/hooks/use-accordion'
import { sortSkillsGraph, extractSkillsGraph } from '@/lib/ai/strands/agent'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/lib/contexts/ai-settings-context')
jest.mock('@/hooks/use-skill-groups-management')
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

// Mock child components to simplify testing SkillsSection logic
jest.mock('../skill-group-header', () => ({
  SkillGroupHeader: ({
    title,
    onToggle,
    onRename,
    onDelete,
  }: {
    title: string
    onToggle: () => void
    onRename: (s: string) => void
    onDelete: () => void
  }) => (
    <div data-testid="skill-group-header">
      <span>{title}</span>
      <button onClick={onToggle}>Toggle</button>
      <button onClick={() => onRename('New Title')}>Rename</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}))

jest.mock('../skill', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div data-testid="skill-list">{title} skills</div>,
}))

jest.mock('@/components/ui/ai-action-button', () => ({
  __esModule: true,
  default: ({
    onClick,
    label,
    isConfigured,
    title,
  }: {
    onClick: () => void
    label: string
    isConfigured: boolean
    title: string
  }) => (
    <button onClick={onClick} aria-label={label} title={title}>
      {label}
    </button>
  ),
}))

jest.mock('@/components/ui/form-textarea', () => ({
  FormTextarea: ({
    label,
    onAIAction,
    value,
    onChange,
  }: {
    label: string
    onAIAction: () => void
    value: string
    onChange: () => void
  }) => (
    <div>
      <label htmlFor="textarea">{label}</label>
      <textarea id="textarea" value={value} onChange={onChange} aria-label={label} />
      <button onClick={onAIAction} aria-label="Extract skills from JD">
        Extract
      </button>
    </div>
  ),
}))

// Mock DragAndDrop since it's already mocked in jest.setup.js but we want locally controlled mocks if needed
// Actually, jest.setup.js mock should suffice, but let's ensure it doesn't interfere.

describe('SkillsSection', () => {
  const mockSetResumeData = jest.fn()
  const mockUpdateSettings = jest.fn()

  const mockResumeData = {
    skills: [
      { title: 'Frontend', skills: [{ text: 'React', highlight: false }] },
      { title: 'Backend', skills: [{ text: 'Node', highlight: false }] },
    ],
  }

  const mockAISettings = {
    settings: {
      apiUrl: 'http://api.test',
      apiKey: 'test-key',
      model: 'test-model',
      providerType: 'openai',
      jobDescription: 'test job description '.repeat(10), // > 50 chars
      skillsToHighlight: '',
    },
    updateSettings: mockUpdateSettings,
    isConfigured: true,
    isPipelineActive: false,
    setIsPipelineActive: jest.fn(),
    isAnyAIActionActive: false,
    setIsAnyAIActionActive: jest.fn(),
    isAIWorking: false,
    resetAll: jest.fn(),
  }

  const mockGroupsManagement = {
    addGroup: jest.fn(),
    removeGroup: jest.fn(),
    renameGroup: jest.fn(),
    reorderGroups: jest.fn(),
  }

  const mockAccordion = {
    isExpanded: jest.fn((index) => index === 0),
    toggleExpanded: jest.fn(),
    expandNew: jest.fn(),
    updateAfterReorder: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAISettings as jest.Mock).mockReturnValue(mockAISettings)
    ;(useSkillGroupsManagement as jest.Mock).mockReturnValue(mockGroupsManagement)
    ;(useAccordion as jest.Mock).mockReturnValue(mockAccordion)
    ;(sortSkillsGraph as jest.Mock).mockResolvedValue({
      groupOrder: ['Backend', 'Frontend'],
      skillOrder: { Backend: ['Node'], Frontend: ['React'] },
    })
    ;(extractSkillsGraph as jest.Mock).mockResolvedValue('Extracted Skill')
  })

  const renderComponent = (resumeData = mockResumeData) => {
    return render(
      <ResumeContext.Provider value={{ resumeData, setResumeData: mockSetResumeData } as never}>
        <SkillsSection />
      </ResumeContext.Provider>
    )
  }

  it('renders existing skill groups', () => {
    renderComponent()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getAllByTestId('skill-list')).toHaveLength(2)
  })

  it('handles adding a new group', () => {
    renderComponent()

    const addButton = screen.getByLabelText('Add Skill Group')
    fireEvent.click(addButton)

    const input = screen.getByPlaceholderText(/e.g., Frontend, Backend, DevOps.../i)
    fireEvent.change(input, { target: { value: 'DevOps' } })

    const createButton = screen.getByText('Create')
    fireEvent.click(createButton)

    expect(mockGroupsManagement.addGroup).toHaveBeenCalledWith('DevOps')
    expect(mockAccordion.expandNew).toHaveBeenCalledWith(2)
  })

  it('closes add group input on Escape', () => {
    renderComponent()

    fireEvent.click(screen.getByLabelText('Add Skill Group'))
    const input = screen.getByPlaceholderText(/e.g., Frontend, Backend, DevOps.../i)

    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })

    expect(screen.queryByPlaceholderText(/e.g., Frontend, Backend, DevOps.../i)).not.toBeInTheDocument()
  })

  it('handles AI sort', async () => {
    renderComponent()

    const sortButton = screen.getByText('Sort by JD')
    fireEvent.click(sortButton)

    await waitFor(() => {
      expect(sortSkillsGraph).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockSetResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: [expect.objectContaining({ title: 'Backend' }), expect.objectContaining({ title: 'Frontend' })],
        })
      )
    })

    expect(toast.success).toHaveBeenCalledWith('Skills optimized and sorted by job relevance!')
  })

  it('handles AI skill extraction', async () => {
    renderComponent()

    const extractButton = screen.getByLabelText('Extract skills from JD')
    fireEvent.click(extractButton)

    await waitFor(() => {
      expect(extractSkillsGraph).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({ skillsToHighlight: 'Extracted Skill' })
    })

    expect(toast.success).toHaveBeenCalledWith('Skills extracted and aligned with your resume!')
  })

  it('shows error when job description is too short for extraction', async () => {
    ;(useAISettings as jest.Mock).mockReturnValue({
      ...mockAISettings,
      settings: { ...mockAISettings.settings, jobDescription: 'too short' },
    })

    renderComponent()

    const extractButton = screen.getByLabelText('Extract skills from JD')
    fireEvent.click(extractButton)

    expect(toast.error).toHaveBeenCalledWith('Job description too short', expect.any(Object))
    expect(extractSkillsGraph).not.toHaveBeenCalled()
  })

  it('handles AI sort with streaming updates', async () => {
    ;(sortSkillsGraph as jest.Mock).mockImplementation((skills, jobDesc, options, onChunk) => {
      onChunk({ content: 'Analyzing...', done: false })
      onChunk({ content: 'Sorting...', done: false })
      return Promise.resolve({
        groupOrder: ['Backend', 'Frontend'],
        skillOrder: { Backend: ['Node'], Frontend: ['React'] },
      })
    })

    renderComponent()

    fireEvent.click(screen.getByText('Sort by JD'))

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ duration: Infinity }))
    })

    await waitFor(() => {
      expect(mockSetResumeData).toHaveBeenCalled()
    })

    expect(toast.success).toHaveBeenCalledWith('Skills optimized and sorted by job relevance!')
  })

  it('handles AI skill extraction with streaming and error', async () => {
    ;(extractSkillsGraph as jest.Mock).mockImplementation((jobDesc, options, onChunk) => {
      onChunk({ content: 'Extracting...', done: false })
      return Promise.reject(new Error('Extraction failed'))
    })

    renderComponent()

    const extractButton = screen.getByLabelText('Extract skills from JD')
    fireEvent.click(extractButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed: Extraction failed')
    })
  })

  it('handles AI sort with missing group/skill indices', async () => {
    // This triggers the index === -1 branches
    ;(sortSkillsGraph as jest.Mock).mockResolvedValue({
      groupOrder: ['Backend'], // Only Backend, Frontend will be index -1
      skillOrder: { Backend: ['Node'] },
    })

    renderComponent()

    fireEvent.click(screen.getByText('Sort by JD'))

    await waitFor(() => {
      expect(mockSetResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: [expect.objectContaining({ title: 'Backend' }), expect.objectContaining({ title: 'Frontend' })],
        })
      )
    })
  })

  it('handles AI sort failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(sortSkillsGraph as jest.Mock).mockRejectedValue(new Error('Sort failed'))

    renderComponent()

    fireEvent.click(screen.getByText('Sort by JD'))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('AI Skills sort error:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('handles group toggle, rename, and delete', () => {
    renderComponent()

    const toggleButtons = screen.getAllByText('Toggle')
    fireEvent.click(toggleButtons[0]!)
    expect(mockAccordion.toggleExpanded).toHaveBeenCalledWith(0)

    const renameButtons = screen.getAllByText('Rename')
    fireEvent.click(renameButtons[0]!)
    expect(mockGroupsManagement.renameGroup).toHaveBeenCalledWith('Frontend', 'New Title')

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0]!)
    expect(mockGroupsManagement.removeGroup).toHaveBeenCalledWith('Frontend')
  })

  it('handles cancel when adding a group', () => {
    renderComponent()

    fireEvent.click(screen.getByLabelText('Add Skill Group'))
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(screen.queryByPlaceholderText(/e.g., Frontend, Backend, DevOps.../i)).not.toBeInTheDocument()
  })

  it('handles Enter key to add group', () => {
    renderComponent()

    fireEvent.click(screen.getByLabelText('Add Skill Group'))
    const input = screen.getByPlaceholderText(/e.g., Frontend, Backend, DevOps.../i)
    fireEvent.change(input, { target: { value: 'New Group' } })

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(mockGroupsManagement.addGroup).toHaveBeenCalledWith('New Group')
  })

  it('does not add group if name is empty', () => {
    renderComponent()

    fireEvent.click(screen.getByLabelText('Add Skill Group'))
    const createButton = screen.getByText('Create')
    fireEvent.click(createButton)

    expect(mockGroupsManagement.addGroup).not.toHaveBeenCalled()
  })

  it('closes input on blur if empty', () => {
    renderComponent()

    fireEvent.click(screen.getByLabelText('Add Skill Group'))
    const input = screen.getByPlaceholderText(/e.g., Frontend, Backend, DevOps.../i)

    fireEvent.blur(input)

    expect(screen.queryByPlaceholderText(/e.g., Frontend, Backend, DevOps.../i)).not.toBeInTheDocument()
  })

  it('handles drag and drop reordering', () => {
    renderComponent()

    // Access the onDragEnd function captured by the mock
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    act(() => {
      onDragEnd({
        destination: { index: 1 },
        source: { index: 0 },
      })
    })

    expect(mockGroupsManagement.reorderGroups).toHaveBeenCalledWith(0, 1)
    expect(mockAccordion.updateAfterReorder).toHaveBeenCalledWith(0, 1)
  })

  it('ignores drag if no destination', () => {
    renderComponent()
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    act(() => {
      onDragEnd({ destination: null, source: { index: 0 } })
    })

    expect(mockGroupsManagement.reorderGroups).not.toHaveBeenCalled()
  })

  it('ignores drag if source and destination are same', () => {
    renderComponent()
    // @ts-ignore
    const onDragEnd = global.__MOCKED_DND_CONTEXT_ON_DRAG_END__

    act(() => {
      onDragEnd({ destination: { index: 0 }, source: { index: 0 } })
    })

    expect(mockGroupsManagement.reorderGroups).not.toHaveBeenCalled()
  })

  it('handles AI sort with unknown groups/skills in result', async () => {
    ;(sortSkillsGraph as jest.Mock).mockResolvedValue({
      groupOrder: ['UnknownGroup'],
      skillOrder: { UnknownGroup: ['UnknownSkill'] },
    })

    renderComponent()

    fireEvent.click(screen.getByText('Sort by JD'))

    await waitFor(() => {
      expect(mockSetResumeData).toHaveBeenCalled()
    })

    // Verified that it doesn't crash and still updates data
  })

  it('calls updateSettings on skills to highlight change', () => {
    renderComponent()
    const textarea = screen.getByLabelText(/Skills to highlight/i)
    fireEvent.change(textarea, { target: { value: 'New Highlights' } })
    expect(mockUpdateSettings).toHaveBeenCalledWith({ skillsToHighlight: 'New Highlights' })
  })

  it('handles multiple streaming updates for AI sort', async () => {
    ;(sortSkillsGraph as jest.Mock).mockImplementation((skills, jobDesc, options, onChunk) => {
      onChunk({ content: 'Analyzing...', done: false })
      onChunk({ content: 'Sorting...', done: false })
      onChunk({ content: 'Finalizing...', done: false })
      return Promise.resolve({
        groupOrder: ['Backend', 'Frontend'],
        skillOrder: { Backend: ['Node'], Frontend: ['React'] },
      })
    })

    renderComponent()

    fireEvent.click(screen.getByText('Sort by JD'))

    await waitFor(() => {
      // First call
      expect(toast).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ duration: Infinity }))
      // Subsequent calls (updating)
      expect(toast).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ id: expect.any(String) }))
    })
  })

  it('handles complex skill sorting within groups', async () => {
    const complexResumeData = {
      skills: [
        {
          title: 'Frontend',
          skills: [
            { text: 'Vue', highlight: false },
            { text: 'React', highlight: false },
            { text: 'Angular', highlight: false },
          ],
        },
      ],
    }

    ;(sortSkillsGraph as jest.Mock).mockResolvedValue({
      groupOrder: ['Frontend'],
      skillOrder: {
        Frontend: ['React', 'Vue'], // Angular is missing from order
      },
    })

    renderComponent(complexResumeData)

    fireEvent.click(screen.getByText('Sort by JD'))

    await waitFor(() => {
      expect(mockSetResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: [
            expect.objectContaining({
              title: 'Frontend',
              skills: [
                expect.objectContaining({ text: 'React' }),
                expect.objectContaining({ text: 'Vue' }),
                expect.objectContaining({ text: 'Angular' }),
              ],
            }),
          ],
        })
      )
    })
  })

  it('handles extraction with multiple chunks', async () => {
    ;(extractSkillsGraph as jest.Mock).mockImplementation((jobDesc, options, onChunk) => {
      onChunk({ content: 'Step 1...', done: false })
      onChunk({ content: 'Step 2...', done: false })
      return Promise.resolve('Skill A, Skill B')
    })

    renderComponent()

    const extractButton = screen.getByLabelText('Extract skills from JD')
    fireEvent.click(extractButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ id: expect.any(String) }))
    })
  })

  it('prevents multiple concurrent sorts', () => {
    // First, make sort stay in progress
    ;(sortSkillsGraph as jest.Mock).mockReturnValue(new Promise(() => {}))

    renderComponent()

    fireEvent.click(screen.getByText('Sort by JD'))

    // Check that it's now in "Sorting..." state
    const sortingButton = screen.getByText('Sorting...')
    fireEvent.click(sortingButton)

    expect(sortSkillsGraph).toHaveBeenCalledTimes(1)
  })

  it('shows error if isConfigured is false in handleAISort', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({
      ...mockAISettings,
      isConfigured: false,
    })

    renderComponent()

    fireEvent.click(screen.getByText('Sort by JD'))

    expect(sortSkillsGraph).not.toHaveBeenCalled()
  })

  it('shows error if isConfigured is false in handleAIExtractSkills', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({
      ...mockAISettings,
      isConfigured: false,
    })

    renderComponent()

    const extractButton = screen.getByLabelText('Extract skills from JD')
    fireEvent.click(extractButton)

    expect(toast.error).toHaveBeenCalledWith('AI not configured', expect.any(Object))
  })

  it('returns null if no context', () => {
    const { container } = render(
      <ResumeContext.Provider value={null as never}>
        <SkillsSection />
      </ResumeContext.Provider>
    )
    expect(container.firstChild).toBeNull()
  })
})
