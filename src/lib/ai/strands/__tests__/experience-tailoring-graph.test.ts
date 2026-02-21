import { tailorExperienceToJDGraph } from '@/lib/ai/strands/experience-tailoring/index'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createMockStream } from './mock-utils'

let mockFactCheckResponse = 'APPROVED'
let mockRelevanceResponse = 'APPROVED'
let mockIntegrityResponse = 'APPROVED'

const defaultAgentMock = ({ systemPrompt }: { systemPrompt: string }) => {
  const getResponse = (prompt: string): { text: string; tool?: string } => {
    const sp = (systemPrompt || '').toLowerCase()
    const p = (prompt || '').toLowerCase()

    // Agent 1: Analyzer
    if (sp.includes('alignment analyst')) {
      return { text: 'Analysis: Strong alignment in backend development' }
    }

    // Agent 2: Description Writer
    if (sp.includes('resume writer')) {
      if (p.includes('invalid_json')) return { text: 'INVALID' }
      return { text: 'Tailored description' }
    }

    // Agent 3a: Keyword Extractor
    if (sp.includes('keyword extraction specialist')) {
      return {
        text: '{"missingKeywords":["Kubernetes","Terraform"],"criticalKeywords":["Kubernetes"],"niceToHaveKeywords":["Terraform"]}',
        tool: 'finalize_keyword_extraction',
      }
    }

    // Agent 3b: Enrichment Classifier
    if (sp.includes('keyword injection auditor') || sp.includes('enrichment classifier')) {
      return {
        text: '{"enrichmentMap":{"0":["Kubernetes"],"1":[]},"rationale":"k8s implied by container deployment context"}',
        tool: 'finalize_enrichment_classification',
      }
    }

    // Agent 3c: Achievements Optimizer
    if (sp.includes('keyword enrichment capability')) {
      return {
        text: 'Deployed containerized services using Kubernetes for zero-downtime releases\nImproved team velocity by 30%',
      }
    }

    // Agent 3d: Integrity Auditor
    if (sp.includes('integrity auditor') && !sp.includes('keyword injection auditor')) {
      return { text: mockIntegrityResponse }
    }

    // Agent 4a: Tech Stack Aligner
    if (sp.includes('tech stack ats alignment specialist')) {
      return {
        text: '{"techStack":["Kubernetes","Node.js"],"rationale":"normalized k8s"}',
        tool: 'finalize_tech_stack_alignment',
      }
    }

    // Agent 4b: Tech Stack Validator
    if (sp.includes('tech stack alignment auditor')) {
      return { text: 'APPROVED' }
    }

    // Agent 5: Fact Checker
    if (sp.includes('fact-checking auditor')) {
      return { text: mockFactCheckResponse }
    }

    // Agent 6: Relevance Evaluator
    if (sp.includes('alignment evaluator')) {
      return { text: mockRelevanceResponse }
    }

    return { text: 'Tailored' }
  }

  const messages: any[] = []

  return {
    systemPrompt,
    messages,
    invoke: jest.fn().mockImplementation(async (prompt: string) => {
      const { text } = getResponse(prompt)
      messages.push({ role: 'assistant', content: [{ type: 'text', text }] })
      return { toString: () => text }
    }),
    stream: jest.fn().mockImplementation(async (prompt: string) => {
      const { text, tool } = getResponse(prompt)
      const content: any[] = [{ type: 'text', text }]
      if (tool) {
        content.push({
          type: 'toolUseBlock',
          name: tool,
          input: JSON.parse(text),
        })
      }
      messages.push({ role: 'assistant', content })
      return createMockStream(text, tool)
    }),
  }
}

jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation((args) => defaultAgentMock(args)),
    tool: jest.fn().mockImplementation((config) => config),
    SlidingWindowConversationManager: jest.fn().mockImplementation(() => ({})),
  }
})

jest.mock('../factory', () => ({
  createModel: jest.fn().mockReturnValue({ toString: () => 'mock-model' }),
}))

