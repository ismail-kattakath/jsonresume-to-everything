import { createValidateSortOrderTool } from '../achievements-sorting/tools/validate-sort-order.tool'

jest.mock('@strands-agents/sdk', () => ({
    tool: jest.fn().mockImplementation((config) => config),
}))

describe('validateSortOrderTool', () => {
    const tool = createValidateSortOrderTool(5) // length 5 means indices 0-4

    it('should pass for valid sort order array', () => {
        const result = JSON.parse((tool as any).callback({ sort_order: JSON.stringify([4, 2, 0, 1, 3]) }))
        expect(result.valid).toBe(true)
        expect(result.issues).toHaveLength(0)
    })

    it('should fail if index is out of bounds', () => {
        const result = JSON.parse((tool as any).callback({ sort_order: JSON.stringify([5, 2, 0, 1, 3]) })) // 5 is too large
        expect(result.valid).toBe(false)
        expect(result.issues[0]).toContain('Missing or duplicate index')
    })

    it('should fail if index is missing', () => {
        const result = JSON.parse((tool as any).callback({ sort_order: JSON.stringify([4, 2, 0, 1]) })) // missing 3
        expect(result.valid).toBe(false)
        expect(result.issues[0]).toContain('Array has 4 elements, expected 5')
    })

    it('should fail if duplicate index exists', () => {
        const result = JSON.parse((tool as any).callback({ sort_order: JSON.stringify([4, 2, 0, 1, 1]) })) // duplicate 1
        expect(result.valid).toBe(false)
        expect(result.issues[0]).toContain('Missing or duplicate index')
    })
})
