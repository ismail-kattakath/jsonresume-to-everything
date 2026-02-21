import { sortSkillsGraph } from '@/lib/ai/strands/skills-sorting-graph'
import { AgentConfig } from '@/lib/ai/strands/types'
import { Agent } from '@strands-agents/sdk'
import type { SkillGroup } from '@/types'

// Shared mock factory — lets individual tests override behaviour per-agent
let brainResponse = 'Analysis'
let scribeResponse = '{"groupOrder": ["G1"], "skillOrder": {"G1": ["S1"]}}'
let editorResponse = 'APPROVED'

jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      return {
        systemPrompt,
        invoke: jest.fn().mockImplementation((_prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          if (sp.includes('brain')) {
            return Promise.resolve({ toString: () => brainResponse })
          }
          if (sp.includes('scribe')) {
            return Promise.resolve({ toString: () => scribeResponse })
          }
          if (sp.includes('editor')) {
            return Promise.resolve({ toString: () => editorResponse })
          }
          return Promise.resolve({ toString: () => 'Default' })
        }),
      }
    }),
    tool: jest.fn().mockImplementation((config) => config),
  }
})


jest.mock('../factory', () => ({
  createModel: jest.fn().mockReturnValue('mock-model'),
}))

describe('skillsSortingGraph', () => {
  beforeEach(() => {
    ; (Agent as unknown as jest.Mock).mockClear()
    jest.clearAllMocks()
    // Reset to happy-path defaults
    brainResponse = 'Analysis'
    scribeResponse = '{"groupOrder": ["G1"], "skillOrder": {"G1": ["S1"]}}'
    editorResponse = 'APPROVED'
  })

  const mockConfig = {
    apiKey: 'test',
    apiUrl: '',
    model: '',
    providerType: 'openai',
  } as unknown as AgentConfig
  const mockSkills: SkillGroup[] = [{ title: 'G1', skills: [{ text: 'S1' }] }] as SkillGroup[]

  it('should sort skills successfully', async () => {
    const result = await sortSkillsGraph(mockSkills, 'JD', mockConfig)
    expect(result).toBeDefined()
    expect(result.groupOrder).toContain('G1')
  })

  it('should call onProgress callbacks at each stage', async () => {
    const onProgress = jest.fn()
    await sortSkillsGraph(mockSkills, 'JD', mockConfig, onProgress)
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Analyzing skill relevance...',
      done: false,
    })
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Sorting and optimizing skills...',
      done: false,
    })
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Validating sort results...',
      done: false,
    })
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Skills sorted!',
      done: true,
    })
  })

  it('should retry when editor returns CRITIQUE then APPROVED', async () => {
    let editorCallCount = 0
    editorResponse = 'will-be-overridden'
      ; (Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
        systemPrompt,
        invoke: jest.fn().mockImplementation((_prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          if (sp.includes('brain')) return Promise.resolve({ toString: () => 'Analysis' })
          if (sp.includes('scribe'))
            return Promise.resolve({
              toString: () => '{"groupOrder": ["G1"], "skillOrder": {"G1": ["S1"]}}',
            })
          if (sp.includes('editor')) {
            editorCallCount++
            if (editorCallCount === 1)
              return Promise.resolve({
                toString: () => 'CRITIQUE: missing something',
              })
            return Promise.resolve({ toString: () => 'APPROVED' })
          }
          return Promise.resolve({ toString: () => 'Default' })
        }),
      }))
    const result = await sortSkillsGraph(mockSkills, 'JD', mockConfig)
    expect(result).toBeDefined()
    expect(result.groupOrder).toContain('G1')
  })

  it('should fall into fallback when APPROVED is received but JSON.parse fails', async () => {
    // Scribe returns valid JSON for fallback, but first APPROVED attempt gets bad JSON
    let scribeCallCount = 0
      ; (Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
        systemPrompt,
        invoke: jest.fn().mockImplementation((_prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          if (sp.includes('brain')) return Promise.resolve({ toString: () => 'Analysis' })
          if (sp.includes('scribe')) {
            scribeCallCount++
            if (scribeCallCount === 1) return Promise.resolve({ toString: () => 'not-valid-json' })
            return Promise.resolve({
              toString: () => '{"groupOrder": ["G1"], "skillOrder": {"G1": ["S1"]}}',
            })
          }
          if (sp.includes('editor')) return Promise.resolve({ toString: () => 'APPROVED' })
          return Promise.resolve({ toString: () => 'Default' })
        }),
      }))
    // First iteration: scribe returns bad JSON, editor says APPROVED, parse fails → critique recorded
    // Subsequent iteration: eventually either passes or falls to fallback
    const result = await sortSkillsGraph(mockSkills, 'JD', mockConfig)
    expect(result).toBeDefined()
  })

  it('should throw if all iterations fail and fallback JSON is also invalid', async () => {
    ; (Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      systemPrompt,
      invoke: jest.fn().mockImplementation(() => {
        const sp = (systemPrompt || '').toLowerCase()
        if (sp.includes('brain')) return Promise.resolve({ toString: () => 'Analysis' })
        if (sp.includes('scribe')) return Promise.resolve({ toString: () => 'not-valid-json-at-all' })
        if (sp.includes('editor')) return Promise.resolve({ toString: () => 'CRITIQUE: bad json' })
        return Promise.resolve({ toString: () => 'Default' })
      }),
    }))
    await expect(sortSkillsGraph(mockSkills, 'JD', mockConfig)).rejects.toThrow(
      'Failed to generate a valid skill sorting result after multiple attempts'
    )
  })

  it('should use markdown-wrapped JSON in fallback (strips code blocks)', async () => {
    const validJson = '{"groupOrder": ["G1"], "skillOrder": {"G1": ["S1"]}}'
      ; (Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
        systemPrompt,
        invoke: jest.fn().mockImplementation(() => {
          const sp = (systemPrompt || '').toLowerCase()
          if (sp.includes('brain')) return Promise.resolve({ toString: () => 'Analysis' })
          if (sp.includes('scribe'))
            return Promise.resolve({
              toString: () => `\`\`\`json\n${validJson}\n\`\`\``,
            })
          if (sp.includes('editor')) return Promise.resolve({ toString: () => 'CRITIQUE: wrapped in md' })
          return Promise.resolve({ toString: () => 'Default' })
        }),
      }))
    // All iterations produce CRITIQUE, falls to fallback which strips backticks and parses
    const result = await sortSkillsGraph(mockSkills, 'JD', mockConfig)
    expect(result.groupOrder).toContain('G1')
  })
})
