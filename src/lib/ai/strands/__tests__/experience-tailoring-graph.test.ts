import { tailorExperienceToJDGraph } from '@/lib/ai/strands/experience-tailoring-graph'
import { AgentConfig } from '@/lib/ai/strands/types'

let mockReviewerResponse = 'APPROVED'
let mockRelevanceResponse = 'APPROVED'

jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      return {
        systemPrompt,
        invoke: jest.fn().mockImplementation((prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          const p = (prompt || '').toLowerCase()

          if (sp.includes('strategist')) {
            return Promise.resolve({ toString: () => 'Analysis' })
          }
          if (sp.includes('description') || sp.includes('achievement')) {
            if (p.includes('invalid_json')) return Promise.resolve({ toString: () => 'INVALID' })
            return Promise.resolve({
              toString: () => '{"description": "Tailored", "achievements": ["A1"]}',
            })
          }
          if (sp.includes('fact')) {
            const res = mockReviewerResponse
            if (typeof mockReviewerResponse === 'string' && mockReviewerResponse !== 'APPROVED') {
              // If it's a string, we might want to stay rejected or reset based on test needs
              // But for simplicity, let's keep it as is if we want persistent rejection
            }
            return Promise.resolve({ toString: () => res })
          }
          if (sp.includes('relevance')) {
            const res = mockRelevanceResponse
            return Promise.resolve({ toString: () => res })
          }
          return Promise.resolve({ toString: () => 'Tailored' })
        }),
      }
    }),
  }
})

jest.mock('../factory', () => ({
  createModel: jest.fn().mockReturnValue({ toString: () => 'mock-model' }),
}))

describe('experienceTailoringGraph', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockReviewerResponse = 'APPROVED'
    mockRelevanceResponse = 'APPROVED'
  })

  const mockConfig: AgentConfig = {
    apiKey: 'test',
    apiUrl: '',
    model: '',
    providerType: 'openai-compatible',
  }

  it('should tailor experience successfully', async () => {
    const result = await tailorExperienceToJDGraph('Desc', ['Ach'], 'Pos', 'Org', 'JD', mockConfig)
    expect(result).toBeDefined()
    expect(result.description).toBeDefined()
  })

  it('should handle JSON parse error fallback', async () => {
    const result = await tailorExperienceToJDGraph('INVALID_JSON', ['Ach'], 'Pos', 'Org', 'JD', mockConfig)
    expect(result).toBeDefined()
    expect(result.description).toBeDefined()
  })

  it('should handle fact check refinement', async () => {
    mockReviewerResponse = 'REJECTED: Factual error'
    const result = await tailorExperienceToJDGraph('Desc', ['Ach'], 'Pos', 'Org', 'JD', mockConfig)
    expect(result).toBeDefined()
    expect(result.description).toBeDefined()
  })

  it('should handle relevance enhancement', async () => {
    mockRelevanceResponse = 'REJECTED: Low relevance'
    const result = await tailorExperienceToJDGraph('Desc', ['Ach'], 'Pos', 'Org', 'JD', mockConfig)
    expect(result).toBeDefined()
    expect(result.description).toBeDefined()
  })
})
