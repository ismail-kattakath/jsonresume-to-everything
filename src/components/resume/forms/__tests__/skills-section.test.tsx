import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SkillsSection } from '@/components/resume/forms/skills-section'
import { ResumeContext } from '@/lib/contexts/document-context'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { useSkillGroupsManagement } from '@/hooks/use-skill-groups-management'
import { useAccordion } from '@/hooks/use-accordion'
import * as aiAgent from '@/lib/ai/strands/agent'

jest.mock('@/lib/contexts/ai-settings-context')
jest.mock('@/hooks/use-skill-groups-management')
jest.mock('@/hooks/use-accordion')
jest.mock('@/lib/ai/strands/agent')
jest.mock('sonner', () => ({
  toast: Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn(), dismiss: jest.fn(), loading: jest.fn() }),
}))

jest.mock('@/components/ui/drag-and-drop', () => ({
  DnDContext: ({ children, onDragEnd }: any) => (
    <div data-testid="dnd" onClick={() => onDragEnd({ destination: { index: 1 }, source: { index: 0 } })}>
      {children}
    </div>
  ),
  DnDDroppable: ({ children }: any) => children({ innerRef: jest.fn(), droppableProps: {} }),
  DnDDraggable: ({ children }: any) =>
    children({ innerRef: jest.fn(), draggableProps: {}, dragHandleProps: {} }, { isDragging: false }),
}))

jest.mock('@/components/ui/accordion-card', () => ({
  AccordionCard: ({ children, header }: any) => (
    <div>
      {header}
      {children}
    </div>
  ),
}))

jest.mock('../skill-group-header', () => ({
  SkillGroupHeader: ({ title, onToggle, onRename, onDelete }: any) => (
    <div>
      <span>{title}</span>
      <button onClick={onToggle}>Toggle</button>
      <button onClick={() => onRename('N')}>Rename</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}))

jest.mock('../skill', () => ({ __esModule: true, default: ({ title }: any) => <div>{title} skills</div> }))
jest.mock('@/components/ui/ai-action-button', () => ({
  __esModule: true,
  default: ({ onClick, label }: any) => <button onClick={onClick}>{label}</button>,
}))
jest.mock('@/components/document-builder/shared-forms/ai-content-generator', () => ({
  __esModule: true,
  default: ({ onChange }: any) => <input data-testid="gen-in" onChange={(e) => onChange(e.target.value)} />,
}))

describe('SkillsSection', () => {
  const mockSetResumeData = jest.fn()
  const mockResumeData = {
    skills: [
      { title: 'A', skills: [{ text: 'a1' }] },
      { title: 'B', skills: [{ text: 'b1' }] },
    ],
  }

  const mockAISettings = {
    settings: { providerType: 'openai', jobDescription: 'jd', skillsToHighlight: '' },
    updateSettings: jest.fn(),
    isConfigured: true,
    isAnyAIActionActive: false,
    setIsAnyAIActionActive: jest.fn(),
  }

  const mockGroups = { addGroup: jest.fn(), removeGroup: jest.fn(), renameGroup: jest.fn(), reorderGroups: jest.fn() }
  const mockAccordion = {
    isExpanded: jest.fn(() => true),
    toggleExpanded: jest.fn(),
    expandNew: jest.fn(),
    updateAfterReorder: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAISettings as jest.Mock).mockReturnValue(mockAISettings)
    ;(useSkillGroupsManagement as jest.Mock).mockReturnValue(mockGroups)
    ;(useAccordion as jest.Mock).mockReturnValue(mockAccordion)
    ;(aiAgent.sortSkillsGraph as jest.Mock).mockResolvedValue({ groupOrder: ['B'], skillOrder: { B: [] } })
  })

  it('handles all interactions and branches', async () => {
    render(
      <ResumeContext.Provider value={{ resumeData: mockResumeData, setResumeData: mockSetResumeData } as any}>
        <SkillsSection />
      </ResumeContext.Provider>
    )

    fireEvent.click(screen.getByTestId('dnd'))
    expect(mockGroups.reorderGroups).toHaveBeenCalledWith(0, 1)

    fireEvent.click(screen.getByText('Add Skill Group'))
    const input = await screen.findByPlaceholderText(/e.g., Frontend/i)

    // Cancel action
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByPlaceholderText(/e.g., Frontend/i)).not.toBeInTheDocument()

    // KeyDown Enter
    fireEvent.click(screen.getByText('Add Skill Group'))
    const input2 = await screen.findByPlaceholderText(/e.g., Frontend/i)
    fireEvent.change(input2, { target: { value: 'New' } })
    fireEvent.keyDown(input2, { key: 'Enter' })
    expect(mockGroups.addGroup).toHaveBeenCalledWith('New')

    // AI Sort
    fireEvent.click(screen.getByText('Sort by JD'))
    await waitFor(() => expect(mockSetResumeData).toHaveBeenCalled())
  })
})
