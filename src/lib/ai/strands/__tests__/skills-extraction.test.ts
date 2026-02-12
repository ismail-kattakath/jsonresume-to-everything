import { extractSkillsGraph } from '../skills-extraction'
import { Agent } from '@strands-agents/sdk'

// Mock the Strands SDK
jest.mock('@strands-agents/sdk', () => {
    return {
        Agent: jest.fn().mockImplementation(() => ({
            invoke: jest.fn(),
            stream: jest.fn(),
        })),
    }
})

jest.mock('@strands-agents/sdk/openai', () => {
    return {
        OpenAIModel: jest.fn().mockImplementation(() => ({})),
    }
})

describe('Skills Extraction', () => {
    const mockConfig = {
        apiUrl: 'http://localhost:1234/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerType: 'openai-compatible',
    } as any

    const mockJD = 'Looking for a React developer with Postgres experience.'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('extractSkillsGraph', () => {
        it('extracts and returns a comma-separated list of skills', async () => {
            const mockExtraction = 'React, Postgres'
            const mockToString = jest.fn().mockReturnValue(mockExtraction)
            const mockInvoke = jest.fn().mockResolvedValue({ toString: mockToString })

                ; (Agent as jest.Mock).mockImplementation(() => ({
                    invoke: mockInvoke,
                }))

            const onProgress = jest.fn()
            const result = await extractSkillsGraph(mockJD, mockConfig, onProgress)

            expect(Agent).toHaveBeenCalledTimes(1)
            expect(mockInvoke).toHaveBeenCalledWith(expect.stringContaining(mockJD))
            expect(result).toBe(mockExtraction)
            expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ content: '🎯 Extracting key skills from JD...' }))
        })
    })
})
