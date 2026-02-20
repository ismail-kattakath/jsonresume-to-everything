import { analyzeJobDescriptionGraph } from '@/lib/ai/strands/jd-refinement-graph'
import { AgentConfig } from '@/lib/ai/strands/types'
import { Agent } from '@strands-agents/sdk'

// Mock the Strands SDK
jest.mock('@strands-agents/sdk', () => {
  return {
    Agent: jest.fn().mockImplementation(() => ({
      invoke: jest.fn(),
      stream: jest.fn(),
    })),
    Model: jest.fn(),
  }
})

jest.mock('@strands-agents/sdk/openai', () => {
  return {
    OpenAIModel: jest.fn().mockImplementation(() => ({})),
  }
})

jest.mock('@strands-agents/sdk/gemini', () => {
  return {
    GeminiModel: jest.fn().mockImplementation(() => ({})),
  }
})

describe('JD Refinement', () => {
  const mockConfig: AgentConfig = {
    apiUrl: 'http://localhost:1234/v1',
    apiKey: 'test-key',
    model: 'test-model',
    providerType: 'openai-compatible',
  }

  const mockJD = 'Looking for a Senior React Developer with experience in Next.js.'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('analyzeJobDescriptionGraph', () => {
    it('refines and returns JD if approved immediately', async () => {
      const mockRefinedJD =
        '# position-title\nSenior React Developer\n\n# core-responsibilities\n- Build UI\n\n# desired-qualifications\n- 5 years exp\n\n# required-skills\n- React, TypeScript'
      const mockRefinerInvoke = jest.fn().mockResolvedValue({ toString: () => mockRefinedJD })
      const mockReviewerInvoke = jest.fn().mockResolvedValue({ toString: () => 'APPROVED: Highly professional' })

      let agentCount = 0
      ;(Agent as jest.Mock).mockImplementation(() => {
        agentCount++
        return {
          invoke: agentCount === 1 ? mockRefinerInvoke : mockReviewerInvoke,
        }
      })

      const onProgress = jest.fn()
      const result = await analyzeJobDescriptionGraph(mockJD, mockConfig, onProgress)

      expect(Agent).toHaveBeenCalledTimes(2) // Refiner and Reviewer
      expect(mockRefinerInvoke).toHaveBeenCalled()
      expect(mockReviewerInvoke).toHaveBeenCalledWith(expect.stringContaining('# position-title'))

      expect(result).toBe(mockRefinedJD)
    })

    it('iterates if reviewer provides critiques', async () => {
      const mockRefiner1Value = { toString: () => 'JD V1' }
      const mockRefiner2Value = { toString: () => 'JD V2' }
      const mockReviewer1Value = { toString: () => 'CRITIQUE: Too short' }
      const mockReviewer2Value = { toString: () => 'APPROVED' }

      const mockRefineInvoke = jest
        .fn()
        .mockResolvedValueOnce(mockRefiner1Value)
        .mockResolvedValueOnce(mockRefiner2Value)

      const mockReviewInvoke = jest
        .fn()
        .mockResolvedValueOnce(mockReviewer1Value)
        .mockResolvedValueOnce(mockReviewer2Value)

      let agentCount = 0
      ;(Agent as jest.Mock).mockImplementation(() => {
        agentCount++
        return {
          invoke: agentCount === 1 ? mockRefineInvoke : mockReviewInvoke,
        }
      })

      const result = await analyzeJobDescriptionGraph(mockJD, mockConfig)

      expect(mockRefineInvoke).toHaveBeenCalledTimes(2)
      expect(mockReviewInvoke).toHaveBeenCalledTimes(2)
      expect(mockRefineInvoke).toHaveBeenLastCalledWith(expect.stringContaining('CRITIQUE: Too short'))
      expect(result).toBe('JD V2')
    })

    it('stops at max iterations', async () => {
      const mockRefineInvoke = jest.fn().mockResolvedValue({ toString: () => 'Always Same' })
      const mockReviewInvoke = jest.fn().mockResolvedValue({ toString: () => 'CRITIQUE: Loop' })

      let agentCount = 0
      ;(Agent as jest.Mock).mockImplementation(() => {
        agentCount++
        return {
          invoke: agentCount === 1 ? mockRefineInvoke : mockReviewInvoke,
        }
      })

      const result = await analyzeJobDescriptionGraph(mockJD, mockConfig)

      expect(mockRefineInvoke).toHaveBeenCalledTimes(3)
      expect(mockReviewInvoke).toHaveBeenCalledTimes(3)
      expect(result).toBe('Always Same')
    })
  })
})
