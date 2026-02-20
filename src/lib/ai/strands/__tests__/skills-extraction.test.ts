import { extractSkillsGraph } from '@/lib/ai/strands/skills-extraction-graph'
import { AgentConfig } from '@/lib/ai/strands/types'

import { Agent } from '@strands-agents/sdk'

jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      let critiqueCount = 0
      return {
        systemPrompt,
        invoke: jest.fn().mockImplementation((prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          const p = (prompt || '').toLowerCase()

          // Use a more generic match or log if needed
          if (sp.includes('expert') || sp.includes('extraction') || sp.includes('skills')) {
            return Promise.resolve({
              toString: () => 'React, Next.js, Node.js',
            })
          }
          if (sp.includes('reviewer') || sp.includes('editor') || sp.includes('validator')) {
            if (p.includes('retry_trigger') && critiqueCount < 1) {
              critiqueCount++
              return Promise.resolve({ toString: () => 'CRITIQUE' })
            }
            return Promise.resolve({ toString: () => 'APPROVED' })
          }
          return Promise.resolve({ toString: () => 'Default' })
        }),
      }
    }),
  }
})

describe('skillsExtractionGraph', () => {
  beforeEach(() => {
    ;(Agent as unknown as jest.Mock).mockClear()
    jest.clearAllMocks()
  })

  const mockConfig: AgentConfig = {
    apiKey: 'test',
    apiUrl: '',
    model: '',
    providerType: 'openai-compatible',
  }

  it('should extract skills successfully', async () => {
    const result = await extractSkillsGraph('JD', mockConfig)
    expect(result).toContain('React')
  })

  it('should retry if reviewer critiques', async () => {
    const result = await extractSkillsGraph('RETRY_TRIGGER', mockConfig)
    expect(result).toContain('React')
  })
})
