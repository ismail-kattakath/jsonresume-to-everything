import { sortTechStackGraph } from '../techStackSorting'
import { Agent } from '@strands-agents/sdk'

// Mock the Agent class and createModel
jest.mock('@strands-agents/sdk')
jest.mock('../factory', () => ({
    createModel: jest.fn(),
}))

describe('sortTechStackGraph', () => {
    const mockTechnologies = ['React', 'Node.js', 'PostgreSQL']
    const mockJD = 'Looking for a React developer with Node.js experience.'
    const mockConfig: any = { apiUrl: 'test', apiKey: 'test', model: 'test', providerType: 'openai-compatible' }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('successfully sorts technologies on the first attempt', async () => {
        // Optimizer: Report
        const mockReport = '1. React (JD focus)\n2. Node.js (JD secondary)\n3. PostgreSQL (Generic)'
        // Scribe: JSON
        const mockJson = '["React", "Node.js", "PostgreSQL"]'
        // Editor: APPROVED
        const mockApproval = 'APPROVED'

        const mockInvoke = jest.fn()
            .mockResolvedValueOnce(mockReport)   // Brain
            .mockResolvedValueOnce(mockJson)     // Scribe
            .mockResolvedValueOnce(mockApproval) // Editor

            ; (Agent as jest.Mock).mockImplementation(() => ({
                invoke: mockInvoke,
            }))

        const result = await sortTechStackGraph(mockTechnologies, mockJD, mockConfig)

        expect(result).toEqual(['React', 'Node.js', 'PostgreSQL'])
        expect(mockInvoke).toHaveBeenCalledTimes(3)
    })

    it('retries when validation fails and eventually succeeds', async () => {
        // Optimizer: Report
        const mockReport = 'Reordered: Node, React, SQL'
        // Scribe Attempt 1: (Missing PostgreSQL)
        const mockJson1 = '["Node.js", "React"]'
        // Editor Critique 1:
        const mockCritique = 'CRITIQUE: Missing PostgreSQL'
        // Scribe Attempt 2: (Full list)
        const mockJson2 = '["Node.js", "React", "PostgreSQL"]'
        // Editor Approval:
        const mockApproval = 'APPROVED'

        const mockInvoke = jest.fn()
            .mockResolvedValueOnce(mockReport)   // Brain
            .mockResolvedValueOnce(mockJson1)    // Scribe 1
            .mockResolvedValueOnce(mockCritique) // Editor 1
            .mockResolvedValueOnce(mockJson2)    // Scribe 2
            .mockResolvedValueOnce(mockApproval) // Editor 2

            ; (Agent as jest.Mock).mockImplementation(() => ({
                invoke: mockInvoke,
            }))

        const result = await sortTechStackGraph(mockTechnologies, mockJD, mockConfig)

        expect(result).toEqual(['Node.js', 'React', 'PostgreSQL'])
        expect(mockInvoke).toHaveBeenCalledTimes(5) // Brain + Scribe1 + Editor1 + Scribe2 + Editor2
    })

    it('returns original list if all attempts fail to produce valid JSON', async () => {
        const mockInvoke = jest.fn()
            .mockResolvedValue('Garbage response')

            ; (Agent as jest.Mock).mockImplementation(() => ({
                invoke: mockInvoke,
            }))

        const result = await sortTechStackGraph(mockTechnologies, mockJD, mockConfig)

        expect(result).toEqual(mockTechnologies)
    })
})
