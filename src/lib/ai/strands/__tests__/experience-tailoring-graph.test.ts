import { tailorExperienceToJDGraph } from '@/lib/ai/strands/experienceTailoringGraph'
import { AgentConfig } from '@/lib/ai/strands/types'

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
          if (sp.includes('reviewer') || sp.includes('fact')) {
            return Promise.resolve({ toString: () => 'APPROVED' })
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
    // The graph returns { description, achievements }
    expect(result.description).toBeDefined()
  })

  it('should handle JSON parse error fallback', async () => {
    const result = await tailorExperienceToJDGraph('INVALID_JSON', ['Ach'], 'Pos', 'Org', 'JD', mockConfig)
    expect(result).toBeDefined()
    expect(result.description).toBeDefined()
  })
})