describe('experienceTailoringGraph', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { Agent } = jest.requireMock('@strands-agents/sdk') as { Agent: jest.Mock }
    Agent.mockImplementation(defaultAgentMock)
    mockFactCheckResponse = 'APPROVED'
    mockRelevanceResponse = 'APPROVED'
    mockIntegrityResponse = 'APPROVED'
  })

  const mockConfig: AgentConfig = {
    apiKey: 'test',
    apiUrl: '',
    model: '',
    providerType: 'openai-compatible',
  }

  const achievements = ['Deployed services to cloud', 'Improved team velocity by 30%']

  it('should tailor experience successfully with keyword enrichment', async () => {
    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes, Terraform, CI/CD',
      [],
      mockConfig
    )
    expect(result).toBeDefined()
    expect(result.description).toBe('Tailored description')
    expect(result.achievements.length).toBeGreaterThanOrEqual(1)
  })

  it('should return achievements with injected approved keywords', async () => {
    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      [],
      mockConfig
    )
    // The optimizer stream yields it in the first achievement
    const achievementsText = result.achievements.join(' ')
    expect(achievementsText).toContain('Kubernetes')
  })

  it('should handle invalid JSON from keyword extractor gracefully', async () => {
    const result = await tailorExperienceToJDGraph('INVALID_JSON', achievements, 'Pos', 'Org', 'JD', [], mockConfig)
    expect(result).toBeDefined()
    expect(result.description).toBeDefined()
    expect(result.achievements.length).toBeGreaterThan(0)
  })

  it('should gate fabrication — classifier provides empty map for unrelated achievement', async () => {
    // Achievement [1] gets no approved keywords (enrichmentMap index "1" is [])
    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      [],
      mockConfig
    )
    // Verify that the result was produced (classifier ran without errors)
    // The optimizer seed for index 1 is empty — result should not fabricate Kubernetes there
    expect(result).toBeDefined()
    expect(result.achievements.length).toBeGreaterThan(0)
    // The last achievement (index 1) should contain no injected Kubernetes claim
    // since enrichmentMap["1"] = [] per our default mock
    if (result.achievements.length > 1) {
      expect(result.achievements[result.achievements.length - 1]).not.toContain('Kubernetes')
    }
  })

  it('should run integrity auditor critique-then-approve loop', async () => {
    let integrityCallCount = 0
    mockIntegrityResponse = 'CRITIQUE: [0]: Kubernetes not evidenced | Corrected: Deployed services to cloud'
    // After first critique, auditor approves on second call
    const { Agent } = jest.requireMock('@strands-agents/sdk') as {
      Agent: jest.Mock
    }
    Agent.mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      const messages: any[] = []
      return {
        messages,
        invoke: jest.fn().mockImplementation(async (prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          if (sp.includes('integrity auditor')) {
            integrityCallCount++
            const res =
              integrityCallCount === 1
                ? 'CRITIQUE: [0]: Kubernetes not evidenced | Corrected: Deployed services to cloud'
                : 'APPROVED'
            messages.push({ role: 'assistant', content: [{ type: 'text', text: res }] })
            return { toString: () => res }
          }
          if (sp.includes('alignment analyst')) return Promise.resolve({ toString: () => 'Analysis' })
          if (sp.includes('resume writer')) return Promise.resolve({ toString: () => 'Tailored description' })
          if (sp.includes('keyword extraction specialist'))
            return Promise.resolve({
              toString: () =>
                '{"missingKeywords":["Kubernetes"],"criticalKeywords":["Kubernetes"],"niceToHaveKeywords":[]}',
            })
          if (sp.includes('keyword injection auditor') || sp.includes('enrichment classifier'))
            return Promise.resolve({
              toString: () => '{"enrichmentMap":{"0":["Kubernetes"],"1":[]},"rationale":"test"}',
            })
          if (sp.includes('keyword enrichment capability'))
            return Promise.resolve({
              toString: () => 'Deployed services using Kubernetes\nImproved velocity by 30%',
            })
          if (sp.includes('tech stack ats alignment specialist'))
            return Promise.resolve({ toString: () => '{"techStack":[],"rationale":""}' })
          if (sp.includes('tech stack alignment auditor')) return Promise.resolve({ toString: () => 'APPROVED' })
          if (sp.includes('fact-checking auditor')) return Promise.resolve({ toString: () => 'APPROVED' })
          if (sp.includes('alignment evaluator')) return Promise.resolve({ toString: () => 'APPROVED' })
          return Promise.resolve({ toString: () => 'Tailored' })
        }),
        stream: jest.fn().mockImplementation(async (prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()

          if (sp.includes('integrity auditor')) {
            integrityCallCount++
            const res =
              integrityCallCount === 1
                ? 'CRITIQUE: [0]: Kubernetes not evidenced | Corrected: Deployed services to cloud'
                : 'APPROVED'
            messages.push({ role: 'assistant', content: [{ type: 'text', text: res }] })
            return createMockStream(res)
          }

          let text = 'Tailored'
          let tool: string | undefined = undefined

          if (sp.includes('alignment analyst')) text = 'Analysis'
          if (sp.includes('resume writer')) text = 'Tailored description'
          if (sp.includes('keyword extraction specialist')) {
            text = '{"missingKeywords":["Kubernetes"],"criticalKeywords":["Kubernetes"],"niceToHaveKeywords":[]}'
            tool = 'finalize_keyword_extraction'
          }
          if (sp.includes('keyword injection auditor') || sp.includes('enrichment classifier')) {
            text = '{"enrichmentMap":{"0":["Kubernetes"],"1":[]},"rationale":"test"}'
            tool = 'finalize_enrichment_classification'
          }
          if (sp.includes('keyword enrichment capability'))
            text = 'Deployed services using Kubernetes\nImproved velocity by 30%'

          const content: any[] = [{ type: 'text', text }]
          if (tool) content.push({ type: 'toolUseBlock', name: tool, input: JSON.parse(text) })
          messages.push({ role: 'assistant', content })

          return createMockStream(text, tool)
        }),
      }
    })

    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      [],
      mockConfig
    )
    expect(integrityCallCount).toBe(2)
    expect(result).toBeDefined()
  })

  it('should exhaust integrity auditor max iterations and return last result', async () => {
    const { Agent } = jest.requireMock('@strands-agents/sdk') as {
      Agent: jest.Mock
    }
    Agent.mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      const messages: any[] = []
      return {
        messages,
        invoke: jest.fn().mockImplementation(async (prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          if (sp.includes('integrity auditor'))
            return Promise.resolve({
              toString: () => 'CRITIQUE: [0]: Issue persists | Corrected: Deployed services to cloud',
            })
          if (sp.includes('alignment analyst')) return Promise.resolve({ toString: () => 'Analysis' })
          if (sp.includes('resume writer')) return Promise.resolve({ toString: () => 'Tailored description' })
          if (sp.includes('keyword extraction specialist'))
            return Promise.resolve({
              toString: () => '{"missingKeywords":[],"criticalKeywords":[],"niceToHaveKeywords":[]}',
            })
          if (sp.includes('keyword injection auditor') || sp.includes('enrichment classifier'))
            return Promise.resolve({ toString: () => '{"enrichmentMap":{},"rationale":"none"}' })
          if (sp.includes('keyword enrichment capability'))
            return Promise.resolve({ toString: () => 'Achievement A\nAchievement B' })
          if (sp.includes('tech stack ats alignment specialist'))
            return Promise.resolve({ toString: () => '{"techStack":[],"rationale":""}' })
          if (sp.includes('tech stack alignment auditor')) return Promise.resolve({ toString: () => 'APPROVED' })
          if (sp.includes('fact-checking auditor')) return Promise.resolve({ toString: () => 'APPROVED' })
          if (sp.includes('alignment evaluator')) return Promise.resolve({ toString: () => 'APPROVED' })
          return Promise.resolve({ toString: () => 'Tailored' })
        }),
        stream: jest.fn().mockImplementation(async (prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()

          let text = 'Tailored'
          let tool: string | undefined = undefined

          if (sp.includes('integrity auditor'))
            text = 'CRITIQUE: [0]: Issue persists | Corrected: Deployed services to cloud'
          if (sp.includes('alignment analyst')) text = 'Analysis'
          if (sp.includes('resume writer')) text = 'Tailored description'
          if (sp.includes('keyword extraction specialist')) {
            text = '{"missingKeywords":[],"criticalKeywords":[],"niceToHaveKeywords":[]}'
            tool = 'finalize_keyword_extraction'
          }
          if (sp.includes('keyword injection auditor') || sp.includes('enrichment classifier')) {
            text = '{"enrichmentMap":{},"rationale":"none"}'
            tool = 'finalize_enrichment_classification'
          }
          if (sp.includes('keyword enrichment capability')) text = 'Achievement A\nAchievement B'
          if (sp.includes('tech stack ats alignment specialist')) {
            text = '{"techStack":[],"rationale":""}'
            tool = 'finalize_tech_stack_alignment'
          }
          if (sp.includes('tech stack alignment auditor')) text = 'APPROVED'
          if (sp.includes('fact-checking auditor')) text = 'APPROVED'
          if (sp.includes('alignment evaluator')) text = 'APPROVED'

          const content: any[] = [{ type: 'text', text }]
          if (tool) content.push({ type: 'toolUseBlock', name: tool, input: JSON.parse(text) })
          messages.push({ role: 'assistant', content })

          return createMockStream(text, tool)
        }),
      }
    })

    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      [],
      mockConfig
    )
    expect(result).toBeDefined()
    expect(result.achievements.length).toBeGreaterThan(0)
  })

  it('should handle fact check refinement', async () => {
    mockFactCheckResponse = 'CRITIQUE: Factual error in metrics'
    const result = await tailorExperienceToJDGraph('Desc', achievements, 'Pos', 'Org', 'JD', [], mockConfig)
    expect(result).toBeDefined()
    expect(result.description).toBeDefined()
  })

  it('should handle relevance enhancement', async () => {
    mockRelevanceResponse = 'CRITIQUE: Low relevance to JD'
    const result = await tailorExperienceToJDGraph('Desc', achievements, 'Pos', 'Org', 'JD', [], mockConfig)
    expect(result).toBeDefined()
    expect(result.description).toBeDefined()
  })

  it('should call onProgress with all stage messages', async () => {
    const progressMessages: string[] = []
    const onProgress = jest.fn((chunk: { content?: string; done: boolean }) => {
      if (chunk.content) progressMessages.push(chunk.content)
    })

    await tailorExperienceToJDGraph(
      'Desc',
      achievements,
      'Pos',
      'Org',
      'JD',
      ['k8s'],
      mockConfig,
      onProgress as Parameters<typeof tailorExperienceToJDGraph>[7]
    )

    expect(progressMessages).toContain('Analyzing job requirements...')
    expect(progressMessages).toContain('Tailoring description...')
    expect(progressMessages).toContain('Extracting JD keywords...')
    expect(progressMessages).toContain('Classifying keywords for achievements...')
    expect(progressMessages).toContain('Enriching achievements with relevant keywords...')
    expect(progressMessages).toContain('Auditing achievement integrity (Iteration 1)...')
    expect(progressMessages).toContain('Validating factual accuracy...')
    expect(progressMessages).toContain('Evaluating alignment quality...')
    expect(progressMessages).toContain('Experience tailored!')
    // Verify tool indicator
    expect(progressMessages.some((m) => m.includes('[Executing tool:'))).toBe(true)
  })

  it('should handle classifier returning invalid JSON gracefully', async () => {
    const { Agent } = jest.requireMock('@strands-agents/sdk') as {
      Agent: jest.Mock
    }
    Agent.mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      const messages: any[] = []
      return {
        messages,
        invoke: jest.fn().mockImplementation(async (prompt: string) => {
          return { toString: () => 'Tailored' }
        }),
        stream: jest.fn().mockImplementation(async (prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()

          let text = 'Tailored'
          let tool: string | undefined = undefined

          if (sp.includes('keyword injection auditor') || sp.includes('enrichment classifier')) text = 'NOT_VALID_JSON'
          if (sp.includes('alignment analyst')) text = 'Analysis'
          if (sp.includes('resume writer')) text = 'Tailored description'
          if (sp.includes('keyword extraction specialist')) {
            text = '{"missingKeywords":["Kubernetes"],"criticalKeywords":["Kubernetes"],"niceToHaveKeywords":[]}'
            tool = 'finalize_keyword_extraction'
          }
          if (sp.includes('keyword enrichment capability')) text = 'Achievement A\nAchievement B'
          if (sp.includes('integrity auditor')) text = 'APPROVED'
          if (sp.includes('fact-checking auditor')) text = 'APPROVED'
          if (sp.includes('alignment evaluator')) text = 'APPROVED'

          const content: any[] = [{ type: 'text', text }]
          if (tool) content.push({ type: 'toolUseBlock', name: tool, input: JSON.parse(text) || {} })
          messages.push({ role: 'assistant', content })
          return createMockStream(text, tool)
        }),
      }
    })

    // Should not throw; falls back to no seed enrichment
    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      [],
      mockConfig
    )
    expect(result).toBeDefined()
    expect(result.achievements.length).toBeGreaterThan(0)
  })

  it('should align tech stack when provided', async () => {
    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      ['k8s', 'nodejs'],
      mockConfig
    )
    expect(result.techStack).toBeDefined()
    expect(result.techStack).toEqual(['Kubernetes', 'Node.js']) // Matches our mock aligner
  })

  it('should handle tech stack aligner returning invalid JSON gracefully', async () => {
    const { Agent } = jest.requireMock('@strands-agents/sdk') as {
      Agent: jest.Mock
    }
    Agent.mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      const messages: any[] = []
      return {
        messages,
        invoke: jest.fn().mockImplementation(async (prompt: string) => {
          return { toString: () => 'APPROVED' }
        }),
        stream: jest.fn().mockImplementation(async (prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          let text = 'APPROVED'
          let tool: string | undefined = undefined
          if (sp.includes('tech stack ats alignment specialist')) {
            text = 'INVALID_JSON_RESPONSE'
            tool = 'finalize_tech_stack_alignment'
          }

          const content: any[] = [{ type: 'text', text }]
          if (tool) content.push({ type: 'toolUseBlock', name: tool, input: {} })
          messages.push({ role: 'assistant', content })
          return createMockStream(text, tool)
        }),
      }
    })

    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      ['Original Tech'],
      mockConfig
    )
    expect(result.techStack).toBeDefined()
    expect(result.techStack).toEqual(['Original Tech']) // Falls back to original stack
  })

  it('should run tech stack validator critique-then-approve loop', async () => {
    let validatorCallCount = 0
    const { Agent } = jest.requireMock('@strands-agents/sdk') as {
      Agent: jest.Mock
    }
    Agent.mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      const messages: any[] = []
      return {
        messages,
        invoke: jest.fn().mockImplementation(async (prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          if (sp.includes('tech stack alignment auditor')) {
            validatorCallCount++
            const res = validatorCallCount === 1 ? 'CRITIQUE: Removed a phantom addition' : 'APPROVED'
            messages.push({ role: 'assistant', content: [{ type: 'text', text: res }] })
            return { toString: () => res }
          }
          if (sp.includes('tech stack ats alignment specialist')) {
            const text = '{"techStack":["Safe Tech"],"rationale":"test"}'
            messages.push({
              role: 'assistant',
              content: [
                { type: 'text', text },
                { type: 'toolUseBlock', name: 'finalize_tech_stack_alignment', input: JSON.parse(text) },
              ],
            })
            return { toString: () => text }
          }
          return { toString: () => 'APPROVED' }
        }),
        stream: jest.fn().mockImplementation(async (prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          if (sp.includes('tech stack alignment auditor')) {
            validatorCallCount++
            const res = validatorCallCount === 1 ? 'CRITIQUE: Removed a phantom addition' : 'APPROVED'
            messages.push({ role: 'assistant', content: [{ type: 'text', text: res }] })
            return createMockStream(res)
          }
          if (sp.includes('tech stack ats alignment specialist')) {
            const text = '{"techStack":["Safe Tech"],"rationale":"test"}'
            const tool = 'finalize_tech_stack_alignment'
            messages.push({
              role: 'assistant',
              content: [
                { type: 'text', text },
                { type: 'toolUseBlock', name: tool, input: JSON.parse(text) },
              ],
            })
            return createMockStream(text, tool)
          }
          return createMockStream('APPROVED')
        }),
      }
    })

    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      ['Original Tech'],
      mockConfig
    )
    expect(validatorCallCount).toBe(2)
    expect(result.techStack).toBeDefined()
  })
})
