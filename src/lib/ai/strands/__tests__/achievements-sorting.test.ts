import { sortAchievementsGraph } from '@/lib/ai/strands/achievements-sorting-graph'
import { AgentConfig } from '@/lib/ai/strands/types'
import { Agent } from '@strands-agents/sdk'
import { suppressConsoleError } from '@/lib/__tests__/test-utils'

jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      invoke: jest.fn().mockImplementation((prompt: string) => {
        if (systemPrompt.includes('identifying what makes achievements relevant')) {
          return Promise.resolve({ toString: () => 'Analysis: Metrics matter' })
        } else if (systemPrompt.includes('sorting professional achievements')) {
          return Promise.resolve({
            toString: () => '{"rankedIndices": [1, 0]}',
          })
        } else if (systemPrompt.includes('AI-generated achievement ranking for quality')) {
          if (prompt.includes('fail')) {
            return Promise.resolve({
              toString: () => 'CRITIQUE: Bad order\n{"rankedIndices": [0, 1]}',
            })
          }
          return Promise.resolve({ toString: () => 'APPROVED' })
        }
        return Promise.resolve({ toString: () => 'Default' })
      }),
    })),
    tool: jest.fn().mockImplementation((config) => config),
  }
})


jest.mock('../factory', () => ({
  createModel: jest.fn().mockReturnValue('mock-model'),
}))

describe('achievementsSortingGraph', () => {
  const mockConfig = { apiKey: 'test' } as AgentConfig
  const achievements = ['Did X', 'Did Y']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should sort achievements successfully on first try', async () => {
    const result = await sortAchievementsGraph(achievements, 'Dev', 'Company', 'JD', mockConfig)
    expect(result.rankedIndices).toEqual([1, 0])
  })

  it('should recover from critique with corrected JSON', async () => {
    ; (Agent as unknown as jest.Mock)
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({ toString: () => 'Analysis' }),
      }))
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({ toString: () => 'fail' }), // Trigger critique
      }))
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({
          toString: () => 'CRITIQUE: Reorder\n{"rankedIndices": [0, 1]}',
        }),
      }))
    await suppressConsoleError(/Raw JSON:/i, async () => {
      const result = await sortAchievementsGraph(achievements, 'Dev', 'Company', 'JD', mockConfig)
      expect(result.rankedIndices).toEqual([0, 1])
    })
  })

  it('should fallback to original order on invalid JSON', async () => {
    ; (Agent as unknown as jest.Mock)
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({ toString: () => 'Analysis' }),
      }))
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({ toString: () => 'not-json' }),
      }))

    await suppressConsoleError([/Failed to parse achievements sort result:/i, /Raw JSON:/i], async () => {
      const result = await sortAchievementsGraph(achievements, 'Dev', 'Company', 'JD', mockConfig)
      // Fallback is [0, 1]
      expect(result.rankedIndices).toEqual([0, 1])
    })
  })

  it('should fallback if indices are missing', async () => {
    ; (Agent as unknown as jest.Mock)
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({ toString: () => 'Analysis' }),
      }))
      .mockImplementationOnce(() => ({
        invoke: jest.fn().mockResolvedValue({ toString: () => '{"rankedIndices": [0]}' }), // Missing index 1
      }))

    await suppressConsoleError([/Failed to parse achievements sort result:/i, /Raw JSON:/i], async () => {
      const result = await sortAchievementsGraph(achievements, 'Dev', 'Company', 'JD', mockConfig)
      expect(result.rankedIndices).toEqual([0, 1])
    })
  })

  it('should handle iteration limit in review loop', async () => {
    ; (Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt: _ }: { systemPrompt: string }) => ({
      invoke: jest.fn().mockResolvedValue({
        toString: () => 'CRITIQUE: Keep failing\n{"rankedIndices": [1, 0]}',
      }),
    }))

    await suppressConsoleError([/Failed to parse achievements sort result:/i, /Raw JSON:/i], async () => {
      const result = await sortAchievementsGraph(achievements, 'Dev', 'Company', 'JD', mockConfig)
      // Even if it fails, it returns the last valid-ish one it got or fallback
      expect(result.rankedIndices).toEqual([1, 0])
    })
  })
})
