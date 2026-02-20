import { sortTechStackGraph } from '@/lib/ai/strands/techStackSortingGraph'
import { AgentConfig } from '@/lib/ai/strands/types'
import { Agent } from '@strands-agents/sdk'

jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      return {
        systemPrompt,
        invoke: jest.fn().mockImplementation((_prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          if (sp.includes('brain') || sp.includes('optimization')) {
            return Promise.resolve({ toString: () => 'Analysis of tech stack' })
          }
          if (sp.includes('scribe') || sp.includes('architect')) {
            return Promise.resolve({ toString: () => '["React", "Next.js"]' })
          }
          if (sp.includes('editor') || sp.includes('validator')) {
            return Promise.resolve({ toString: () => 'APPROVED' })
          }
          return Promise.resolve({ toString: () => 'Default' })
        }),
      }
    }),
  }
})

jest.mock('../factory', () => ({
  createModel: jest.fn().mockReturnValue('mock-model'),
}))

describe('techStackSortingGraph', () => {
  beforeEach(() => {
    ;(Agent as unknown as jest.Mock).mockClear()
    jest.clearAllMocks()
  })

  const mockConfig = { apiKey: 'test' } as AgentConfig
  const mockTechs = ['React', 'Next.js', 'TypeScript']

  it('should sort tech stack successfully', async () => {
    const result = await sortTechStackGraph(mockTechs, 'JD', mockConfig)
    expect(result).toContain('React')
  })

  it('should call onProgress callbacks at each stage', async () => {
    const onProgress = jest.fn()
    await sortTechStackGraph(mockTechs, 'JD', mockConfig, onProgress)
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Analyzing tech stack relevance...',
      done: false,
    })
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Sorting tech stack...',
      done: false,
    })
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Validating sort results...',
      done: false,
    })
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Tech stack sorted!',
      done: true,
    })
  })

  it('should retry if editor critiques then approves', async () => {
    let editorCallCount = 0
    ;(Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      systemPrompt,
      invoke: jest.fn().mockImplementation(() => {
        const sp = (systemPrompt || '').toLowerCase()
        if (sp.includes('brain') || sp.includes('optimization')) return Promise.resolve({ toString: () => 'Analysis' })
        if (sp.includes('scribe') || sp.includes('architect'))
          return Promise.resolve({ toString: () => '["React", "Next.js"]' })
        if (sp.includes('editor') || sp.includes('validator')) {
          editorCallCount++
          if (editorCallCount === 1) return Promise.resolve({ toString: () => 'CRITIQUE: bad' })
          return Promise.resolve({ toString: () => 'APPROVED' })
        }
        return Promise.resolve({ toString: () => 'Default' })
      }),
    }))
    const result = await sortTechStackGraph(mockTechs, 'JD', mockConfig)
    expect(result).toContain('React')
  })

  it('should use fallback parse when all 3 attempts fail but fallback JSON is a valid array', async () => {
    ;(Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      systemPrompt,
      invoke: jest.fn().mockImplementation(() => {
        const sp = (systemPrompt || '').toLowerCase()
        if (sp.includes('brain') || sp.includes('optimization')) return Promise.resolve({ toString: () => 'Analysis' })
        // Scribe always returns array JSON
        if (sp.includes('scribe') || sp.includes('architect'))
          return Promise.resolve({
            toString: () => '["React","Next.js","TypeScript"]',
          })
        // Editor always critiques → all 3 fail → fallback
        if (sp.includes('editor') || sp.includes('validator'))
          return Promise.resolve({ toString: () => 'CRITIQUE: always bad' })
        return Promise.resolve({ toString: () => 'Default' })
      }),
    }))
    const onProgress = jest.fn()
    const result = await sortTechStackGraph(mockTechs, 'JD', mockConfig, onProgress)
    expect(Array.isArray(result)).toBe(true)
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Tech stack sorted!',
      done: true,
    })
  })

  it('should return original technologies when fallback JSON is not an array', async () => {
    ;(Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      systemPrompt,
      invoke: jest.fn().mockImplementation(() => {
        const sp = (systemPrompt || '').toLowerCase()
        if (sp.includes('brain') || sp.includes('optimization')) return Promise.resolve({ toString: () => 'Analysis' })
        // Scribe returns a valid JSON object (not an array)
        if (sp.includes('scribe') || sp.includes('architect'))
          return Promise.resolve({ toString: () => '{"not": "an-array"}' })
        if (sp.includes('editor') || sp.includes('validator'))
          return Promise.resolve({ toString: () => 'CRITIQUE: not array' })
        return Promise.resolve({ toString: () => 'Default' })
      }),
    }))
    const result = await sortTechStackGraph(['TypeScript', 'Node.js'], 'JD', mockConfig)
    // Should return original since parse result is not an array
    expect(result).toEqual(['TypeScript', 'Node.js'])
  })

  it('should return original technologies when fallback JSON throws a parse error', async () => {
    ;(Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      systemPrompt,
      invoke: jest.fn().mockImplementation(() => {
        const sp = (systemPrompt || '').toLowerCase()
        if (sp.includes('brain') || sp.includes('optimization')) return Promise.resolve({ toString: () => 'Analysis' })
        // Scribe returns garbage JSON → parse always throws → fallback catch returns original
        if (sp.includes('scribe') || sp.includes('architect'))
          return Promise.resolve({ toString: () => 'definitely-not-json' })
        if (sp.includes('editor') || sp.includes('validator'))
          return Promise.resolve({ toString: () => 'CRITIQUE: bad json' })
        return Promise.resolve({ toString: () => 'Default' })
      }),
    }))
    const onProgress = jest.fn()
    const result = await sortTechStackGraph(['Go', 'Rust'], 'JD', mockConfig, onProgress)
    expect(result).toEqual(['Go', 'Rust'])
    expect(onProgress).toHaveBeenCalledWith({
      content: 'Tech stack sorted!',
      done: true,
    })
  })

  it('should strip markdown code blocks from scribe output before parsing', async () => {
    ;(Agent as unknown as jest.Mock).mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      systemPrompt,
      invoke: jest.fn().mockImplementation(() => {
        const sp = (systemPrompt || '').toLowerCase()
        if (sp.includes('brain') || sp.includes('optimization')) return Promise.resolve({ toString: () => 'Analysis' })
        if (sp.includes('scribe') || sp.includes('architect'))
          return Promise.resolve({
            toString: () => '```json\n["React", "Vue"]\n```',
          })
        if (sp.includes('editor') || sp.includes('validator')) return Promise.resolve({ toString: () => 'APPROVED' })
        return Promise.resolve({ toString: () => 'Default' })
      }),
    }))
    const result = await sortTechStackGraph(['React', 'Vue'], 'JD', mockConfig)
    expect(result).toContain('React')
    expect(result).toContain('Vue')
  })
})
