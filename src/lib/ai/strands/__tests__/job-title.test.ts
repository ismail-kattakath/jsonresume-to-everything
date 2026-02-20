import { generateJobTitleGraph } from '@/lib/ai/strands/jobTitleGraph'
import { AgentConfig } from '@/lib/ai/strands/types'
import { Agent } from '@strands-agents/sdk'
import type { ResumeData } from '@/types'

jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      invoke: jest.fn().mockImplementation((prompt: string) => {
        if (systemPrompt.includes('extracting the core role title')) {
          return Promise.resolve({ toString: () => 'Analysis: Senior AI Role' })
        } else if (systemPrompt.includes('professional resume writer creating a job title')) {
          if (prompt.includes('Refine')) {
            return Promise.resolve({
              toString: () => 'Senior AI Platform Engineer',
            })
          }
          return Promise.resolve({ toString: () => '**Senior AI Engineer**' }) // With markdown
        } else if (systemPrompt.includes('reviewing a generated job title')) {
          if (prompt.includes('**')) {
            return Promise.resolve({
              toString: () => 'CRITIQUE: Contains markdown\nSenior AI Platform Engineer',
            })
          }
          return Promise.resolve({ toString: () => 'APPROVED' })
        }
        return Promise.resolve({ toString: () => 'Default' })
      }),
    })),
  }
})

jest.mock('../factory', () => ({
  createModel: jest.fn().mockReturnValue('mock-model'),
}))

describe('jobTitleGraph', () => {
  const mockConfig = { apiKey: 'test' } as AgentConfig
  const mockResumeData = {
    summary: 'Expert in AI',
    workExperience: [{ position: 'AI dev', organization: 'OpenAI' }],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate a job title with refinement and markdown stripping', async () => {
    const onProgress = jest.fn()
    const result = await generateJobTitleGraph(mockResumeData as unknown as ResumeData, 'JD', mockConfig, onProgress)

    expect(result).toBe('Senior AI Platform Engineer')
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Job title generated!',
      done: true,
    })
  })

  it('should handle missing resume data gracefully', async () => {
    const result = await generateJobTitleGraph({} as unknown as ResumeData, 'JD', mockConfig)
    expect(result).toBeDefined()
  })

  it('should strip various markdown formats in final cleanup', async () => {
    ;(Agent as unknown as jest.Mock)
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({ toString: () => 'Analysis' }),
      }))
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({
          toString: () => '~~Strikethrough~~ `Code` _Italic_',
        }),
      }))
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({ toString: () => 'APPROVED' }),
      }))

    const result = await generateJobTitleGraph(mockResumeData as unknown as ResumeData, 'JD', mockConfig)

    expect(result).toBe('Strikethrough Code Italic')
  })
})
