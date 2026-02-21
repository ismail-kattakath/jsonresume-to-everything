import { validateJsonTool } from '../tools/validate-json.tool'

jest.mock('@strands-agents/sdk', () => ({
    tool: jest.fn().mockImplementation((config) => config),
}))

describe('validateJsonTool', () => {
    it('should return valid true and parsed object for valid JSON', () => {
        const input = { json_string: '{"foo": "bar", "count": 42}' }
        const result = JSON.parse((validateJsonTool as any).callback(input))

        expect(result.valid).toBe(true)
        expect(result.parsed).toEqual({ foo: 'bar', count: 42 })
    })

    it('should return valid false and error message for invalid JSON', () => {
        const input = { json_string: '{foo: "bar"}' } // Missing quotes around key
        const result = JSON.parse((validateJsonTool as any).callback(input))

        expect(result.valid).toBe(false)
        expect(result.error).toContain('SyntaxError')
    })
})
