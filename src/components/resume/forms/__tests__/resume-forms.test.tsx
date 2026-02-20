import { render, screen, fireEvent } from '@testing-library/react'
import WorkExperience from '@/components/resume/forms/work-experience'
import { ResumeContext } from '@/lib/contexts/document-context'

// Mock Hooks
jest.mock('@/lib/contexts/ai-settings-context', () => ({
  useAISettings: () => ({
    settings: {},
    updateSettings: jest.fn(),
    isConfigured: true,
  }),
}))
jest.mock('@/hooks/use-array-form', () => ({
  useArrayForm: () => ({
    data: [{ organization: 'Test Org' }],
    handleChange: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  }),
}))
jest.mock('@/hooks/use-accordion', () => ({
  useAccordion: () => ({
    isExpanded: () => true,
    toggleExpanded: jest.fn(),
    expandNew: jest.fn(),
    updateAfterReorder: jest.fn(),
  }),
}))

// Mock drag and drop since it's hard to test directly
jest.mock('@/components/ui/drag-and-drop', () => ({
  DnDContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DnDDroppable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
    children({ droppableProps: {}, innerRef: jest.fn(), placeholder: null }),
  DnDDraggable: ({ children }: { children: (provided: unknown, snapshot: unknown) => React.ReactNode }) =>
    children({ dragHandleProps: {}, draggableProps: {}, innerRef: jest.fn() }, { isDragging: false }),
}))

jest.mock('../key-achievements', () => ({
  __esModule: true,
  default: () => <div>Mocked Key Achievements</div>,
}))

const mockResumeData = {
  workExperience: [
    {
      organization: 'Test Org',
      url: '',
      position: '',
      startYear: '',
      endYear: '',
      description: '',
      keyAchievements: [],
      technologies: [],
    },
  ],
} as never

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResumeContext.Provider value={{ resumeData: mockResumeData, setResumeData: jest.fn() } as never}>
      {children}
    </ResumeContext.Provider>
  )
}

describe('WorkExperience', () => {
  it('renders correctly', () => {
    render(
      <Wrapper>
        <WorkExperience />
      </Wrapper>
    )
    expect(screen.getByText('Add Experience')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Org')).toBeInTheDocument()
  })
})
