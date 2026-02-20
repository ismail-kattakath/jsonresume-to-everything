import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KeyAchievements from '@/components/resume/forms/key-achievements'
import { useKeyAchievementsForm } from '@/hooks/use-key-achievements-form'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { ResumeContext } from '@/lib/contexts/document-context'
import { sortAchievementsGraph } from '@/lib/ai/strands/agent'
import { toast } from 'sonner'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { DropResult } from '@hello-pangea/dnd'
import { DnDContext } from '@/components/ui/drag-and-drop'

// Mock dependencies
jest.mock('@/hooks/use-key-achievements-form')
jest.mock('@/lib/contexts/ai-settings-context')
jest.mock('@/lib/ai/strands/agent')
jest.mock('sonner', () => ({
  toast: Object.assign(
    jest.fn(() => 'mock-toast-id'),
    {
      success: jest.fn(),
      error: jest.fn(),
      dismiss: jest.fn(),
      loading: jest.fn(() => 'mock-toast-id'),
    }
  ),
}))

// Mock DnD components to just render children
jest.mock('@/components/ui/drag-and-drop', () => ({
  DnDContext: jest.fn(({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (res: unknown) => void }) => (
    <div data-testid="dnd-context" onClick={() => onDragEnd({ destination: { index: 1 }, source: { index: 0 } })}>
      {children}
    </div>
  )),
  DnDDroppable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
    children({ innerRef: jest.fn(), droppableProps: {}, placeholder: null }),
  DnDDraggable: ({ children }: { children: (provided: unknown, snapshot: unknown) => React.ReactNode }) =>
    children({ innerRef: jest.fn(), draggableProps: {}, dragHandleProps: {} }, { isDragging: false }),
}))

// Mock AIActionButton
jest.mock('@/components/ui/ai-action-button', () => ({
  __esModule: true,
  default: ({ onClick, isLoading, label }: { onClick: () => void; isLoading: boolean; label: string }) => (
    <button data-testid="ai-action-button" onClick={onClick} disabled={isLoading}>
      {label}
    </button>
  ),
}))

// Mock AILoadingToast
jest.mock('@/components/ui/ai-loading-toast', () => ({
  AILoadingToast: () => <div data-testid="ai-loading-toast" />,
}))

