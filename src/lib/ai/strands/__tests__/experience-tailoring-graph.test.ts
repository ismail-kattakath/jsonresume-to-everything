import { tailorExperienceToJDGraph } from '@/lib/ai/strands/experience-tailoring-graph'
import { AgentConfig } from '@/lib/ai/strands/types'

let mockFactCheckResponse = 'APPROVED'
let mockRelevanceResponse = 'APPROVED'
let mockIntegrityResponse = 'APPROVED'

jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation(({ systemPrompt }: { systemPrompt: string }) => {
      return {
        systemPrompt,
        invoke: jest.fn().mockImplementation((prompt: string) => {
          const sp = (systemPrompt || '').toLowerCase()
          const p = (prompt || '').toLowerCase()

          // Agent 1: Analyzer
          if (sp.includes('alignment analyst')) {
            return Promise.resolve({ toString: () => 'Analysis: Strong alignment in backend development' })
          }

          // Agent 2: Description Writer
          if (sp.includes('resume writer')) {
            if (p.includes('invalid_json')) return Promise.resolve({ toString: () => 'INVALID' })
            return Promise.resolve({ toString: () => 'Tailored description' })
          }

          // Agent 3a: Keyword Extractor
          if (sp.includes('keyword extraction specialist')) {
            return Promise.resolve({
              toString: () =>
                '{"missingKeywords":["Kubernetes","Terraform"],"criticalKeywords":["Kubernetes"],"niceToHaveKeywords":["Terraform"]}',
            })
          }

          // Agent 3b: Enrichment Classifier
          if (sp.includes('keyword injection auditor') || sp.includes('enrichment classifier')) {
            return Promise.resolve({
              toString: () =>
                '{"enrichmentMap":{"0":["Kubernetes"],"1":[]},"rationale":"k8s implied by container deployment context"}',
            })
          }

          // Agent 3c: Achievements Optimizer
          if (sp.includes('keyword enrichment capability')) {
            return Promise.resolve({
              toString: () =>
                'Deployed containerized services using Kubernetes for zero-downtime releases\nImproved team velocity by 30%',
            })
          }

          // Agent 3d: Integrity Auditor
          if (sp.includes('integrity auditor') && !sp.includes('keyword injection auditor')) {
            const res = mockIntegrityResponse
            return Promise.resolve({ toString: () => res })
          }

          // Agent 4: Fact Checker
          if (sp.includes('fact-checking auditor')) {
            const res = mockFactCheckResponse
            return Promise.resolve({ toString: () => res })
          }

          // Agent 5: Relevance Evaluator
          if (sp.includes('alignment evaluator')) {
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
      mockConfig
    )
    // The optimizer mock returns Kubernetes in the first achievement
    const achievementsText = result.achievements.join(' ')
    expect(achievementsText).toContain('Kubernetes')
  })

  it('should handle invalid JSON from keyword extractor gracefully', async () => {
    const result = await tailorExperienceToJDGraph('INVALID_JSON', achievements, 'Pos', 'Org', 'JD', mockConfig)
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
    Agent.mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      systemPrompt,
      invoke: jest.fn().mockImplementation(() => {
        const sp = (systemPrompt || '').toLowerCase()
        if (sp.includes('integrity auditor')) {
          integrityCallCount++
          return Promise.resolve({
            toString: () =>
              integrityCallCount === 1
                ? 'CRITIQUE: [0]: Kubernetes not evidenced | Corrected: Deployed services to cloud'
                : 'APPROVED',
          })
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
        if (sp.includes('fact-checking auditor')) return Promise.resolve({ toString: () => 'APPROVED' })
        if (sp.includes('alignment evaluator')) return Promise.resolve({ toString: () => 'APPROVED' })
        return Promise.resolve({ toString: () => 'Tailored' })
      }),
    }))

    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      mockConfig
    )
    expect(integrityCallCount).toBe(2)
    expect(result).toBeDefined()
  })

  it('should exhaust integrity auditor max iterations and return last result', async () => {
    const { Agent } = jest.requireMock('@strands-agents/sdk') as {
      Agent: jest.Mock
    }
    Agent.mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      systemPrompt,
      invoke: jest.fn().mockImplementation(() => {
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
        if (sp.includes('fact-checking auditor')) return Promise.resolve({ toString: () => 'APPROVED' })
        if (sp.includes('alignment evaluator')) return Promise.resolve({ toString: () => 'APPROVED' })
        return Promise.resolve({ toString: () => 'Tailored' })
      }),
    }))

    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      mockConfig
    )
    expect(result).toBeDefined()
    expect(result.achievements.length).toBeGreaterThan(0)
  })

  it('should handle fact check refinement', async () => {
    mockFactCheckResponse = 'CRITIQUE: Factual error in metrics'
    const result = await tailorExperienceToJDGraph('Desc', achievements, 'Pos', 'Org', 'JD', mockConfig)
    expect(result).toBeDefined()
    expect(result.description).toBeDefined()
  })

  it('should handle relevance enhancement', async () => {
    mockRelevanceResponse = 'CRITIQUE: Low relevance to JD'
    const result = await tailorExperienceToJDGraph('Desc', achievements, 'Pos', 'Org', 'JD', mockConfig)
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
      mockConfig,
      onProgress as Parameters<typeof tailorExperienceToJDGraph>[6]
    )

    expect(progressMessages).toContain('Analyzing job requirements and experience fit...')
    expect(progressMessages).toContain('Tailoring description to job requirements...')
    expect(progressMessages).toContain('Extracting JD keywords for ATS optimization...')
    expect(progressMessages).toContain('Classifying keyword injection eligibility...')
    expect(progressMessages).toContain('Enriching achievements with relevant keywords...')
    expect(progressMessages).toContain('Auditing achievement keyword integrity...')
    expect(progressMessages).toContain('Validating factual accuracy...')
    expect(progressMessages).toContain('Evaluating alignment quality...')
    expect(progressMessages).toContain('Experience tailored!')
  })

  it('should handle classifier returning invalid JSON gracefully', async () => {
    const { Agent } = jest.requireMock('@strands-agents/sdk') as {
      Agent: jest.Mock
    }
    Agent.mockImplementation(({ systemPrompt }: { systemPrompt: string }) => ({
      systemPrompt,
      invoke: jest.fn().mockImplementation(() => {
        const sp = (systemPrompt || '').toLowerCase()
        if (sp.includes('keyword injection auditor') || sp.includes('enrichment classifier'))
          return Promise.resolve({ toString: () => 'NOT_VALID_JSON' })
        if (sp.includes('alignment analyst')) return Promise.resolve({ toString: () => 'Analysis' })
        if (sp.includes('resume writer')) return Promise.resolve({ toString: () => 'Tailored description' })
        if (sp.includes('keyword extraction specialist'))
          return Promise.resolve({
            toString: () =>
              '{"missingKeywords":["Kubernetes"],"criticalKeywords":["Kubernetes"],"niceToHaveKeywords":[]}',
          })
        if (sp.includes('keyword enrichment capability'))
          return Promise.resolve({ toString: () => 'Achievement A\nAchievement B' })
        if (sp.includes('integrity auditor')) return Promise.resolve({ toString: () => 'APPROVED' })
        if (sp.includes('fact-checking auditor')) return Promise.resolve({ toString: () => 'APPROVED' })
        if (sp.includes('alignment evaluator')) return Promise.resolve({ toString: () => 'APPROVED' })
        return Promise.resolve({ toString: () => 'Tailored' })
      }),
    }))

    // Should not throw; falls back to no seed enrichment
    const result = await tailorExperienceToJDGraph(
      'Built backend services',
      achievements,
      'DevOps Engineer',
      'Acme Corp',
      'Requires Kubernetes',
      mockConfig
    )
    expect(result).toBeDefined()
    expect(result.achievements.length).toBeGreaterThan(0)
  })
})
