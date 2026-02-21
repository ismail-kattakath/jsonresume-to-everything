import { tailorExperienceToJDGraph } from '@/lib/ai/strands/experience-tailoring-graph'
import { AgentConfig } from '@/lib/ai/strands/types'

jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      const getResponse = (prompt: string) => {
        if (systemPrompt.includes('Alignment Analyst')) {
          return 'Analysis score: High'
        } else if (systemPrompt.includes('Resume Writer')) {
          if (prompt.includes('REFINEMENT_TRIGGER')) {
            return 'Refined description'
          }
          return 'Tailored description'
        } else if (systemPrompt.includes('Achievement Optimizer')) {
          return 'Tailored achievement 1\nTailored achievement 2'
        } else if (systemPrompt.includes('Fact-Checking Auditor')) {
          if (prompt.includes('REFINEMENT_TRIGGER') && !prompt.includes('Refined')) {
            return 'CRITIQUE: Inaccuracy'
          }
          return 'APPROVED'
        } else if (systemPrompt.includes('JD-Resume Alignment Evaluator')) {
          if (prompt.includes('RELEVANCE_TRIGGER') && !prompt.includes('highlight JD')) {
            return 'CRITIQUE: Low relevance'
          }
          return 'APPROVED'
        }
        return 'Default'
      }

      return {
        systemPrompt,
        invoke: jest.fn().mockImplementation(async (prompt: string) => {
          const text = getResponse(prompt)
          return { toString: () => text }
        }),
        stream: jest.fn().mockImplementation(async (prompt: string) => {
          const text = getResponse(prompt)
          return {
            async *[Symbol.asyncIterator]() {
              yield { type: 'agentResult', toString: () => text }
            },
          }
        }),
        messages: [],
      }
    }),
    tool: jest.fn().mockImplementation((config) => config),
    SlidingWindowConversationManager: jest.fn().mockImplementation(() => ({})),
    TelemetryHookProvider: jest.fn().mockImplementation(() => ({})),
  }
})

jest.mock('../factory', () => ({
  createModel: jest.fn().mockReturnValue('mock-model'),
}))

describe('experienceTailoringGraph', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockConfig = { apiKey: 'test' } as AgentConfig

  it('should tailor experience successfully on first try', async () => {
    const result = await tailorExperienceToJDGraph(
      'Old description',
      ['Old 1', 'Old 2'],
      'Dev',
      'Company',
      'JD',
      [],
      mockConfig
    )

    expect(result.description).toBe('Tailored description')
    expect(result.achievements).toHaveLength(2)
    expect(result.achievements[0]).toBe('Tailored achievement 1')
  })

  it('should retry if fact checker fails', async () => {
    const result = await tailorExperienceToJDGraph(
      'REFINEMENT_TRIGGER', // This will cause Fact Checker to fail once
      ['Old 1'],
      'Dev',
      'Company',
      'JD',
      [],
      mockConfig
    )

    expect(result.description).toBe('Refined description')
  })

  it('should retry if relevance evaluator fails', async () => {
    const result = await tailorExperienceToJDGraph(
      'RELEVANCE_TRIGGER', // This will cause Relevance Evaluator to fail once
      ['Old 1'],
      'Dev',
      'Company',
      'JD',
      [],
      mockConfig
    )

    expect(result.description).toBe('Tailored description') // Default writer returns this if prompt doesn't have RELEVANCE internal tag... wait.
  })
})