describe('KeyAchievements Component', () => {
  const mockAchievements = [{ text: 'First achievement' }, { text: 'Second achievement' }]

  const mockUseKeyAchievementsForm = {
    achievements: mockAchievements,
    add: jest.fn(),
    remove: jest.fn(),
    handleChange: jest.fn(),
    reorder: jest.fn(),
    setAchievements: jest.fn(),
  }

  const mockUseAISettings = {
    isConfigured: true,
    settings: {
      jobDescription: 'Software Engineer',
      apiUrl: 'https://api.test',
      apiKey: 'test-key',
      model: 'test-model',
      providerType: 'openai',
    },
  }

  const mockResumeData = {
    name: 'Test',
    position: 'Dev',
    email: '',
    workExperience: [
      {
        position: 'Developer',
        organization: 'Tech Inc',
        keyAchievements: mockAchievements,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useKeyAchievementsForm as jest.Mock).mockReturnValue(mockUseKeyAchievementsForm)
    ;(useAISettings as jest.Mock).mockReturnValue(mockUseAISettings)
  })

  const renderComponent = (props = { workExperienceIndex: 0 }) => {
    return render(
      <ResumeContext.Provider
        value={
          { resumeData: mockResumeData, setResumeData: jest.fn() } as unknown as React.ContextType<typeof ResumeContext>
        }
      >
        <KeyAchievements {...props} />
      </ResumeContext.Provider>
    )
  }

  it('renders achievements correctly', () => {
    renderComponent()
    expect(screen.getByText('First achievement')).toBeInTheDocument()
    expect(screen.getByText('Second achievement')).toBeInTheDocument()
  })

  it('adds a new achievement on Enter key', async () => {
    renderComponent()
    const input = screen.getByPlaceholderText(/Add key achievement/i)

    await userEvent.type(input, 'New achievement')
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(mockUseKeyAchievementsForm.add).toHaveBeenCalledWith('New achievement')
  })

  it('does not add achievement if input is empty and Enter is pressed', () => {
    renderComponent()
    const input = screen.getByPlaceholderText(/Add key achievement/i)
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(mockUseKeyAchievementsForm.add).not.toHaveBeenCalled()
  })

  it('does not add achievement on other key presses', async () => {
    renderComponent()
    const input = screen.getByPlaceholderText(/Add key achievement/i)
    await userEvent.type(input, 'Something')
    fireEvent.keyDown(input, { key: 'A', code: 'KeyA' })
    expect(mockUseKeyAchievementsForm.add).not.toHaveBeenCalled()
  })

  it('starts editing when an achievement text is clicked', async () => {
    renderComponent()
    const firstItem = screen.getByText('First achievement')
    await userEvent.click(firstItem)

    // It should turn into an input
    const editInput = screen.getByDisplayValue('First achievement')
    expect(editInput).toBeInTheDocument()
  })

  it('saves edits on Enter key', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('First achievement'))

    const editInput = screen.getByDisplayValue('First achievement')
    await userEvent.clear(editInput)
    await userEvent.type(editInput, 'Updated achievement')

    fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' })

    expect(mockUseKeyAchievementsForm.handleChange).toHaveBeenCalledWith(0, 'Updated achievement')
  })

  it('does not save edits if empty on Enter key', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('First achievement'))
    const editInput = screen.getByDisplayValue('First achievement')
    await userEvent.clear(editInput)
    fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' })

    expect(mockUseKeyAchievementsForm.handleChange).not.toHaveBeenCalled()
  })

  it('cancels editing on Escape key', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('First achievement'))

    const editInput = screen.getByDisplayValue('First achievement')
    fireEvent.keyDown(editInput, { key: 'Escape', code: 'Escape' })

    // Should revert back to text
    expect(screen.queryByDisplayValue('First achievement')).not.toBeInTheDocument()
    expect(screen.getByText('First achievement')).toBeInTheDocument()
    expect(mockUseKeyAchievementsForm.handleChange).not.toHaveBeenCalled()
  })

  it('saves edits on blur if value changed', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('First achievement'))

    const editInput = screen.getByDisplayValue('First achievement')
    await userEvent.clear(editInput)
    await userEvent.type(editInput, 'Blurred update')

    fireEvent.blur(editInput)

    expect(mockUseKeyAchievementsForm.handleChange).toHaveBeenCalledWith(0, 'Blurred update')
  })

  it('does not save edits on blur if value is unchanged', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('First achievement'))

    const editInput = screen.getByDisplayValue('First achievement')
    fireEvent.blur(editInput)

    expect(mockUseKeyAchievementsForm.handleChange).not.toHaveBeenCalled()
  })

  it('does not save edits on blur if value is empty', async () => {
    renderComponent()
    await userEvent.click(screen.getByText('First achievement'))

    const editInput = screen.getByDisplayValue('First achievement')
    await userEvent.clear(editInput)
    fireEvent.blur(editInput)

    expect(mockUseKeyAchievementsForm.handleChange).not.toHaveBeenCalled()
  })

  it('removes achievement on button click', async () => {
    renderComponent()
    const removeButtons = screen.getAllByTitle('Remove achievement')
    await userEvent.click(removeButtons[0] as Element)

    expect(mockUseKeyAchievementsForm.remove).toHaveBeenCalledWith(0)
  })

  it('reorders achievements on drag end', async () => {
    renderComponent()
    const dndContext = screen.getByTestId('dnd-context')
    // Our mock executes onDragEnd(0 -> 1) on click
    await userEvent.click(dndContext)

    expect(mockUseKeyAchievementsForm.reorder).toHaveBeenCalledWith(0, 1)
  })

  describe('AI Sorting', () => {
    it('shows sort button if there are 2+ achievements', () => {
      renderComponent()
      expect(screen.getByTestId('ai-action-button')).toBeInTheDocument()
    })

    it('hides sort button if there are <2 achievements', () => {
      ;(useKeyAchievementsForm as jest.Mock).mockReturnValue({
        ...mockUseKeyAchievementsForm,
        achievements: [{ text: 'Only one' }],
      })
      renderComponent()
      expect(screen.queryByTestId('ai-action-button')).not.toBeInTheDocument()
    })

    it('handles successful AI sorting', async () => {
      ;(sortAchievementsGraph as jest.Mock).mockImplementation(async (texts, pos, org, jd, auth, onChunk) => {
        onChunk({ content: 'Sorting...' })
        return { rankedIndices: [1, 0] }
      })

      renderComponent()
      const sortBtn = screen.getByTestId('ai-action-button')
      await userEvent.click(sortBtn)

      await waitFor(() => {
        expect(sortAchievementsGraph).toHaveBeenCalled()
      })

      expect(mockUseKeyAchievementsForm.setAchievements).toHaveBeenCalledWith([
        { text: 'Second achievement' },
        { text: 'First achievement' },
      ])
      expect(toast.success).toHaveBeenCalledWith('Achievements sorted by job relevance')
      expect(toast.dismiss).toHaveBeenCalled() // called after toast loading
    })

    it('handles AI sorting failure', async () => {
      ;(sortAchievementsGraph as jest.Mock).mockRejectedValue(new Error('API failed'))

      renderComponent()
      const sortBtn = screen.getByTestId('ai-action-button')
      await userEvent.click(sortBtn)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('API failed')
      })
      expect(mockUseKeyAchievementsForm.setAchievements).not.toHaveBeenCalled()
    })

    it('handles AI sorting failure with non-Error object', async () => {
      ;(sortAchievementsGraph as jest.Mock).mockRejectedValue('API failed string')

      renderComponent()
      const sortBtn = screen.getByTestId('ai-action-button')
      await userEvent.click(sortBtn)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to sort achievements')
      })
    })

    it('does not sort if not configured', async () => {
      ;(useAISettings as jest.Mock).mockReturnValue({ ...mockUseAISettings, isConfigured: false })
      renderComponent()
      const sortBtn = screen.getByTestId('ai-action-button')
      await userEvent.click(sortBtn)

      expect(sortAchievementsGraph).not.toHaveBeenCalled()
    })

    it('does not sort if work experience is missing from context', async () => {
      const Wrapper = () => (
        <ResumeContext.Provider
          value={
            { resumeData: { workExperience: [] }, setResumeData: jest.fn() } as unknown as React.ContextType<
              typeof ResumeContext
            >
          }
        >
          <KeyAchievements workExperienceIndex={0} />
        </ResumeContext.Provider>
      )
      render(<Wrapper />)
      const sortBtn = screen.getByTestId('ai-action-button')
      await userEvent.click(sortBtn)

      expect(sortAchievementsGraph).not.toHaveBeenCalled()
    })
  })

  // Edge cases for Drag and Drop from KeyAchievements logic
  it('does not reorder if dropped outside (no destination)', () => {
    render(<KeyAchievements workExperienceIndex={0} />)
    const calls = (DnDContext as jest.Mock).mock.calls
    const { onDragEnd } = calls[calls.length - 1][0]
    onDragEnd({ source: { index: 0 }, destination: null })
    expect(mockUseKeyAchievementsForm.reorder).not.toHaveBeenCalled()
  })

  it('does not reorder if dropped in same position', () => {
    render(<KeyAchievements workExperienceIndex={0} />)
    const calls = (DnDContext as jest.Mock).mock.calls
    const { onDragEnd } = calls[calls.length - 1][0]
    onDragEnd({ source: { index: 0 }, destination: { index: 0 } })
    expect(mockUseKeyAchievementsForm.reorder).not.toHaveBeenCalled()
  })
})
